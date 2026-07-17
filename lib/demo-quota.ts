import type { DemoId } from "./demos";

/**
 * Daily limit per user, per kind.
 *
 * kind = "image" pools the two image-producing demos (Image FaceSwap Pro 2.0
 * + NanoFace Vivid). kind = "video" is just the video demo. So a signed-in
 * user can burn 10 image opens + 10 video opens = 20 opens/day across the
 * three demos, then hits the /demos/limit CTA until 00:00 UTC.
 */
export const DEMO_DAILY_LIMIT = 10;

export type DemoKind = "image" | "video";

/** Which cost bucket each demo id lives in. */
export function kindForDemo(id: DemoId): DemoKind {
  // NanoFace Vivid produces images so it shares the image bucket. If we ever
  // ship a demo that's cheap enough to warrant its own quota (or free from
  // rate limiting entirely) it goes here.
  return id === "video" ? "video" : "image";
}

/**
 * UTC calendar date as an ISO YYYY-MM-DD string. This is the value stored in
 * the `day` column of demo_usage_daily so quotas reset globally at 00:00 UTC
 * — simple to reason about, matches the copy on /demos/limit.
 */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Milliseconds until the next UTC midnight. Used by the limit CTA page copy
 * ("resets in ~4h") so the number the user sees actually matches when the
 * counter will roll over.
 */
export function msUntilNextUtcMidnight(now: Date = new Date()): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function hoursUntilNextUtcMidnight(now: Date = new Date()): number {
  return Math.max(1, Math.ceil(msUntilNextUtcMidnight(now) / (60 * 60 * 1000)));
}
