/**
 * The rules behind the admin dashboard's "are you sure?" dialog, as plain
 * functions so they can be tested without a browser.
 *
 * The same rules are enforced again in the database (scripts/016_admin_guardrails.sql):
 * a dialog is only a person's last look, the function is the gate. Keep the
 * numbers here equal to the ones there.
 */

/** How long the confirm button stays disabled after the dialog opens. */
export const CONFIRM_DELAY_SECONDS = 4;

/** An account younger than this cannot be made an admin (016 refuses it too). */
export const NEW_ACCOUNT_HOURS = 24;

/** Does what was typed name the target? Case and stray spaces do not matter; an empty target never matches. */
export function confirmationMatches(typed: string, expected: string): boolean {
  const want = expected.trim().toLowerCase();
  return want.length > 0 && typed.trim().toLowerCase() === want;
}

/** Whole seconds until the confirm button may be pressed (0 when it may). */
export function secondsLeft(
  openedAtMs: number,
  nowMs: number,
  delaySeconds: number = CONFIRM_DELAY_SECONDS
): number {
  const elapsed = Math.max(0, nowMs - openedAtMs); // a clock set backwards must not stretch the wait
  return Math.max(0, Math.ceil(delaySeconds - elapsed / 1000));
}

export function accountAgeHours(createdAtIso: string, nowMs: number): number {
  const created = Date.parse(createdAtIso);
  if (!Number.isFinite(created)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (nowMs - created) / 3_600_000);
}

/** "37 minutes", "5 hours", "12 days": how old an account is, for a person to read. */
export function describeAge(createdAtIso: string, nowMs: number): string {
  const h = accountAgeHours(createdAtIso, nowMs);
  if (!Number.isFinite(h)) return "unknown age";
  if (h < 1) {
    const m = Math.max(1, Math.round(h * 60));
    return `${m} minute${m === 1 ? "" : "s"}`;
  }
  if (h < 48) {
    const n = Math.floor(h);
    return `${n} hour${n === 1 ? "" : "s"}`;
  }
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"}`;
}

export type AdminEligibility = { ok: true } | { ok: false; reason: string };

/** Can this account be made an admin right now? (The database decides for real.) */
export function canBecomeAdmin(
  createdAtIso: string,
  emailConfirmed: boolean,
  nowMs: number
): AdminEligibility {
  if (!emailConfirmed) {
    return { ok: false, reason: "This account has not confirmed its email, so it cannot become an admin." };
  }
  const h = accountAgeHours(createdAtIso, nowMs);
  if (h < NEW_ACCOUNT_HOURS) {
    return {
      ok: false,
      reason: `This account is only ${describeAge(createdAtIso, nowMs)} old. An account must be at least ${NEW_ACCOUNT_HOURS} hours old before it can be made an admin.`,
    };
  }
  return { ok: true };
}
