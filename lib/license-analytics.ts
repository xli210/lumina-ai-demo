/**
 * Shapes and derived figures for the admin license dashboard.
 *
 * The question this answers: of the licenses in the table, which ones
 * represent money?
 *
 * `stripe_payment_intent_id` is the only honest answer. The Stripe webhook is
 * its sole writer, it is set on both a fresh purchase and a trial upgrade,
 * and it carries a UNIQUE constraint so the same payment cannot mint two
 * licenses. Every other path — free claim, trial, admin test-grant — leaves
 * it NULL.
 *
 * Deliberately *not* used as a signal: `profiles.has_purchased`. Both the
 * claim flow and the purchase flow set it, so it counts giveaways as sales.
 */

import { PRODUCTS, type Product } from "@/lib/products";

/* -------------------------------------------------------------------------- */
/* RPC shapes — mirrors scripts/013_create_license_analytics.sql              */
/* -------------------------------------------------------------------------- */

/**
 * How a license came to exist.
 *
 * `granted` is intentionally coarse: SQL cannot tell a free-product claim
 * from a comped copy of a paid product, because that depends on the price,
 * and prices live in this repo rather than the database. `resolveOrigin`
 * below performs that split.
 */
export type LicenseOrigin =
  | "paid"
  | "trial_active"
  | "trial_expired"
  | "granted";

/** `granted` after the catalogue price is taken into account. */
export type ResolvedOrigin =
  | "paid"
  | "trial_active"
  | "trial_expired"
  /** Free product. Claiming it is the intended flow, not a giveaway. */
  | "free_claim"
  /** Paid product handed out without payment: a test-grant or a comp. */
  | "comped";

export interface LicenseTotals {
  licenses: number;
  paid: number;
  trial_active: number;
  trial_expired: number;
  granted: number;
  revoked: number;
  holders: number;
  paying_holders: number;
}

export interface LicenseProductRow {
  product_id: string;
  total: number;
  paid: number;
  trial_active: number;
  trial_expired: number;
  granted: number;
  revoked: number;
  holders: number;
  first_paid_at: string | null;
  last_paid_at: string | null;
  last_issued_at: string | null;
}

export interface PaidLicenseRow {
  license_key: string;
  product_id: string;
  user_id: string;
  display_name: string | null;
  stripe_payment_intent_id: string;
  is_revoked: boolean | null;
  created_at: string;
}

export interface OpenTrialRow {
  license_key: string;
  product_id: string;
  user_id: string;
  display_name: string | null;
  trial_ends_at: string;
  created_at: string;
}

export interface NeverActivated {
  paid: number;
  trial: number;
  granted: number;
  total: number;
}

export interface LicenseMonthRow {
  month: string;
  issued: number;
  paid: number;
}

export interface LicenseSummary {
  generated_at: string;
  totals: LicenseTotals;
  by_product: LicenseProductRow[];
  recent_paid: PaidLicenseRow[];
  trials_open: OpenTrialRow[];
  never_activated: NeverActivated;
  monthly: LicenseMonthRow[];
}

/* -------------------------------------------------------------------------- */
/* Catalogue join                                                             */
/* -------------------------------------------------------------------------- */

const BY_ID = new Map<string, Product>(PRODUCTS.map((p) => [p.id, p]));

export function findProduct(productId: string): Product | undefined {
  return BY_ID.get(productId);
}

/**
 * Splits `granted` using the product price.
 *
 * An unknown product_id is treated as free rather than comped. Retired
 * products that once cost money would otherwise be booked as ongoing
 * giveaways forever, which overstates the number that matters.
 */
export function resolveOrigin(
  origin: LicenseOrigin,
  productId: string
): ResolvedOrigin {
  if (origin !== "granted") return origin;
  const price = findProduct(productId)?.priceInCents ?? 0;
  return price > 0 ? "comped" : "free_claim";
}

/** A product row with everything the page needs to render one line. */
export interface EnrichedProductRow extends LicenseProductRow {
  name: string;
  priceInCents: number;
  /** Product ID present in the licenses table but absent from PRODUCTS. */
  orphaned: boolean;
  /** `granted` on a paid product: comped copies. */
  comped: number;
  /** `granted` on a free product: ordinary claims. */
  free_claims: number;
  /** Paid count × list price. See `estimatedRevenueCents`. */
  estimated_revenue_cents: number;
}

export function enrichProducts(
  rows: LicenseProductRow[]
): EnrichedProductRow[] {
  return rows.map((r) => {
    const product = findProduct(r.product_id);
    const price = product?.priceInCents ?? 0;
    const isPaidProduct = price > 0;

    return {
      ...r,
      name: product?.name ?? r.product_id,
      priceInCents: price,
      orphaned: product === undefined,
      comped: isPaidProduct ? r.granted : 0,
      free_claims: isPaidProduct ? 0 : r.granted,
      estimated_revenue_cents: r.paid * price,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Derived figures                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Revenue, estimated at today's list price.
 *
 * An estimate because the licenses table stores the payment intent but not
 * the amount. A price change, a coupon, or a trial-upgrade discount all make
 * this drift from what Stripe actually collected, so treat it as a scale
 * rather than a figure to reconcile against. Stripe is the ledger of record.
 */
export function estimatedRevenueCents(rows: EnrichedProductRow[]): number {
  return rows.reduce((sum, r) => sum + r.estimated_revenue_cents, 0);
}

/**
 * List value of paid products handed out for free.
 *
 * Mostly test-grants, so it is not lost revenue. It is worth a line because a
 * number climbing here means comps are being issued faster than they are
 * being tracked.
 */
export function compedValueCents(rows: EnrichedProductRow[]): number {
  return rows.reduce((sum, r) => sum + r.comped * r.priceInCents, 0);
}

/**
 * Share of finished trials that became purchases.
 *
 * Only over products that actually offer a trial, and only over trials that
 * have ended — an active trial has not decided yet, and counting it as a loss
 * would make the rate look worse every time someone new starts one.
 */
export function trialConversion(rows: EnrichedProductRow[]): {
  converted: number;
  decided: number;
  rate: number;
} {
  let converted = 0;
  let decided = 0;

  for (const r of rows) {
    if (r.priceInCents === 0) continue;
    if (r.trial_expired === 0 && r.paid === 0) continue;
    converted += r.paid;
    decided += r.paid + r.trial_expired;
  }

  return { converted, decided, rate: decided === 0 ? 0 : converted / decided };
}

/** Licenses that cost the holder nothing, by any route. */
export function freeLicenseCount(t: LicenseTotals): number {
  return t.licenses - t.paid;
}

export function paidShare(t: LicenseTotals): number {
  if (t.licenses === 0) return 0;
  return t.paid / t.licenses;
}

/** Product IDs issued at some point but no longer in the catalogue. */
export function orphanedProducts(
  rows: EnrichedProductRow[]
): EnrichedProductRow[] {
  return rows.filter((r) => r.orphaned);
}

/** Days remaining on a trial, floored at zero. */
export function daysLeft(trialEndsAt: string, now = Date.now()): number {
  const ms = new Date(trialEndsAt).getTime() - now;
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function fmtCount(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function fmtMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtShare(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

export const ORIGIN_LABELS: Record<ResolvedOrigin, string> = {
  paid: "Paid",
  trial_active: "Trial, active",
  trial_expired: "Trial, expired",
  free_claim: "Free claim",
  comped: "Comped",
};
