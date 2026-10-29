import "server-only";

import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { grantCredits } from "@/lib/credits-server";
import { stripeAutoBonusKey, stripeBonusKey, stripePaymentKey } from "@/lib/credits";
import {
  AUTO_RECHARGE_MAX_PER_DAY,
  AUTO_RECHARGE_MAX_PER_MONTH,
  AUTO_RECHARGE_MAX_THRESHOLD,
  autoRechargeExtraBonus,
  autoRechargeThreshold,
  findCreditPack,
} from "@/lib/credit-packs";

/**
 * Auto top-up: the opt-in that buys the same credit pack again when the balance runs low.
 *
 * The person agrees with a checkbox while buying a pack; that purchase saves the card with Stripe
 * (`setup_future_usage`) and the webhook calls `enableAutoRecharge`. After that, any job that
 * settles can call `maybeAutoRecharge`, which charges the saved card off-session for the same pack.
 *
 * What keeps it safe:
 *   - it is off unless the person asked for it, and they can turn it off on /credits at any time;
 *   - `auto_recharge_claim` (migration 018) allows one charge in 24 hours and three in 30 days,
 *     and records the attempt before the card is touched, so two jobs cannot charge twice;
 *   - a declined card, a bank asking for confirmation, or a dispute turns it off, so a problem
 *     card is never retried;
 *   - Stripe emails the receipt for every charge (`receipt_email`).
 *
 * Nothing in here throws into a job's settlement: the caller is a billing path, and a failed
 * auto top-up must never fail a job that already succeeded.
 */

export type AutoRechargeReason =
  | "user"
  | "card_declined"
  | "authentication_required"
  | "dispute"
  | "no_payment_method"
  | "other";

export interface AutoRecharge {
  packId: string;
  enabled: boolean;
  disabledReason: AutoRechargeReason | null;
}

const METADATA_KIND = "credit_topup";

