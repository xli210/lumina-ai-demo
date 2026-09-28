#!/usr/bin/env node
/**
 * One-off recovery for Stripe payments that never produced a license.
 *
 * Between March and September 2026 the webhook logged insert failures and
 * returned 200 anyway, so Stripe recorded a successful delivery and never
 * retried. Five live payments totalling $219.50 were collected without a
 * license being issued. Stripe only allows resending events for 30 days, so
 * all but the most recent are past automatic recovery and have to be issued
 * here.
 *
 * This mirrors `handleLicenseCheckout` in app/api/webhooks/stripe/route.ts
 * deliberately: same trial-upgrade-before-insert order, same key format,
 * same profile flag. A recovery that issues a *different* shape of license
 * than the real flow just moves the inconsistency somewhere harder to see.
 *
 * Safe to re-run. The UNIQUE constraint on stripe_payment_intent_id is the
 * backstop, but every payment is checked before writing so a second run
 * reports "already delivered" rather than erroring.
 *
 * The payment list is read from a file rather than kept here, because every
 * entry is customer data — email, account id, what they bought — and this
 * script is committed. scripts/.backfill-payments.json is gitignored.
 *
 * Each entry:
 *   payment_intent  the charge, and the idempotency key for this recovery
 *   user_id         checkout session metadata.supabase_user_id
 *   product_id      checkout session metadata.product_id
 *   amount_cents    report only, so a mismatch against the catalogue price
 *                   is visible before anything is written
 *   email           report only, so you know who to notify
 *
 * /admin/licenses lists all of these under "Paid but never delivered".
 *
 * Usage:
 *   node scripts/backfill-paid-licenses.mjs            # dry run, writes nothing
 *   node scripts/backfill-paid-licenses.mjs --apply    # actually issue
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "../lib/products.ts";

const PAYMENTS_FILE =
  process.env.BACKFILL_FILE ??
  new URL("./.backfill-payments.json", import.meta.url).pathname;

let PAYMENTS;
try {
  PAYMENTS = JSON.parse(readFileSync(PAYMENTS_FILE, "utf8"));
} catch (err) {
  console.error(
    `Could not read ${PAYMENTS_FILE}\n` +
      `${err.message}\n\n` +
      `Create it as a JSON array, for example:\n` +
      `[{"payment_intent":"pi_...","user_id":"...","product_id":"nano-facestudio-pro",` +
      `"amount_cents":4990,"email":"someone@example.com"}]`
  );
  process.exit(1);
}

if (!Array.isArray(PAYMENTS) || PAYMENTS.length === 0) {
  console.error(`${PAYMENTS_FILE} must be a non-empty JSON array.`);
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running."
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

/** Same alphabet and shape as the webhook: no I, O, 0, or 1. */
function generateLicenseKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let c = 0; c < 4; c++) segment += chars[crypto.randomInt(chars.length)];
    segments.push(segment);
  }
  return segments.join("-");
}

async function uniqueLicenseKey() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const key = generateLicenseKey();
    const { data } = await db
      .from("licenses")
      .select("id")
      .eq("license_key", key)
      .maybeSingle();
    if (!data) return key;
  }
  throw new Error("Could not generate a unique license key in 10 attempts");
}

async function recover(payment) {
  const product = PRODUCTS.find((p) => p.id === payment.product_id);
  if (!product) {
    return { state: "error", detail: `Unknown product ${payment.product_id}` };
  }

  if (product.priceInCents !== payment.amount_cents) {
    // Not fatal — prices change — but worth seeing before issuing anything.
    console.warn(
      `  ! ${payment.payment_intent}: paid ${payment.amount_cents} but ` +
        `${product.id} lists ${product.priceInCents}`
    );
  }

  const { data: already } = await db
    .from("licenses")
    .select("license_key")
    .eq("stripe_payment_intent_id", payment.payment_intent)
    .maybeSingle();

  if (already) {
    return { state: "already", key: already.license_key };
  }

  // Same order as the webhook: an existing trial is upgraded in place so the
  // customer keeps the key they may already have entered somewhere.
  const { data: trial } = await db
    .from("licenses")
    .select("id, license_key")
    .eq("user_id", payment.user_id)
    .eq("product_id", payment.product_id)
    .eq("is_trial", true)
    .eq("is_revoked", false)
    .maybeSingle();

  if (trial) {
    if (!APPLY) return { state: "would-upgrade", key: trial.license_key };

    const { error } = await db
      .from("licenses")
      .update({
        is_trial: false,
        trial_ends_at: null,
        stripe_payment_intent_id: payment.payment_intent,
      })
      .eq("id", trial.id);

    if (error) return { state: "error", detail: error.message };

    await db
      .from("profiles")
      .update({ has_purchased: true, updated_at: new Date().toISOString() })
      .eq("id", payment.user_id);

    return { state: "upgraded", key: trial.license_key };
  }

  if (!APPLY) return { state: "would-create", key: "(new key)" };

  const licenseKey = await uniqueLicenseKey();
  const { error } = await db.from("licenses").insert({
    user_id: payment.user_id,
    license_key: licenseKey,
    product_id: payment.product_id,
    max_activations: product.maxActivations,
    stripe_payment_intent_id: payment.payment_intent,
    is_trial: false,
    trial_ends_at: null,
  });

  if (error) return { state: "error", detail: `${error.code}: ${error.message}` };

  await db
    .from("profiles")
    .update({ has_purchased: true, updated_at: new Date().toISOString() })
    .eq("id", payment.user_id);

  return { state: "created", key: licenseKey };
}

console.log(
  APPLY
    ? "APPLYING — licenses will be written.\n"
    : "DRY RUN — nothing will be written. Re-run with --apply to issue.\n"
);

for (const payment of PAYMENTS) {
  const result = await recover(payment);
  const label = `${payment.email ?? payment.user_id} · ${payment.product_id}`;

  switch (result.state) {
    case "already":
      console.log(`  = ${label}\n      already delivered: ${result.key}`);
      break;
    case "would-upgrade":
      console.log(`  ~ ${label}\n      would upgrade existing trial ${result.key}`);
      break;
    case "would-create":
      console.log(`  + ${label}\n      would issue a new license`);
      break;
    case "upgraded":
      console.log(`  ✓ ${label}\n      trial upgraded: ${result.key}`);
      break;
    case "created":
      console.log(`  ✓ ${label}\n      issued: ${result.key}`);
      break;
    case "error":
      console.log(`  ✗ ${label}\n      FAILED: ${result.detail}`);
      break;
  }
}

console.log(
  APPLY
    ? "\nDone. Email each key to its customer — nothing notifies them automatically."
    : "\nDry run complete."
);
