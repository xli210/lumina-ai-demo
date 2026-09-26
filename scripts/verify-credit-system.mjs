#!/usr/bin/env node
/* global process, console, setTimeout */
/**
 * verify-credit-system.mjs
 *
 * End-to-end check of the credit ledger against a real database. Phase 1 of
 * the credit system has no UI, so this script is how you know it works.
 *
 * It creates a throwaway user, drives every credit function through the
 * cases that actually matter — replayed grants, insufficient funds, settling
 * below and above the estimate, releasing a failed job, a chargeback that
 * pushes the balance negative, the expiry sweeper — and then asserts the one
 * invariant the whole design rests on:
 *
 *     SUM(credit_ledger.amount) == credit_accounts.balance
 *
 * It also verifies that migration 008 actually closed the privilege
 * escalation on public.profiles, by signing in as the throwaway user with
 * the anon key and trying to promote them to admin.
 *
 * The test user is deleted at the end, which cascades to every credit row.
 *
 * Prereqs (env vars, most easily via .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * Requires migrations 007–011 to have been applied.
 *
 * Usage:
 *   node scripts/verify-credit-system.mjs
 *
 * Exit code:
 *   0  every assertion passed
 *   1  any assertion failed (a summary is printed)
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */

function stripQuotes(v) {
  if (v.length < 2) return v;
  const first = v[0];
  const last = v[v.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return v.slice(1, -1);
  }
  return v;
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq === -1) return null;
  return {
    key: trimmed.slice(0, eq).trim(),
    val: stripQuotes(trimmed.slice(eq + 1).trim()),
  };
}