/** A person's auto top-up setting, or null if they never turned it on. */
export async function getAutoRecharge(userId: string): Promise<AutoRecharge | null> {
  const { data, error } = await createAdminClient()
    .from("auto_recharge")
    .select("pack_id, enabled, disabled_reason")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Failed to read auto top-up: ${error.message}`);
  if (!data) return null;
  return {
    packId: data.pack_id,
    enabled: data.enabled === true,
    disabledReason: (data.disabled_reason as AutoRechargeReason | null) ?? null,
  };
}

/** Turn it on, or move it to a new pack and card. Called once the purchase that agreed to it has been paid. */
export async function enableAutoRecharge(params: {
  userId: string;
  packId: string;
  paymentMethodId: string;
  consentedAt: string;
  termsVersion: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await createAdminClient().from("auto_recharge").upsert(
    {
      user_id: params.userId,
      pack_id: params.packId,
      payment_method_id: params.paymentMethodId,
      enabled: true,
      consented_at: params.consentedAt,
      terms_version: params.termsVersion,
      disabled_reason: null,
      disabled_at: null,
      updated_at: now,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(`Failed to enable auto top-up: ${error.message}`);
}

export async function disableAutoRecharge(userId: string, reason: AutoRechargeReason): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("auto_recharge")
    .update({ enabled: false, disabled_reason: reason, disabled_at: now, updated_at: now })
    .eq("user_id", userId)
    .eq("enabled", true);
  if (error) throw new Error(`Failed to disable auto top-up: ${error.message}`);
}

/** A dispute on any payment from this Stripe customer turns their auto top-up off. */
export async function disableAutoRechargeForCustomer(customerId: string): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) throw new Error(`Failed to look up customer: ${error.message}`);
  if (data?.id) await disableAutoRecharge(data.id, "dispute");
}

async function settleAttempt(
  attemptId: string,
  status: "succeeded" | "failed",
  fields: { paymentIntentId?: string; failureCode?: string }
): Promise<void> {
  const { error } = await createAdminClient()
    .from("auto_recharge_attempts")
    .update({
      status,
      payment_intent_id: fields.paymentIntentId ?? null,
      failure_code: fields.failureCode ?? null,
      settled_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("status", "pending");
  if (error) console.error("[auto-recharge] could not settle attempt:", attemptId, error.message);
}

function whole(raw: string | undefined): number {
  const value = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

/**
 * Credit a paid auto top-up. Returns false for any payment that is not one.
 *
 * Both the charge itself and the `payment_intent.succeeded` webhook call this; the grants are keyed
 * on the payment intent, so whichever runs second changes nothing.
 */
export async function creditAutoRecharge(pi: Stripe.PaymentIntent): Promise<boolean> {
  const md = pi.metadata ?? {};
  if (md.kind !== METADATA_KIND || md.auto_recharge !== "1") return false;
  if (pi.status !== "succeeded") return false;

  const userId = md.supabase_user_id;
  if (!userId) throw new Error(`Auto top-up ${pi.id} has no supabase_user_id`);

  // As with a checkout, what was collected is a ceiling on what is granted.
  const base = Math.min(whole(md.base_credits), pi.amount_received);
  if (base <= 0) throw new Error(`Auto top-up ${pi.id} resolved to 0 credits`);
  const bonus = whole(md.bonus_credits);
  const extra = whole(md.auto_bonus_credits);

  const reference = {
    source: "stripe_auto_recharge",
    pack_id: md.pack_id ?? "unknown",
    payment_intent_id: pi.id,
    attempt_id: md.attempt_id ?? null,
    amount_total: pi.amount_received,
  };

  await grantCredits({
    userId,
    amount: base,
    kind: "purchase",
    idempotencyKey: stripePaymentKey(pi.id),
    reference,
  });
  if (bonus > 0) {
    await grantCredits({
      userId,
      amount: bonus,
      kind: "bonus",
      idempotencyKey: stripeBonusKey(pi.id),
      reference: { ...reference, bonus_for: md.pack_id },
    });
  }
  if (extra > 0) {
    await grantCredits({
      userId,
      amount: extra,
      kind: "bonus",
      idempotencyKey: stripeAutoBonusKey(pi.id),
      reference: { ...reference, bonus_for: "auto_recharge" },
    });
  }

  if (md.attempt_id) await settleAttempt(md.attempt_id, "succeeded", { paymentIntentId: pi.id });
  return true;
}

/** A failed auto top-up charge: record it, and stop trying if the card is the problem. */
export async function failAutoRecharge(pi: Stripe.PaymentIntent): Promise<boolean> {
  const md = pi.metadata ?? {};
  if (md.kind !== METADATA_KIND || md.auto_recharge !== "1") return false;

  const code = pi.last_payment_error?.code ?? pi.last_payment_error?.type ?? "unknown";
  if (md.attempt_id) await settleAttempt(md.attempt_id, "failed", { paymentIntentId: pi.id, failureCode: code });
  if (md.supabase_user_id) await disableAutoRecharge(md.supabase_user_id, reasonFor(code));
  return true;
}

function reasonFor(code: string | undefined): AutoRechargeReason {
  if (code === "authentication_required") return "authentication_required";
  if (code === "card_declined" || code === "expired_card" || code === "incorrect_cvc" || code === "insufficient_funds") {
    return "card_declined";
  }
  return "other";
}

/**
 * Call after a job settles with the balance now available. Buys the person's pack again if they
 * turned auto top-up on and the balance is below its threshold. Never throws.
 */
export async function maybeAutoRecharge(userId: string, available: number): Promise<void> {
  // The common case: a balance nobody would top up at. No database read.
  if (available >= AUTO_RECHARGE_MAX_THRESHOLD) return;

  try {
    const setting = await getAutoRecharge(userId);
    if (!setting?.enabled) return;
    const pack = findCreditPack(setting.packId);
    if (!pack || available >= autoRechargeThreshold(pack)) return;

    const admin = createAdminClient();
    const { data: claim, error: claimError } = await admin.rpc("auto_recharge_claim", {
      p_user_id: userId,
      p_amount_cents: pack.priceInCents,
      p_max_per_day: AUTO_RECHARGE_MAX_PER_DAY,
      p_max_per_month: AUTO_RECHARGE_MAX_PER_MONTH,
    });
    if (claimError) throw new Error(`auto_recharge_claim failed: ${claimError.message}`);
    const result = new Map(Object.entries((claim ?? {}) as Record<string, unknown>));
    if (result.get("claimed") !== true) {
      console.log(`[auto-recharge] ${userId} not charged: ${String(result.get("reason"))}`);
      return;
    }
    const attemptId = String(result.get("attempt_id"));
    const paymentMethodId = String(result.get("payment_method_id"));

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();
    const customerId = profile?.stripe_customer_id;
    if (typeof customerId !== "string" || customerId.length === 0) {
      await settleAttempt(attemptId, "failed", { failureCode: "no_customer" });
      await disableAutoRecharge(userId, "no_payment_method");
      return;
    }
    const email = (await admin.auth.admin.getUserById(userId)).data.user?.email;

    let pi: Stripe.PaymentIntent;
    try {
      pi = await getStripe().paymentIntents.create(
        {
          amount: pack.priceInCents,
          currency: "usd",
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          description: `NanoPocket auto top-up: ${pack.name} credits`,
          receipt_email: email,
          metadata: {
            kind: METADATA_KIND,
            auto_recharge: "1",
            pack_id: pack.id,
            supabase_user_id: userId,
            attempt_id: attemptId,
            base_credits: String(pack.priceInCents),
            bonus_credits: String(pack.bonusCredits),
            auto_bonus_credits: String(autoRechargeExtraBonus(pack)),
          },
        },
        { idempotencyKey: `auto-recharge:${attemptId}` }
      );
    } catch (err: unknown) {
      const e = err as { type?: string; code?: string; message?: string };
      const isCardProblem = e.type === "StripeCardError";
      await settleAttempt(attemptId, "failed", { failureCode: e.code ?? e.type ?? "unknown" });
      // A card that is declined or wants the bank's confirmation is not tried again. Anything else
      // (Stripe unreachable) leaves the setting on; the frequency limit still applies.
      if (isCardProblem) await disableAutoRecharge(userId, reasonFor(e.code));
      console.error("[auto-recharge] charge failed:", userId, e.code ?? e.type, e.message);
      return;
    }

    if (pi.status === "succeeded") {
      await creditAutoRecharge(pi);
      console.log(`[auto-recharge] ${userId} topped up ${pack.id} (${pi.id})`);
    } else if (pi.status === "processing") {
      // Still settling: leave the attempt pending and the setting on. The payment_intent.succeeded
      // webhook credits it, or payment_failed turns the setting off.
      console.log(`[auto-recharge] ${userId} charge ${pi.id} is processing`);
    } else {
      // requires_action and the like: off-session cannot ask the person, so stop.
      await settleAttempt(attemptId, "failed", { paymentIntentId: pi.id, failureCode: pi.status });
      await disableAutoRecharge(userId, "authentication_required");
      console.error("[auto-recharge] needs the person:", userId, pi.id, pi.status);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[auto-recharge] failed:", userId, message);
  }
}
