/**
 * Where a browser first came from: the site that sent it (or the utm tags on the link) and the page
 * it landed on. Kept so that we can tell which sources bring people who sign up and pay, which the
 * site could not answer before 2026-11-07 (it knew who paid, not how they found us).
 *
 * The browser writes it once (app/components/first-touch.tsx) and never overwrites it, so a later
 * visit from another source does not take the credit. The server copies it onto the account the
 * first time that account is seen (lib/first-touch-server.ts) and onto each Stripe checkout.
 *
 * Nothing in it identifies a person: a hostname, a path without its query string, utm tags and the
 * time of the first visit. It is listed in the privacy policy.
 *
 * Written in the browser rather than in the middleware: a cookie set on the response would stop
 * the CDN from caching the landing pages, and a visitor who runs no script is usually a crawler.
 */

export const FIRST_TOUCH_COOKIE = "np_ft";

/** 90 days: long enough for someone who comes back later to sign up or buy. */
export const FIRST_TOUCH_MAX_AGE_S = 60 * 60 * 24 * 90;

export interface FirstTouch {
  /** Hostname of the referring site; "" when there was none or it was this site. */
  ref: string;
  /** Path of the first page, without its query string. */
  landing: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  /** "gclid", "fbclid" or "msclkid" when the link carried an ad click id. */
  click: string;
  /** First visit, seconds since the epoch. */
  at: number;
}

const clip = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/[^\w.\-/:@~+%]/g, "").slice(0, max) : "";

/** Turn whatever came out of the cookie into a FirstTouch, or null when it is not one. */
export function parseFirstTouch(raw: string | undefined | null): FirstTouch | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const at = Number(v.t);
    if (!Number.isFinite(at) || at <= 0) return null;
    return {
      ref: clip(v.r, 100).toLowerCase(),
      landing: clip(v.p, 200) || "/",
      utmSource: clip(v.s, 80).toLowerCase(),
      utmMedium: clip(v.m, 80).toLowerCase(),
      utmCampaign: clip(v.c, 80),
      click: clip(v.k, 10),
      at: Math.floor(at),
    };
  } catch {
    return null;
  }
}

/** The cookie value for a first visit, as the browser writes it. */
export function encodeFirstTouch(t: FirstTouch): string {
  return encodeURIComponent(
    JSON.stringify({
      r: t.ref,
      p: t.landing,
      s: t.utmSource,
      m: t.utmMedium,
      c: t.utmCampaign,
      k: t.click,
      t: t.at,
    }),
  );
}

/**
 * One short label for a source: the utm source if the link had one (ChatGPT adds
 * utm_source=chatgpt.com to the links in its answers, often with no referrer), else the
 * referring host, else "direct".
 */
export function firstTouchSource(t: FirstTouch): string {
  return t.utmSource || t.ref.replace(/^www\./, "") || (t.click ? `ad:${t.click}` : "direct");
}
