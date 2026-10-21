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
