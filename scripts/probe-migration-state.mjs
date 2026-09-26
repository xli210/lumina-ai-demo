#!/usr/bin/env node
/* global process, console */
/**
 * probe-migration-state.mjs
 *
 * Read-only check of which of migrations 007–011 have actually been applied
 * to the database the app is pointed at. Written because "the fix exists in
 * the repo" and "the fix is live" are different things, and for the
 * privilege-escalation fix in 008 the difference matters.
 *
 * Probes by asking for each object rather than by reading a migration
 * table, since this project applies migrations by hand in the SQL editor
 * and keeps no such table.
 *
 * Nothing here writes. The admin_* functions raise "not authorized" before
 * touching a row, because is_admin() is false when auth.uid() is null,
 * which is always the case for the service role.
 *
 * Usage:
 *   node scripts/probe-migration-state.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function stripQuotes(v) {
  if (v.length < 2) return v;
  const first = v[0];
  const last = v[v.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return v.slice(1, -1);
  }
  return v;
}

async function loadDotEnvLocal() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  let raw;
  try {
    raw = await readFile(join(scriptDir, "..", ".env.local"), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!(key in process.env)) {
      process.env[key] = stripQuotes(trimmed.slice(eq + 1).trim());
    }
  }
}

function isMissingFunction(error) {
  return (
    error.code === "PGRST202" || /could not find the function/i.test(error.message)
  );
}

function isMissingTable(error) {
  return (
    error.code === "42P01" ||
    /does not exist|could not find the table/i.test(error.message)
  );
}

/**
 * A request that never reached Postgres tells us nothing about the schema.
 * Treating it as "the object exists" — which is what any is-this-error-the-
 * missing-object-error check does by default — turns an unreachable database
 * into a clean bill of health, so connectivity failures abort instead.
 */
function isUnreachable(error) {
  return (
    error.message === "TypeError: fetch failed" ||
    /fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo|network/i.test(error.message)
  );
}

function assertReachable(error) {
  if (error && isUnreachable(error)) {
    console.error(
      `\nCannot reach the database: ${error.message}\n` +
        "Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — a\n" +
        "placeholder URL will produce this.\n"
    );
    process.exit(1);
  }
}

async function main() {
  await loadDotEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function hasFunction(name, args) {
    const { error } = await db.rpc(name, args);
    assertReachable(error);
    return error ? !isMissingFunction(error) : true;
  }

  async function hasTable(name) {
    const { error } = await db
      .from(name)
      .select("*", { head: true, count: "exact" })
      .limit(0);
    assertReachable(error);
    return error ? !isMissingTable(error) : true;
  }

  async function hasColumn(table, column) {
    const { error } = await db.from(table).select(column).limit(0);
    assertReachable(error);
    return !error;
  }

  // Fail fast rather than reporting nine misleading rows.
  const { error: reachError } = await db
    .from("profiles")
    .select("id", { head: true, count: "exact" })
    .limit(0);
  assertReachable(reachError);

  const checks = [
    ["007", "licenses.is_trial", await hasColumn("licenses", "is_trial")],
    [
      "007",
      "profiles.stripe_customer_id",
      await hasColumn("profiles", "stripe_customer_id"),
    ],
    [
      "008",
      "admin_set_user_role  <- the privilege-escalation fix",
      await hasFunction("admin_set_user_role", {
        p_user_id: NIL_UUID,
        p_role: "user",
      }),
    ],
    [
      "008",
      "admin_set_user_banned",
      await hasFunction("admin_set_user_banned", {
        p_user_id: NIL_UUID,
        p_banned: false,
      }),
    ],
    ["009", "credit_accounts", await hasTable("credit_accounts")],
    ["009", "credit_ledger", await hasTable("credit_ledger")],
    ["009", "credit_holds", await hasTable("credit_holds")],
    [
      "010",
      "credit_grant",
      await hasFunction("credit_grant", {
        p_user_id: NIL_UUID,
        p_amount: 0,
        p_kind: "promo",
        p_idempotency_key: "",
        p_reference: {},
      }),
    ],
    ["011", "stripe_events", await hasTable("stripe_events")],
  ];

  console.log(`\nDatabase: ${url}\n`);
  for (const [migration, label, present] of checks) {
    console.log(
      `  ${present ? "APPLIED    " : "NOT APPLIED"}  ${migration}  ${label}`
    );
  }

  const pending = [...new Set(checks.filter((c) => !c[2]).map((c) => c[0]))];
  console.log(
    pending.length === 0
      ? "\nAll of 007-011 are applied.\n"
      : `\nStill to run: ${pending.join(", ")}\n`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
