/**
 * Black Friday 2026: from 22 November 23:00 to 24 December 23:59, Pacific time (PST, UTC-8, the
 * whole way through). Owner's decisions: 24 Nov to 24 Dec (2026-11-23); then "start now, same end"
 * (the evening of 22 Nov PT), so the copy says Nov 23, the first full day.
 *
 * Every sale price on the site is read from here at the moment it is shown or charged, so checkout
 * charges the regular price from the instant the sale ends and every page drops the offer the next
 * time it renders. Nothing has to be switched off by hand.
 *
 * What is on sale:
 * - Credit packs: Standard ($20) 20% off, Pro ($50) 25% off, Studio ($100) 30% off. The $5 Starter
 *   is not discounted. The pack keeps its credits; only the charge is smaller. Auto top-ups made
 *   during the sale are charged the sale price too.
 * - Desktop app licences: Nano FaceStudio Pro $49.90 (regular $69.90, the price it has sold at
 *   since 1 November); the other paid apps 30% off.
 * - Nano FaceStudio V Pro goes on sale at a launch price of $84.90, and $119.90 after the sale. It
 *   has never been sold at $119.90, so it is never shown as a discount from that price, only as a
 *   launch price that goes up on a stated date.
 * - Neo (the video model) costs 30% fewer credits until 28 November; that offer lives in
 *   lib/facestudio-v.ts and is listed with the rest on /black-friday.
 *
 * Billing and price wording stays in English on every locale, like the rest of the site.
 */

/** 22 November 2026, 23:00 PST: brought forward from 24 Nov at the owner's request; already past when it shipped. */
export const BLACK_FRIDAY_STARTS_AT = Date.parse("2026-11-23T07:00:00Z");
/** 25 December 2026, 00:00 PST: the first instant after the sale. */
export const BLACK_FRIDAY_ENDS_AT = Date.parse("2026-12-25T08:00:00Z");
/** The last day as the copy states it. */
export const BLACK_FRIDAY_ENDS_LABEL = "Dec 24, 11:59 pm PT";
export const BLACK_FRIDAY_STARTS_LABEL = "Nov 23";
export const BLACK_FRIDAY_LAST_DAY = "2026-12-24";
/** Stamped on checkout metadata so sale purchases can be counted later. */
export const BLACK_FRIDAY_CAMPAIGN = "black-friday-2026";

export function blackFridayOn(now: number = Date.now()): boolean {
  return now >= BLACK_FRIDAY_STARTS_AT && now < BLACK_FRIDAY_ENDS_AT;
}

/** Before the sale has started (the hub page says when it starts). */
export function blackFridayUpcoming(now: number = Date.now()): boolean {
  return now < BLACK_FRIDAY_STARTS_AT;
}

/** Percent off each credit pack during the sale, by pack id. */
export const BLACK_FRIDAY_PACK_PERCENT_OFF: Readonly<Record<string, number>> = {
  standard: 20,
  pro: 25,
  studio: 30,
};

/**
 * Sale price of each paid desktop app licence, by product id. The four smaller apps are 30% off,
 * rounded down to the nearest .90 (so a little more than 30%).
 */
export const BLACK_FRIDAY_APP_PRICE_CENTS: Readonly<Record<string, number>> = {
  "nano-facestudio-pro": 4990, // regular 6990
  "nano-imageedit": 1390, // regular 1990
  "nano-videoenhance": 1390, // regular 1990
  nnanoimageenh: 2090, // regular 2990
  "nano-videogen": 2090, // regular 2990
};

/** Nano FaceStudio V Pro: launch price until the sale ends, then the regular price. */
export const FACESTUDIO_V_PRO_LAUNCH_PRICE_CENTS = 8490;
export const FACESTUDIO_V_PRO_REGULAR_PRICE_CENTS = 11990;

export function facestudioVProLaunchPriceOn(now: number = Date.now()): boolean {
  return now < BLACK_FRIDAY_ENDS_AT;
}

/**
 * End of Neo's launch-week offer (30% fewer credits for Neo videos): the same instant as NEO_SALE_END
 * in app/components/neo-sale-badge.tsx, which the studio enforces (STUDIO_NEO_SALE_UNTIL on Render).
 * Repeated here because a server component cannot read a constant out of a "use client" module.
 */
export const NEO_SALE_ENDS_AT = Date.UTC(2026, 10, 28, 3, 0, 0);
export const NEO_SALE_ENDS_LABEL = "Nov 27, 7 pm PT";

/** "23 days left", "5 hours left"; null once the sale has ended. */
export function blackFridayTimeLeft(now: number = Date.now()): string | null {
  const ms = BLACK_FRIDAY_ENDS_AT - now;
  if (ms <= 0) return null;
  const hours = Math.ceil(ms / 3_600_000);
  if (hours <= 1) return "under an hour left";
  if (hours <= 48) return `${hours} hours left`;
  const days = Math.floor(ms / 86_400_000);
  return `${days} days left`;
}

/** "$16", "$37.50". */
export function formatUsdCents(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}
