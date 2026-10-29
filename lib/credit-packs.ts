/**
 * The credit top-up catalog — safe to import from both client and server.
 *
 * This file is the only place a credit price is defined. The browser reads
 * it to render the cards, the server action reads it to build the Stripe
 * line item, and the webhook reads it to decide how many credits a
 * completed payment is worth. A price the client sends is never trusted;
 * only a pack id is accepted and everything else is looked up here.
 *
 * See docs/credit-system.md for the design and the reasoning behind it.
 */

import { CREDITS_PER_USD } from "@/lib/credits";

/**
 * Because 1 credit = $0.01, a pack's base credits and its price in cents
 * are the same number. Deriving one from the other means they cannot drift
 * apart when a price changes; `bonusCredits` is the only thing on top.
 */
export interface CreditPack {
  id: string;
  name: string;
  /** What the customer pays, in USD cents — the Stripe `unit_amount`. */
  priceInCents: number;
  /** Extra credits granted free with this pack. Zero for the entry tier. */
  bonusCredits: number;
  /** One line explaining who the pack is for. */
  blurb: string;
  /** Renders a "Most popular" ribbon on exactly one card. */
  highlight?: boolean;
}

export const CREDIT_PACKS: readonly CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    priceInCents: 500,
    bonusCredits: 0,
    blurb: "Try a hosted render end to end.",
  },
  {
    id: "standard",
    name: "Standard",
    priceInCents: 2000,
    bonusCredits: 160,
    blurb: "A handful of short clips a month.",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    priceInCents: 5000,
    bonusCredits: 750,
    blurb: "Regular restoration work.",
  },
  {
    id: "studio",
    name: "Studio",
    priceInCents: 10000,
    bonusCredits: 2500,
    blurb: "Best rate per credit, for sustained volume.",
  },
];

/** Credits bought outright, before any bonus. */
export function baseCredits(pack: CreditPack): number {
  return pack.priceInCents;
}

/** Everything that lands in the balance: what was bought plus the bonus. */
export function totalCredits(pack: CreditPack): number {
  return baseCredits(pack) + pack.bonusCredits;
}

/** The bonus as a whole-number percentage, for the "+8% free" badge. */
export function bonusPercent(pack: CreditPack): number {
  return Math.round((pack.bonusCredits / baseCredits(pack)) * 100);
}

/* -------------------------------------------------------------------------- */
/* Auto top-up                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Auto top-up is an opt-in: the same pack is bought again when the balance runs low. The reward for
 * turning it on is a little more bonus on every auto top-up: this many percentage points of the
 * pack's price, on top of the pack's own bonus. It is not given at sign-up for the feature, so
 * switching it on and straight off earns nothing.
 */
export const AUTO_RECHARGE_EXTRA_BONUS_PERCENT = 2;

/** It buys again when the available balance falls below this share of the pack's credits. */
export const AUTO_RECHARGE_THRESHOLD_SHARE = 0.2;

/** At most this many auto top-ups in 24 hours and in 30 days. Enforced in migration 018. */
export const AUTO_RECHARGE_MAX_PER_DAY = 1;
export const AUTO_RECHARGE_MAX_PER_MONTH = 3;

/** The extra credits an auto top-up of this pack adds. */
export function autoRechargeExtraBonus(pack: CreditPack): number {
  return Math.round((baseCredits(pack) * AUTO_RECHARGE_EXTRA_BONUS_PERCENT) / 100);
}

/** Everything an auto top-up of this pack lands in the balance. */
export function autoRechargeCredits(pack: CreditPack): number {
  return totalCredits(pack) + autoRechargeExtraBonus(pack);
}

/** The balance below which an auto top-up of this pack is bought, in credits. */
export function autoRechargeThreshold(pack: CreditPack): number {
  return Math.round(totalCredits(pack) * AUTO_RECHARGE_THRESHOLD_SHARE);
}

/** The highest threshold of any pack: a balance at or above it never needs a look at the database. */
export const AUTO_RECHARGE_MAX_THRESHOLD = Math.max(...CREDIT_PACKS.map(autoRechargeThreshold));

/** Price rendered for a card header, e.g. `$20`. */
export function formatPackPrice(pack: CreditPack): string {
  return `$${(pack.priceInCents / CREDITS_PER_USD).toFixed(0)}`;
}

/**
 * The pack put forward when someone cannot afford what they asked for: Standard
 * ($20), or the smallest bigger pack that covers the shortfall. Never Starter:
 * $5 can fall short of one long video, and a card fee takes about a tenth of it.
 */
export function suggestPack(shortfall: number): CreditPack {
  const larger = CREDIT_PACKS.slice(CREDIT_PACKS.findIndex((pack) => pack.id === "standard"));
  return larger.find((pack) => totalCredits(pack) >= shortfall) ?? larger[larger.length - 1];
}

/** The credits page with that pack marked as the one to buy. */
export function topUpPath(pack: CreditPack): string {
  return `/credits?pack=${pack.id}`;
}

/**
 * e.g. "The $20 Standard pack adds 2,160 credits, enough for this with 1,596 to spare."
 * Without a shortfall (nothing particular is being paid for) it stops after the credits.
 */
export function suggestionSentence(shortfall?: number): string {
  const pack = suggestPack(shortfall ?? 0);
  const total = totalCredits(pack);
  const head = `The ${formatPackPrice(pack)} ${pack.name} pack adds ${total.toLocaleString("en-US")} credits`;
  if (shortfall === undefined || total < shortfall) return `${head}.`;
  return `${head}, enough for this with ${(total - shortfall).toLocaleString("en-US")} to spare.`;
}

/**
 * Resolve a pack id that arrived from the network.
 *
 * Returns undefined rather than throwing so callers decide the status code;
 * an unknown id is a 400, not a 500.
 */
export function findCreditPack(packId: unknown): CreditPack | undefined {
  if (typeof packId !== "string") return undefined;
  return CREDIT_PACKS.find((pack) => pack.id === packId);
}
