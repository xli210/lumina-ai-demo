import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/products";
import {
  beginStripeEvent,
  completeStripeEvent,
  grantCredits,
} from "@/lib/credits-server";
import { stripeBonusKey, stripePaymentKey } from "@/lib/credits";
import crypto from "crypto";

/** Postgres unique-violation. Here it means "someone already did this". */
const PG_UNIQUE_VIOLATION = "23505";

/** Marks a checkout session as a credit top-up rather than an app purchase. */
const CREDIT_TOPUP_KIND = "credit_topup";

function generateLicenseKey(): string {
  // Format: XXXX-XXXX-XXXX-XXXX (unambiguous uppercase alphanumeric)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let c = 0; c < 4; c++) {
      segment += chars[crypto.randomInt(chars.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

function sessionPaymentIntentId(
  session: Stripe.Checkout.Session
): string | null {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : (session.payment_intent?.id ?? null);
}

/** Parse a metadata string that must be a non-negative whole number. */
function parseCreditAmount(raw: string | undefined, label: string): number {
  const value = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Credit top-up has an invalid ${label}: ${String(raw)}`);
  }
  return value;
}

/**
 * Credit a completed top-up.
 *
 * Writes two ledger entries — what was paid for and what was thrown in
 * free — both keyed on the payment intent, so any number of redeliveries
 * of any of this payment's events collapse onto the same two grants.
 */
async function handleCreditTopup(
  session: Stripe.Checkout.Session
): Promise<void> {
  // An async payment method (bank debit, some wallets) completes the
  // session before the money arrives. Crediting now would be handing out
  // credits for a payment that can still fail; the later
  // checkout.session.async_payment_succeeded delivery is the one to act on.
  if (session.payment_status !== "paid") {
    console.log(
      `[Webhook] Top-up ${session.id} is ${session.payment_status}; waiting for payment`
    );
    return;
  }

  const paymentIntentId = sessionPaymentIntentId(session);
  if (!paymentIntentId) {
    throw new Error("Credit top-up has no payment intent to key the grant on");
  }

  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    // There is no email fallback here on purpose: credits live on an
    // account, and guessing which account would risk crediting the wrong
    // one. `startCreditCheckoutSession` refuses anonymous checkout, so
    // this only fires on a hand-made session.
    throw new Error("Credit top-up has no supabase_user_id in metadata");
  }

  const packId = session.metadata?.pack_id ?? "unknown";
  const soldCredits = parseCreditAmount(
    session.metadata?.base_credits,
    "base_credits"
  );
  const bonus = parseCreditAmount(
    session.metadata?.bonus_credits,
    "bonus_credits"
  );

  // Credits are one per cent, so the amount actually collected is a hard
  // ceiling on what may be granted. If a discount made the charge smaller
  // than the pack's list price, the smaller figure wins.
  const collected = session.amount_total ?? soldCredits;
  const base = Math.min(soldCredits, collected);

  if (base <= 0) {
    throw new Error(`Credit top-up ${paymentIntentId} resolved to 0 credits`);
  }

  const reference = {
    source: "stripe_checkout",
    pack_id: packId,
    session_id: session.id,
    payment_intent_id: paymentIntentId,
    amount_total: collected,
  };

  const purchase = await grantCredits({
    userId,
    amount: base,
    kind: "purchase",
    idempotencyKey: stripePaymentKey(paymentIntentId),
    reference,
  });

  if (bonus > 0) {
    await grantCredits({
      userId,
      amount: bonus,
      kind: "bonus",
      idempotencyKey: stripeBonusKey(paymentIntentId),
      reference: { ...reference, bonus_for: packId },
    });
  }

  console.log(
    `[Webhook] Top-up ${packId}: ${base}+${bonus} credits for ${userId}` +
      (purchase.applied ? "" : " (replay, no change)")
  );
}

/**
 * Grant or upgrade a license for a completed checkout.
 *
 * Throws on any failure it cannot prove is already-done, so the caller can
 * return a non-2xx and let Stripe retry. Before this route de-duplicated
 * events that was too dangerous to do — a retry would have issued a second
 * license — so failures were logged and swallowed, which meant a customer
 * could pay and silently receive nothing.
 */
async function handleLicenseCheckout(
  session: Stripe.Checkout.Session
): Promise<void> {
  // Same reasoning as the top-up branch: do not deliver anything for a
  // delayed payment until it clears. `no_payment_required` is a fully
  // discounted order, which is legitimately fulfilled.
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    console.log(
      `[Webhook] Session ${session.id} is ${session.payment_status}; waiting for payment`
    );
    return;
  }

  const paymentIntentId = sessionPaymentIntentId(session);
  const customerEmail = session.customer_details?.email;

  const supabase = createAdminClient();

  // Look up the Supabase user
  let userId: string | null = null;

  // Primary: use the supabase_user_id we pass in checkout session metadata
  const metadataUserId = session.metadata?.supabase_user_id;
  if (metadataUserId) {
    userId = metadataUserId;
  } else if (customerEmail) {
    // Fallback: scan users by email (slower, only if metadata missing)
    const { data } = await supabase.auth.admin.listUsers();
    const match = data?.users?.find((u) => u.email === customerEmail);
    if (match) userId = match.id;
    console.warn(
      "Webhook: supabase_user_id missing from metadata, fell back to email scan"
    );
  }

  // Determine product_id from session metadata or default
  const productId = session.metadata?.product_id || "nano-imageedit";

  // Look up product to get max_activations (default 1)
  const product = PRODUCTS.find((p) => p.id === productId);
  const maxActivations = product?.maxActivations ?? 1;

  // Check if user already has a trial license for this product — upgrade it
  if (userId) {
    const { data: existingTrial } = await supabase
      .from("licenses")
      .select("id, license_key")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("is_trial", true)
      .eq("is_revoked", false)
      .single();

    if (existingTrial) {
      // Upgrade trial → permanent license (keep same license key!)
      const { error: upgradeError } = await supabase
        .from("licenses")
        .update({
          is_trial: false,
          trial_ends_at: null,
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq("id", existingTrial.id);

      if (upgradeError) {
        throw new Error(
          `Failed to upgrade trial license: ${upgradeError.message}`
        );
      }

      console.log(
        `Trial license ${existingTrial.license_key} upgraded to permanent for ${customerEmail || userId}`
      );

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ has_purchased: true, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (profileError) {
        throw new Error(`Failed to flag profile: ${profileError.message}`);
      }

      return;
    }
  }

  // No existing trial — generate a brand-new permanent license
  let licenseKey = "";
  let keyIsUnique = false;
  for (let attempts = 0; attempts < 10; attempts++) {
    licenseKey = generateLicenseKey();
    const { data: existing } = await supabase
      .from("licenses")
      .select("id")
      .eq("license_key", licenseKey)
      .single();
    if (!existing) {
      keyIsUnique = true;
      break;
    }
  }

  if (!keyIsUnique) {
    throw new Error("Failed to generate unique license key after 10 attempts");
  }

  // Insert the permanent license
  const { error: insertError } = await supabase.from("licenses").insert({
    user_id: userId,
    license_key: licenseKey,
    product_id: productId,
    max_activations: maxActivations,
    stripe_payment_intent_id: paymentIntentId,
    is_trial: false,
    trial_ends_at: null,
  });

  if (insertError) {
    // stripe_payment_intent_id is UNIQUE, so this exact payment already
    // produced a license — most likely the trial-upgrade branch ran on an
    // earlier delivery and the trial no longer matches the lookup above.
    // Nothing left to do, and retrying would never succeed.
    if (insertError.code === PG_UNIQUE_VIOLATION) {
      console.log(
        `License for payment ${paymentIntentId} already exists; nothing to do`
      );
      return;
    }
    throw new Error(`Failed to create license: ${insertError.message}`);
  }

  if (userId) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ has_purchased: true, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (profileError) {
      throw new Error(`Failed to flag profile: ${profileError.message}`);
    }
  }

  console.log(`License ${licenseKey} created for ${customerEmail || "unknown"}`);
}

/**
 * Route a completed session to the right fulfilment.
 *
 * Dispatching on metadata rather than on the line items keeps the two
 * product lines from ever being confused: without the check, a credit
 * top-up would fall through to the license branch, which defaults an
 * absent `product_id` to nano-imageedit and would hand out a free app.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (session.metadata?.kind === CREDIT_TOPUP_KIND) {
    await handleCreditTopup(session);
    return;
  }
  await handleLicenseCheckout(session);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[Webhook] Event type:", event.type, "Event ID:", event.id);

  // Stripe retries until it gets a 2xx, so the same event arrives more than
  // once as a matter of course. Claim it before doing anything with side
  // effects; a delivery we do not win is acknowledged and dropped.
  let claimed: boolean;
  try {
    claimed = await beginStripeEvent({
      eventId: event.id,
      type: event.type,
      payload: event,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook] Could not claim event:", message);
    // Ask for a retry rather than processing an event we cannot de-duplicate.
    return NextResponse.json({ error: "Event log unavailable" }, { status: 500 });
  }

  if (!claimed) {
    console.log("[Webhook] Duplicate delivery, already handled:", event.id);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      // Fires when a delayed payment method finally clears. The
      // `completed` delivery for those sessions arrives unpaid and is
      // deliberately a no-op, so this is where the credits land.
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await handleCheckoutCompleted(event.data.object);
    }
    await completeStripeEvent(event.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook] Handler failed:", event.id, message);
    // Leave the event unprocessed so the next retry picks it up again.
    await completeStripeEvent(event.id, message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
