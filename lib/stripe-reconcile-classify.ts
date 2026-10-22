/**
 * Which of a payment's two possible deliveries to look for. Pure (no database,
 * no network), so the rule can be tested alone.
 *
 * A Stripe payment is one of two things:
 *  - a credit pack (checkout metadata `kind: "credit_topup"`). It never makes a
 *    license: the webhook writes a `purchase` entry to the credit ledger, keyed
 *    `stripe:<payment_intent>`. It was delivered if that entry exists.
 *  - an app purchase. The webhook writes a license row carrying the payment
 *    intent. It was delivered if that row exists.
 *
 * Judging a credit pack by whether it produced a license (what the admin page
 * did before) flags every credit purchase as "never received a license".
 */

export type PaymentKind = "license" | "credits";

/** The value the checkout sets in metadata.kind for a credit pack (app/actions/credits.ts). */
export const CREDIT_TOPUP_KIND = "credit_topup";

export interface DeliveryFacts {
  /** metadata.kind of the checkout session, when the session could be read. */
  metadataKind: string | null | undefined;
  /** The license key this payment produced, if any. */
  licenseKey: string | null;
  /** Credits the ledger granted for this payment as a `purchase`, if any. */
  creditsGranted: number | null;
}

export interface Delivery {
  kind: PaymentKind;
  delivered: boolean;
  licenseKey: string | null;
  creditsGranted: number | null;
}

export function classifyDelivery(f: DeliveryFacts): Delivery {
  // The ledger is the stronger evidence: a `purchase` entry for this payment
  // means it was a credit pack, whatever the session metadata says (or could not say).
  const isCredits = f.metadataKind === CREDIT_TOPUP_KIND || f.creditsGranted !== null;
  if (isCredits) {
    return {
      kind: "credits",
      delivered: f.creditsGranted !== null,
      licenseKey: f.licenseKey,
      creditsGranted: f.creditsGranted,
    };
  }
  return {
    kind: "license",
    delivered: f.licenseKey !== null,
    licenseKey: f.licenseKey,
    creditsGranted: null,
  };
}

/* ------------------------------------------------------------------ */
/* Revenue by source                                                  */
/* ------------------------------------------------------------------ */

export interface RevenuePayment {
  kind: PaymentKind;
  /** Collected, in cents. */
  amount: number;
  /** Stripe's fee on it, in cents, or null when Stripe could not say. */
  fee: number | null;
  /** Refunded so far, in cents. */
  refunded: number;
  /** The licence product bought (app purchases). */
  product_id: string | null;
  /** The credit pack bought (credit purchases). */
  pack_id: string | null;
  credits_granted: number | null;
}

export interface SourceTotals {
  count: number;
  gross: number;
  refunded: number;
  fees: number;
  /** False when at least one payment had no fee figure, so `fees` and `net` are low. */
  feesComplete: boolean;
  /** What is left after refunds and Stripe's fees. Before GPU, hosting and every other cost. */
  net: number;
  creditsGranted: number;
}

export interface RevenueBreakdown {
  credits: SourceTotals;
  license: SourceTotals;
  total: SourceTotals;
  byProduct: { id: string; count: number; gross: number; refunded: number; net: number }[];
  byPack: { id: string; count: number; gross: number; creditsGranted: number }[];
}

function emptyTotals(): SourceTotals {
  return { count: 0, gross: 0, refunded: 0, fees: 0, feesComplete: true, net: 0, creditsGranted: 0 };
}

function add(t: SourceTotals, p: RevenuePayment): void {
  t.count += 1;
  t.gross += p.amount;
  t.refunded += p.refunded;
  if (p.fee === null) t.feesComplete = false;
  else t.fees += p.fee;
  t.net += p.amount - p.refunded - (p.fee ?? 0);
  t.creditsGranted += p.credits_granted ?? 0;
}

/** Splits what Stripe collected into credit purchases and app (licence) purchases. */
export function summarizeRevenue(payments: readonly RevenuePayment[]): RevenueBreakdown {
  const credits = emptyTotals();
  const license = emptyTotals();
  const total = emptyTotals();
  const products = new Map<string, { id: string; count: number; gross: number; refunded: number; net: number }>();
  const packs = new Map<string, { id: string; count: number; gross: number; creditsGranted: number }>();

  for (const p of payments) {
    add(p.kind === "credits" ? credits : license, p);
    add(total, p);
    if (p.kind === "license") {
      const id = p.product_id ?? "unknown";
      const row = products.get(id) ?? { id, count: 0, gross: 0, refunded: 0, net: 0 };
      row.count += 1;
      row.gross += p.amount;
      row.refunded += p.refunded;
      row.net += p.amount - p.refunded - (p.fee ?? 0);
      products.set(id, row);
    } else {
      const id = p.pack_id ?? "unknown";
      const row = packs.get(id) ?? { id, count: 0, gross: 0, creditsGranted: 0 };
      row.count += 1;
      row.gross += p.amount;
      row.creditsGranted += p.credits_granted ?? 0;
      packs.set(id, row);
    }
  }

  return {
    credits,
    license,
    total,
    byProduct: [...products.values()].sort((a, b) => b.gross - a.gross),
    byPack: [...packs.values()].sort((a, b) => b.gross - a.gross),
  };
}
