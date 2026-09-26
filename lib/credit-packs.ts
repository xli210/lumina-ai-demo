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

/** Price rendered for a card header, e.g. `$20`. */
export function formatPackPrice(pack: CreditPack): string {
  return `$${(pack.priceInCents / CREDITS_PER_USD).toFixed(0)}`;
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
