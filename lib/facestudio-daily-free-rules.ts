/**
 * The daily free face swap's numbers, shared by the server (lib/facestudio-daily-free.ts)
 * and the public copy (pages, llms.txt, facts.json). Pure: no database, no network.
 */

/** Free photo face swaps (one face) per account per day. */
export const DAILY_FREE_FACE_SWAPS = 1;

/** Site-wide ceiling per day; FACESTUDIO_DAILY_FREE_CAP overrides it (0 turns the offer off). */
export const DAILY_FREE_DEFAULT_CAP = 300;

/** Tries a day (failed renders included) before the day's free swap counts as used. */
export const DAILY_FREE_ATTEMPTS = 3;

/** Longer side of a free photo, in pixels, for an account that has not bought credits. */
export const FREE_PHOTO_MAX_SIDE = 1536;

/** When the day turns over, as people read it. */
export const DAILY_FREE_RESET_LABEL = "midnight Pacific time";

/** The day the offer started. */
export const DAILY_FREE_SINCE = "2026-11-25";

export function dailyFreeCap(env: string | undefined = process.env.FACESTUDIO_DAILY_FREE_CAP): number {
  if (env === undefined || env.trim() === "") return DAILY_FREE_DEFAULT_CAP;
  const n = Number.parseInt(env, 10);
  return Number.isFinite(n) && n >= 0 ? n : DAILY_FREE_DEFAULT_CAP;
}

/** Today's date in Los Angeles, YYYY-MM-DD. */
export function ptDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type DailyFreeReason = "used" | "sold_out" | "not_eligible";

export interface DailyFreeState {
  available: boolean;
  reason?: DailyFreeReason;
}