// Load .env.local without requiring a dotenv dependency.
async function loadDotEnvLocal() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const envPath = join(scriptDir, "..", ".env.local");
  let raw;
  try {
    raw = await readFile(envPath, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const parsed = parseEnvLine(line);
    if (parsed && !(parsed.key in process.env)) {
      process.env[parsed.key] = parsed.val;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Assertions                                                          */
/* ------------------------------------------------------------------ */

const results = [];

function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
  const mark = passed ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function checkEqual(name, actual, expected) {
  check(
    name,
    actual === expected,
    actual === expected ? "" : `expected ${expected}, got ${actual}`
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

const SERVICE = "verify-script";

async function main() {
  await loadDotEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Set them in .env.local or the environment."
    );
    process.exit(1);
  }

  const db = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // --- throwaway user -------------------------------------------------
  const email = `credit-verify-${Date.now()}@example.invalid`;
  const password = `pw-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  const { data: created, error: createError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created?.user) {
    console.error(`Could not create test user: ${createError?.message}`);
    process.exit(1);
  }

  const userId = created.user.id;
  console.log(`\nTest user: ${email}\n         : ${userId}\n`);

  let exitCode = 0;
  try {
    await runLedgerChecks(db, userId);
    if (anonKey) {
      await runPrivilegeChecks(url, anonKey, db, userId, email, password);
    } else {
      check(
        "profiles privilege escalation is closed",
        false,
        "skipped: NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
      );
    }
  } catch (err) {
    check("script ran to completion", false, err.message);
  } finally {
    const { error: deleteError } = await db.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.log(
        `\nWARNING: could not delete test user ${userId}: ${deleteError.message}`
      );
    } else {
      // credit_accounts and credit_holds cascade away; the ledger rows do
      // not, by design. They are harmless, but here is how to clear them.
      console.log(
        `\nTest user deleted. Its ledger rows are retained by design; to clear:\n` +
          `  ALTER TABLE public.credit_ledger DISABLE TRIGGER credit_ledger_no_update_delete;\n` +
          `  DELETE FROM public.credit_ledger WHERE user_id = '${userId}';\n` +
          `  ALTER TABLE public.credit_ledger ENABLE TRIGGER credit_ledger_no_update_delete;`
      );
    }
  }

  // --- summary --------------------------------------------------------
  const failed = results.filter((r) => !r.passed);
  console.log(
    `\n${results.length - failed.length}/${results.length} checks passed.`
  );
  if (failed.length > 0) {
    console.log("\nFailures:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    exitCode = 1;
  }
  process.exit(exitCode);
}

async function rpc(db, fn, args) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data;
}

async function runLedgerChecks(db, userId) {
  console.log("Ledger behaviour");

  // 1. A plain grant.
  const grant = await rpc(db, "credit_grant", {
    p_user_id: userId,
    p_amount: 1000,
    p_kind: "purchase",
    p_idempotency_key: `verify:${userId}:grant-1`,
    p_reference: { source: "verify-script" },
  });
  checkEqual("grant of 1000 applies", grant.applied, true);
  checkEqual("balance after grant", grant.balance, 1000);
  checkEqual("available after grant", grant.available, 1000);

  // 2. The same grant again. This is the Stripe-redelivery case, and the
  //    thing that must never mint a second 1000 credits.
  const replay = await rpc(db, "credit_grant", {
    p_user_id: userId,
    p_amount: 1000,
    p_kind: "purchase",
    p_idempotency_key: `verify:${userId}:grant-1`,
    p_reference: { source: "verify-script" },
  });
  checkEqual("replayed grant is a no-op", replay.applied, false);
  checkEqual("balance unchanged by replay", replay.balance, 1000);

  // 3. Reserving moves credits out of `available` but not out of `balance`.
  const hold1 = await rpc(db, "credit_hold", {
    p_user_id: userId,
    p_amount: 300,
    p_service: SERVICE,
    p_job_ref: null,
    p_ttl_seconds: 3600,
    p_estimate: { note: "first hold" },
  });
  checkEqual("hold of 300 succeeds", hold1.ok, true);
  checkEqual("balance untouched by hold", hold1.balance, 1000);
  checkEqual("held reflects the reservation", hold1.held, 300);
  checkEqual("available excludes the hold", hold1.available, 700);

  // 4. Over-spending is an ordinary outcome, reported not raised.
  const tooBig = await rpc(db, "credit_hold", {
    p_user_id: userId,
    p_amount: 800,
    p_service: SERVICE,
    p_job_ref: null,
    p_ttl_seconds: 3600,
    p_estimate: {},
  });
  checkEqual("hold beyond available is refused", tooBig.ok, false);
  checkEqual("refusal names the reason", tooBig.reason, "insufficient_credits");
  checkEqual("refusal quotes the shortfall", tooBig.shortfall, 100);

  // 5. Settling below the estimate charges the real cost and frees the rest.
  const capture1 = await rpc(db, "credit_capture", {
    p_hold_id: hold1.hold_id,
    p_actual_amount: 250,
    p_reference: { frames: 100 },
  });
  checkEqual("capture charges the metered amount", capture1.charged, 250);
  checkEqual("balance drops by the charge", capture1.balance, 750);
  checkEqual("the whole hold is freed", capture1.held, 0);

  // 6. A polling client that sees the terminal state twice must not double-bill.
  const capture1Again = await rpc(db, "credit_capture", {
    p_hold_id: hold1.hold_id,
    p_actual_amount: 250,
    p_reference: {},
  });
  checkEqual("re-capturing a settled hold is a no-op", capture1Again.applied, false);
  checkEqual("balance unchanged by re-capture", capture1Again.balance, 750);

  // 7. A failed job costs nothing.
  const hold2 = await rpc(db, "credit_hold", {
    p_user_id: userId,
    p_amount: 200,
    p_service: SERVICE,
    p_job_ref: `${SERVICE}-job-2`,
    p_ttl_seconds: 3600,
    p_estimate: {},
  });
  const released = await rpc(db, "credit_release", {
    p_hold_id: hold2.hold_id,
    p_reason: "verify: simulated job failure",
    p_status: "released",
  });
  checkEqual("release returns the reservation", released.held, 0);
  checkEqual("release charges nothing", released.balance, 750);

  // 8. Metering above the estimate is capped: the user was quoted a number
  //    before submitting, so the overage is absorbed rather than billed.
  const hold3 = await rpc(db, "credit_hold", {
    p_user_id: userId,
    p_amount: 100,
    p_service: SERVICE,
    p_job_ref: `${SERVICE}-job-3`,
    p_ttl_seconds: 3600,
    p_estimate: {},
  });
  const capture3 = await rpc(db, "credit_capture", {
    p_hold_id: hold3.hold_id,
    p_actual_amount: 500,
    p_reference: {},
  });
  checkEqual("overrun is clamped to the reservation", capture3.charged, 100);
  checkEqual("balance after clamped capture", capture3.balance, 650);

  // 9. A chargeback after the credits were spent. The debt is recorded
  //    rather than written off.
  const reversal = await rpc(db, "credit_reverse", {
    p_user_id: userId,
    p_amount: 1000,
    p_idempotency_key: `verify:${userId}:reversal-1`,
    p_reference: { reason: "verify: simulated chargeback" },
  });
  checkEqual("reversal applies", reversal.applied, true);
  checkEqual("balance goes negative", reversal.balance, -350);

  // 10. A negative balance blocks further spending without a special rule,
  //     because available is negative too.
  const whileNegative = await rpc(db, "credit_hold", {
    p_user_id: userId,
    p_amount: 50,
    p_service: SERVICE,
    p_job_ref: null,
    p_ttl_seconds: 3600,
    p_estimate: {},
  });
  checkEqual("negative balance blocks new holds", whileNegative.ok, false);

  // 11. The ledger is append-only even for the service role, which bypasses
  //     RLS. This is what lets it be trusted as an audit log.
  const { error: updateError } = await db
    .from("credit_ledger")
    .update({ amount: 999999 })
    .eq("user_id", userId);
  check(
    "ledger rejects UPDATE from the service role",
    Boolean(updateError),
    updateError ? "" : "the update succeeded — the trigger is missing"
  );

  const { error: deleteError } = await db
    .from("credit_ledger")
    .delete()
    .eq("user_id", userId);
  check(
    "ledger rejects DELETE from the service role",
    Boolean(deleteError),
    deleteError ? "" : "the delete succeeded — the trigger is missing"
  );

  // 12. Reconciliation. If this ever fails, the materialised balance has
  //     drifted from the ledger and every number in the product is suspect.
  const { data: entries, error: entriesError } = await db
    .from("credit_ledger")
    .select("amount")
    .eq("user_id", userId);
  if (entriesError) throw new Error(`reading ledger: ${entriesError.message}`);

  const ledgerSum = entries.reduce((total, row) => total + row.amount, 0);
  const state = await rpc(db, "credit_account_state", { p_user_id: userId });
  checkEqual("SUM(ledger) equals the materialised balance", ledgerSum, state.balance);

  // 13. The sweeper frees reservations nothing ever settled.
  await rpc(db, "credit_grant", {
    p_user_id: userId,
    p_amount: 500,
    p_kind: "promo",
    p_idempotency_key: `verify:${userId}:grant-2`,
    p_reference: {},
  });
  const doomed = await rpc(db, "credit_hold", {
    p_user_id: userId,
    p_amount: 100,
    p_service: SERVICE,
    p_job_ref: `${SERVICE}-job-abandoned`,
    p_ttl_seconds: 1,
    p_estimate: {},
  });
  checkEqual("hold created for the sweeper test", doomed.ok, true);

  await new Promise((resolve) => setTimeout(resolve, 1500));
  await rpc(db, "credit_release_expired_holds", { p_limit: 100 });

  const swept = await rpc(db, "credit_account_state", { p_user_id: userId });
  checkEqual("sweeper frees the abandoned reservation", swept.held, 0);
  checkEqual("sweeper charges nothing", swept.balance, 150);

  const { data: sweptHold } = await db
    .from("credit_holds")
    .select("status")
    .eq("id", doomed.hold_id)
    .single();
  checkEqual("abandoned hold is marked expired", sweptHold?.status, "expired");
}

async function runPrivilegeChecks(url, anonKey, db, userId, email, password) {
  console.log("\nprofiles write privileges (migration 008)");

  const asUser = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: signInError } = await asUser.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    check("test user can sign in", false, signInError.message);
    return;
  }

  // The hole migration 008 closes: profiles_update_own gates rows, not
  // columns, so before the fix this statement promoted the caller to admin.
  await asUser.from("profiles").update({ role: "admin" }).eq("id", userId);

  const { data: after } = await db
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  checkEqual("a user cannot promote themselves to admin", after?.role, "user");

  // The legitimate self-service edit must still work.
  const { error: nameError } = await asUser
    .from("profiles")
    .update({ display_name: "verified" })
    .eq("id", userId);
  check(
    "a user can still edit their own display name",
    !nameError,
    nameError?.message ?? ""
  );

  // Minting credits must be unreachable from a user session.
  const { error: rpcError } = await asUser.rpc("credit_grant", {
    p_user_id: userId,
    p_amount: 1000000,
    p_kind: "promo",
    p_idempotency_key: `verify:${userId}:escalation`,
    p_reference: {},
  });
  check(
    "a user cannot call credit_grant",
    Boolean(rpcError),
    rpcError ? "" : "the call succeeded — EXECUTE was not revoked"
  );

  await asUser.auth.signOut();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
