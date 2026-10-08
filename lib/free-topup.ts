/**
 * The rate limit on free top-ups, as a pure function.
 *
 * Kept apart from lib/credits-server.ts (which cannot be imported outside the
 * server) so the rule can be tested on its own. The caller supplies the times
 * of the account's earlier top-ups, read from the ledger.
 */

export interface TopUpLimit {
  /** At most this many top-ups... */
  max: number;
  /** ...in any rolling window of this many days. */
  days: number;
}

const DAY_MS = 86_400_000;

/**
 * May another top-up be granted now?
 *
 * Every limit must hold. A grant at exactly the edge of a window has left that
 * window: `days` days ago to the millisecond no longer counts.
 */
export function topUpAllowed(
  grantTimesMs: readonly number[],
  limits: readonly TopUpLimit[],
  nowMs: number
): boolean {
  return limits.every(({ max, days }) => {
    const since = nowMs - days * DAY_MS;
    const used = grantTimesMs.filter((t) => t > since && t <= nowMs).length;
    return used < max;
  });
}

/** The longest window, in days: how far back the caller needs to read. */
export function longestWindowDays(limits: readonly TopUpLimit[]): number {
  return limits.reduce((m, l) => Math.max(m, l.days), 0);
}
