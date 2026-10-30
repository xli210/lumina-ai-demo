/**
 * Invite a friend: the shared constants.
 *
 * Kept apart from lib/referral-server.ts because middleware.ts reads the cookie
 * name and the code format, and middleware cannot import `server-only`.
 *
 * The reward is paid when the invited friend first buys credits, not when they
 * sign up: free credits at signup are what a person with many accounts farms,
 * and a purchase is real money (scripts/019).
 */

import { CREDITS_PER_USD } from "@/lib/credits";

/** Holds the invite code of whoever sent this browser here. */
export const REFERRAL_COOKIE = "np_ref";

/** How long an invite link counts after the click. */
export const REFERRAL_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 30;

/** What the inviter gets when the friend first buys credits. */
export const REFERRAL_REWARD_CREDITS = 200;

/** What the friend gets on top of their first purchase. */
export const REFERRAL_FRIEND_CREDITS = 100;

/** Dollars, for the copy that compares the reward with a pack. */
export const REFERRAL_REWARD_USD = REFERRAL_REWARD_CREDITS / CREDITS_PER_USD;

/** 8 characters of lowercase letters and digits (scripts/019 checks the same). */
export function isReferralCode(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]{8}$/.test(value);
}

export function referralLink(code: string): string {
  return `https://nanopocket.ai/?ref=${code}`;
}
