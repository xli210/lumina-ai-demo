/**
 * Shapes and derived figures for the admin credit dashboard.
 *
 * Isomorphic: the server reads these off the RPCs in migration 012 and the
 * page renders them. The derivations live here rather than in the page so the
 * definition of "revenue" is written down once.
 *
 * Everything is in credits. One credit is one US cent, so dividing by 100
 * gives dollars — see `creditsToUsd` in lib/credits.ts.
 */

import { CREDITS_PER_USD } from "@/lib/credits";

/** Ledger totals for a period. Spends are positive magnitudes here. */
export interface CreditTotals {
  purchased: number;
  bonus: number;
  promo: number;
  signup_grant: number;
  spent: number;
  reversed: number;
  renders: number;
  refunded?: number;
  admin_adjust?: number;
  entries?: number;
}

export interface CreditOutstanding {
  /** Credits sitting in accounts, unspent. This is a delivery obligation. */
  balance: number;
  /** Credits reserved by jobs still running. */
  held: number;
  accounts: number;
}

export interface CreditUserCounts {
  with_account: number;
  ever_purchased: number;
  ever_spent: number;
  spent_in_window: number;
  purchased_in_window: number;
}

export interface RendersByFunding {
  total: number;
  /** Renders by accounts that had never bought credits at that point. */
  by_never_paying_user: number;
}

export interface ServiceUsage {
  service: string;
  renders: number;
  credits: number;
}

export interface ModeUsage {
  mode: string;
  jobs: number;
  credits_reserved: number;
}

export interface HoldOutcomes {
  open: number;
  captured: number;
  released: number;
  expired: number;
}

export interface PackSales {
  pack_id: string;
  orders: number;
  credits: number;
}

export interface CreditSummary {
  window_days: number;
  generated_at: string;
  all_time: CreditTotals;
  window: CreditTotals;
  outstanding: CreditOutstanding;
  users: CreditUserCounts;
  renders_by_funding: RendersByFunding;
  by_service: ServiceUsage[];
  by_mode: ModeUsage[];
  holds: HoldOutcomes;
  by_pack: PackSales[];
}

export interface CreditDailyRow {
  day: string;
  purchased: number;
  bonus: number;
  promo: number;
  spent: number;
  renders: number;
  paying_users: number;
  spending_users: number;
}

export interface CreditTopUser {
  user_id: string;
  display_name: string | null;
  role: string | null;
  balance: number;
  held: number;
  lifetime_purchased: number;
  lifetime_spent: number;
  renders: number;
  first_seen: string | null;
  last_activity: string | null;
}

/* -------------------------------------------------------------------------- */
/* Derived figures                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Cash actually collected, in credits.
 *
 * `purchased` only — deliberately excluding `bonus`. A bonus credit was given
 * away, so counting it as revenue would overstate takings by the bonus rate
 * and make the margin look better than it is.
 */
export function revenueCredits(t: CreditTotals): number {
  return t.purchased;
}

export function revenueUsd(t: CreditTotals): number {
  return revenueCredits(t) / CREDITS_PER_USD;
}

/**
 * Credits handed out for nothing: the daily free allowance, welcome grants,
 * and pack bonuses. This is the free tier's cost expressed in the same unit
 * as revenue, which is the comparison worth having.
 */
export function givenAwayCredits(t: CreditTotals): number {
  return t.promo + t.signup_grant + t.bonus;
}

/**
 * Share of renders performed by accounts that had never paid.
 *
 * The number to watch on the free tier. High is fine early — it means people
 * are trying the thing. High *and* flat over months means the free tier is
 * the product rather than a funnel.
 */
export function freeRenderShare(r: RendersByFunding): number {
  if (r.total === 0) return 0;
  return r.by_never_paying_user / r.total;
}

/** Share of accounts that have ever bought credits. */
export function payingConversion(u: CreditUserCounts): number {
  if (u.with_account === 0) return 0;
  return u.ever_purchased / u.with_account;
}

/**
 * Average credits per paying account, in dollars. Rough ARPPU.
 */
export function revenuePerPayingUser(
  t: CreditTotals,
  u: CreditUserCounts
): number {
  if (u.ever_purchased === 0) return 0;
  return revenueUsd(t) / u.ever_purchased;
}

/**
 * How much of the money taken is still owed as unspent credits.
 *
 * Above 1 means more credits are outstanding than were ever bought, which is
 * normal while the free allowance dominates — it is the free tier showing up
 * as a liability. Worth watching rather than acting on.
 */
export function liabilityRatio(
  o: CreditOutstanding,
  t: CreditTotals
): number {
  const revenue = revenueCredits(t);
  if (revenue === 0) return 0;
  return (o.balance + o.held) / revenue;
}

/**
 * Share of reservations that ended without a charge.
 *
 * `released` is a failed render and `expired` is an abandoned one. Both are
 * refunded, so neither costs the user anything — but both cost us GPU time,
 * and a rising number is the earliest signal that the pipeline is degrading.
 */
export function unbilledRenderShare(h: HoldOutcomes): number {
  const settled = h.captured + h.released + h.expired;
  if (settled === 0) return 0;
  return (h.released + h.expired) / settled;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function fmtCredits(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function fmtUsd(credits: number): string {
  const dollars = credits / CREDITS_PER_USD;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}
