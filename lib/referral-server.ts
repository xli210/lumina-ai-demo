import "server-only";
import { randomInt } from "node:crypto";
import { cookies } from "next/headers";

import { grantCredits } from "@/lib/credits-server";
import {
  REFERRAL_COOKIE,
  REFERRAL_FRIEND_CREDITS,
  REFERRAL_REWARD_CREDITS,
  isReferralCode,
} from "@/lib/referral";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Invite a friend (scripts/019).
 *
 *   1. An account gets an invite code the first time it looks at its account page.
 *   2. middleware.ts keeps a visitor's `?ref=<code>` in a cookie.
 *   3. When that visitor's new account receives its welcome credits
 *      (`ensureSignupGrant`), the account is linked to the inviter.
 *   4. When the linked account first pays for credits, the Stripe webhook pays
 *      both sides.
 *
 * Every step fails quietly: a missing table (migration 019 not applied) or a
 * database error must never block a signup or a purchase.
 */

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function newCode(): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

function isMissingTable(error: { code?: string }): boolean {
  return error.code === "42P01" || error.code === "PGRST205";
}

/** This account's invite code, made on first use. Null if referrals are not set up. */
export async function getOrCreateReferralCode(userId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (!isMissingTable(error)) console.error("[referral] read code failed:", error.message);
    return null;
  }
  if (data?.code) return String(data.code);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    const { error: insertError } = await supabase
      .from("referral_codes")
      .insert({ user_id: userId, code });
    if (!insertError) return code;
    if (insertError.code !== "23505") {
      console.error("[referral] create code failed:", insertError.message);
      return null;
    }
    // 23505: either the code is taken (try another) or this user got one in a
    // parallel request (read it back).
    const { data: again } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .maybeSingle();
    if (again?.code) return String(again.code);
  }
  return null;
}

/**
 * Link a brand-new account to whoever invited it, if this browser arrived
 * through an invite link. Called only when the account is being given its
 * welcome credits, so an existing account cannot be linked later and an
 * account refused free credits (a second account on one device or network)
 * is never linked.
 */
export async function recordReferralForNewAccount(userId: string): Promise<void> {
  try {
    const code = (await cookies()).get(REFERRAL_COOKIE)?.value;
    if (!isReferralCode(code)) return;

    const supabase = createAdminClient();
    const { data: owner, error } = await supabase
      .from("referral_codes")
      .select("user_id")
      .eq("code", code)
      .maybeSingle();
    if (error) {
      if (!isMissingTable(error)) console.error("[referral] code lookup failed:", error.message);
      return;
    }
    const referrerId = owner?.user_id ? String(owner.user_id) : null;
    if (!referrerId || referrerId === userId) return;

    const { error: insertError } = await supabase
      .from("referrals")
      .insert({ referred_user_id: userId, referrer_user_id: referrerId, code });
    if (insertError && insertError.code !== "23505") {
      console.error("[referral] link failed:", insertError.message);
    }
  } catch (err: unknown) {
    console.error("[referral] link failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Pay the invite reward when an invited account buys credits. Both grants are
 * keyed on the invited account, so a webhook redelivery, or a second purchase,
 * pays nothing more.
 */
export async function rewardReferralOnPurchase(
  userId: string,
  paymentIntentId: string
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("referrals")
      .select("referrer_user_id, rewarded_at")
      .eq("referred_user_id", userId)
      .maybeSingle();
    if (error) {
      if (!isMissingTable(error)) console.error("[referral] read failed:", error.message);
      return;
    }
    if (!data || data.rewarded_at) return;
    const referrerId = String(data.referrer_user_id);
    const reference = { reason: "referral", referred_user_id: userId, payment_intent_id: paymentIntentId };

    await grantCredits({
      userId: referrerId,
      amount: REFERRAL_REWARD_CREDITS,
      kind: "promo",
      idempotencyKey: `referral:${userId}:inviter`,
      reference,
    });
    await grantCredits({
      userId,
      amount: REFERRAL_FRIEND_CREDITS,
      kind: "promo",
      idempotencyKey: `referral:${userId}:friend`,
      reference: { ...reference, referrer_user_id: referrerId },
    });
    await supabase
      .from("referrals")
      .update({ rewarded_at: new Date().toISOString(), reward_payment_intent: paymentIntentId })
      .eq("referred_user_id", userId)
      .is("rewarded_at", null);
    console.log(`[referral] paid ${referrerId} for ${userId}`);
  } catch (err: unknown) {
    console.error("[referral] reward failed:", err instanceof Error ? err.message : err);
  }
}

export interface ReferralStats {
  signups: number;
  rewarded: number;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("referrals")
    .select("rewarded_at")
    .eq("referrer_user_id", userId)
    .limit(1000);
  if (error) return { signups: 0, rewarded: 0 };
  const rows = data ?? [];
  return { signups: rows.length, rewarded: rows.filter((r) => r.rewarded_at).length };
}
