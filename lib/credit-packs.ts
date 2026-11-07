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

/**
 * Limits for auto top-up turned on under Terms 1.4 or earlier: at most this many charges in 24 hours
 * and in 30 days (migration 018). Still applied to those settings, because it is what those people
 * were shown; the application passes them to `auto_recharge_claim`.
 */
export const AUTO_RECHARGE_MAX_PER_DAY = 1;
export const AUTO_RECHARGE_MAX_PER_MONTH = 3;

/**
 * Limits for auto top-up turned on under Terms 1.5 or later, in dollars: at most this much charged in
 * 24 hours (the largest pack, Studio) and in 30 days. Enforced in migration 023, which holds the same
 * numbers; change both together.
 */
export const AUTO_RECHARGE_MAX_USD_PER_DAY = 100;
export const AUTO_RECHARGE_MAX_USD_PER_MONTH = 1000;

/** True when a consent recorded under this terms version gets the dollar limits (1.5 and later). */
export function autoRechargeLimitsByAmount(termsVersion: string | null | undefined): boolean {
  const match = /^(\d+)\.(\d+)$/.exec(termsVersion ?? "");
  if (!match) return false;
  const [major, minor] = [Number(match[1]), Number(match[2])];
  return major > 1 || (major === 1 && minor >= 5);
}

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
 * The pack put forward when someone cannot afford what they asked for: the smallest
 * one that covers the shortfall, Starter ($5) included. From 10/29 to 11/1 this
 * skipped Starter and led with $20; first purchases, mostly $5 before, stopped in those days, so
 * the cheapest way in comes first again (the card fee on $5 is the price of that).
 */
export function suggestPack(shortfall: number): CreditPack {
  return CREDIT_PACKS.find((pack) => totalCredits(pack) >= shortfall) ?? CREDIT_PACKS[CREDIT_PACKS.length - 1];
}

/** The credits page with that pack marked as the one to buy. `from` names the prompt, recorded on the purchase. */
export function topUpPath(pack: CreditPack, from?: string): string {
  return `/credits?pack=${pack.id}${from ? `&from=${from}` : ""}`;
}

/** A label from a link or a form, as stored in checkout metadata. Anything else is dropped. */
export function cleanTopUpLabel(raw: unknown): string | null {
  return typeof raw === "string" && /^[A-Za-z0-9_:/.-]{1,80}$/.test(raw) ? raw : null;
}

/** What the page knows about how a checkout came about, kept on the purchase. */
export interface TopUpAttribution {
  /** The prompt's `from`, else the page the person came from. */
  source?: string;
  /** The pack the prompt recommended. */
  recommended?: string;
  /** The pack the repeat top-up line put forward, if it was on the page. */
  offerPack?: string;
  /** "repeat_offer" when bought from that line, "card" when from a pack card. */
  clicked?: string;
}

/** A credit pack bought recently and not reversed. */
export interface RecentPurchase {
  packId: string;
  paidCents: number;
  /** Everything it added, bonus included. */
  credits: number;
  at: number;
}

/** What the repeat top-up line says: the person's own recent total against one bigger pack. */
export interface RepeatTopUpOffer {
  spentCents: number;
  credits: number;
  packId: string;
  moreCents: number;
  moreCredits: number;
}

/** How far back purchases count towards the repeat top-up line. */
export const REPEAT_OFFER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** The line stays away for this long after a purchase, so nobody is sold to the moment they have paid. */
const REPEAT_OFFER_QUIET_MS = 15 * 60 * 1000;

/**
 * Only for someone who has already bought Starter in the last 7 days: a first purchase still leads
 * with the cheapest pack (see `suggestPack`). The pack put forward is the smallest that costs more
 * than they have paid in that time, and both the extra credits and the extra money are stated.
 */
export function repeatTopUpOffer(recent: readonly RecentPurchase[], now: number): RepeatTopUpOffer | null {
  const inWindow = recent.filter((p) => now - p.at < REPEAT_OFFER_WINDOW_MS);
  if (!inWindow.some((p) => p.packId === "starter")) return null;
  if (inWindow.some((p) => now - p.at < REPEAT_OFFER_QUIET_MS)) return null;

  const spentCents = inWindow.reduce((sum, p) => sum + p.paidCents, 0);
  const credits = inWindow.reduce((sum, p) => sum + p.credits, 0);
  const pack = CREDIT_PACKS.find((p) => p.priceInCents > spentCents);
  if (!pack || totalCredits(pack) <= credits) return null;
  return {
    spentCents,
    credits,
    packId: pack.id,
    moreCents: pack.priceInCents - spentCents,
    moreCredits: totalCredits(pack) - credits,
  };
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
