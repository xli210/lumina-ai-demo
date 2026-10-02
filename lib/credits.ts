/**
 * Credit system contract — safe to import from both client and server.
 *
 * The money rules live here so the browser, the API routes and the SQL
 * functions in scripts/009–010 all agree on the same units and vocabulary.
 * Nothing in this file touches the database or reads a secret.
 *
 * See docs/credit-system.md for the design and the reasoning behind it.
 */

/**
 * Credits are an integer currency: 1 credit = $0.01 USD.
 *
 * Everything is stored and arithmetic'd as whole credits — never dollars as
 * floats. `0.1 + 0.2 !== 0.3` is not an acceptable property for a balance,
 * and the ledger columns are BIGINT for the same reason.
 */
export const CREDITS_PER_USD = 100;

/**
 * Credits handed to a new account so it can try the services once. Paid out
 * at most once per person: see lib/free-claim.ts for how "person" is
 * approximated (one device, one network) and what that cannot catch.
 * Was 200; halved because a free grant with no condition was being collected
 * repeatedly.
 */
export const SIGNUP_GRANT_CREDITS = 100;

/**
 * How long a reservation survives without being settled. The sweeper
 * (`credit_release_expired_holds`) returns anything older than this.
 * An hour comfortably covers a cold start plus a long render — the VSR-Pro
 * doc puts a cold first job at 120–235 s wall.
 */
export const DEFAULT_HOLD_TTL_SECONDS = 3600;

/** Ledger entry kinds. Mirrors the `credit_entry_kind` enum in migration 009. */
export const CREDIT_ENTRY_KINDS = [
  "purchase",
  "bonus",
  "signup_grant",
  "promo",
  "spend",
  "refund",
  "reversal",
  "admin_adjust",
] as const;

export type CreditEntryKind = (typeof CREDIT_ENTRY_KINDS)[number];

/** Hold lifecycle. Mirrors the `credit_hold_status` enum in migration 009. */
export const CREDIT_HOLD_STATUSES = [
  "open",
  "captured",
  "released",
  "expired",
] as const;

export type CreditHoldStatus = (typeof CREDIT_HOLD_STATUSES)[number];

/**
 * Kinds that add credits. `refund` is a goodwill grant back to the user;
 * `reversal` is the opposite — clawing credits back because the money went
 * back to the card — so it is deliberately not in this list.
 */
const CREDITING_KINDS: readonly CreditEntryKind[] = [
  "purchase",
  "bonus",
  "signup_grant",
  "promo",
  "refund",
];

export function isCreditEntryKind(value: unknown): value is CreditEntryKind {
  return typeof value === "string" && CREDIT_ENTRY_KINDS.some((k) => k === value);
}

export function isCreditHoldStatus(value: unknown): value is CreditHoldStatus {
  return (
    typeof value === "string" && CREDIT_HOLD_STATUSES.some((s) => s === value)
  );
}

export function isCreditingKind(kind: CreditEntryKind): boolean {
  return CREDITING_KINDS.some((k) => k === kind);
}

/* ------------------------------------------------------------------ */
/* Shapes returned by the SQL functions                                */
/* ------------------------------------------------------------------ */

/**
 * `available` is the only number a spend decision may use. `balance` alone
 * ignores credits already reserved by jobs that are still running.
 */
export interface CreditAccountState {
  user_id: string;
  balance: number;
  held: number;
  available: number;
  lifetime_purchased: number;
  lifetime_spent: number;
}

/** Common envelope: every credit RPC reports whether it changed anything. */
export interface CreditMutationResult extends CreditAccountState {
  /** False when a replay hit the idempotency key or an already-settled hold. */
  applied: boolean;
  ledger_id?: number;
}

export interface CreditHoldResult extends CreditAccountState {
  ok: boolean;
  applied: boolean;
  hold_id?: string;
  hold_status?: CreditHoldStatus;
  /** Present only when `ok` is false. */
  reason?: "insufficient_credits";
  required?: number;
  shortfall?: number;
}

export interface CreditCaptureResult extends CreditAccountState {
  ok: boolean;
  applied: boolean;
  /** What was actually taken, after clamping to the reserved amount. */
  charged?: number;
  ledger_id?: number;
  hold_status?: CreditHoldStatus;
}

export interface CreditLedgerEntry {
  id: number;
  amount: number;
  kind: CreditEntryKind;
  balance_after: number;
  hold_id: string | null;
  reference: Record<string, unknown>;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Idempotency keys                                                    */
/* ------------------------------------------------------------------ */

/**
 * The key for crediting a Stripe payment.
 *
 * Keyed on the payment intent rather than the event id on purpose: one
 * payment emits several events with different ids, and all of them must
 * collapse onto a single grant. See the header of migration 011.
 */
export function stripePaymentKey(paymentIntentId: string): string {
  return `stripe:${paymentIntentId}`;
}

/**
 * The key for the bonus credits that came free with a pack.
 *
 * The bonus is a second ledger entry rather than being folded into the
 * purchase, so a statement shows what was bought and what was given away
 * as separate lines — and so repricing a pack can never retroactively
 * change what a past payment was worth.
 */
export function stripeBonusKey(paymentIntentId: string): string {
  return `${stripePaymentKey(paymentIntentId)}:bonus`;
}

/** The key for reversing a Stripe payment (refund or chargeback). */
export function stripeReversalKey(
  paymentIntentId: string,
  chargeId: string
): string {
  return `stripe:${paymentIntentId}:reversal:${chargeId}`;
}

/** The key for the one-off grant a new account receives. */
export function signupGrantKey(userId: string): string {
  return `signup:${userId}`;
}

/* ------------------------------------------------------------------ */
/* Display helpers                                                     */
/* ------------------------------------------------------------------ */

/** `1,250 credits` — grouped, and singular when it should be. */
export function formatCredits(credits: number): string {
  const rounded = Math.round(credits);
  return `${rounded.toLocaleString("en-US")} ${Math.abs(rounded) === 1 ? "credit" : "credits"}`;
}

/** Credits rendered as the dollar amount they were bought for. */
export function creditsToUsd(credits: number): string {
  return `$${(credits / CREDITS_PER_USD).toFixed(2)}`;
}

export function usdToCredits(usd: number): number {
  return Math.round(usd * CREDITS_PER_USD);
}
