import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { grantCredits, startOfTodayPT } from "@/lib/credits-server";
import { getFreeClaimOutcome } from "@/lib/free-claim";
import { FACESTUDIO_SERVICE } from "@/lib/facestudio";
import { DAILY_FREE_ATTEMPTS, dailyFreeCap, ptDay, type DailyFreeState } from "@/lib/facestudio-daily-free-rules";

/**
 * One free photo face swap a day for every signed-in account (since 2026-11-25).
 *
 * The rule (owner, 2026-11-25): each account that may have free credits gets one
 * Nano FaceStudio Online face swap of one face per day, whatever its balance.
 * It does not carry over, cannot be spent on anything else, and the whole site
 * gives out at most `dailyFreeCap()` (300) a day. The day is midnight to
 * midnight in Los Angeles. An account whose free claim was refused (another
 * account on the same device or network, throwaway email) gets none, like the
 * sign-up credits; an account that has bought credits always qualifies.
 *
 * How it is paid for: credits are reserved before a render, and a reservation
 * must be for at least one credit (migration 009), so the free swap is credits
 * granted (`promo`, one idempotency key per attempt) and reserved in the same
 * request, with `daily_free: true` on the hold. A render that lands spends
 * them; one that never starts or fails gets them taken back
 * (`returnDailyFree`), so a failure leaves nothing behind and the day's swap is
 * still there to retry. Used = an open or captured daily-free hold since
 * midnight PT; at most DAILY_FREE_ATTEMPTS tries a day.
 */

interface TodayHold {
  user_id: string;
  status: string;
}

async function todayDailyFreeHolds(userId?: string): Promise<{ holds: TodayHold[]; attempts: number; siteCount: number }> {
  const supabase = createAdminClient();
  const since = startOfTodayPT().toISOString();

  const site = await supabase
    .from("credit_holds")
    .select("id", { count: "exact", head: true })
    .eq("service", FACESTUDIO_SERVICE)
    .eq("estimate->>daily_free", "true")
    .in("status", ["open", "captured"])
    .gte("created_at", since);
  if (site.error) throw new Error(`daily free count failed: ${site.error.message}`);

  let holds: TodayHold[] = [];
  let attempts = 0;
  if (userId) {
    // Tries are counted from the grants, so a try whose reservation never got made still counts.
    const tries = await supabase
      .from("credit_ledger")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .like("idempotency_key", `daily_free:${userId}:${ptDay()}:%`);
    if (tries.error) throw new Error(`daily free tries failed: ${tries.error.message}`);
    attempts = tries.count ?? 0;
    const mine = await supabase
      .from("credit_holds")
      .select("user_id, status")
      .eq("service", FACESTUDIO_SERVICE)
      .eq("user_id", userId)
      .eq("estimate->>daily_free", "true")
      .gte("created_at", since);
    if (mine.error) throw new Error(`daily free lookup failed: ${mine.error.message}`);
    holds = (mine.data ?? []) as TodayHold[];
  }
  return { holds, attempts, siteCount: site.count ?? 0 };
}

async function eligible(userId: string, isPaid: boolean): Promise<boolean> {
  if (isPaid) return true;
  const outcome = await getFreeClaimOutcome(userId);
  return outcome === "granted" || outcome === "grandfathered";
}

/** Whether this account can use today's free face swap now, and if not, why. */
export async function getDailyFreeState(userId: string, isPaid: boolean): Promise<DailyFreeState & { attempts: number }> {
  if (!(await eligible(userId, isPaid))) return { available: false, reason: "not_eligible", attempts: 0 };
  const { holds, attempts, siteCount } = await todayDailyFreeHolds(userId);
  if (holds.some((h) => h.status === "open" || h.status === "captured")) {
    return { available: false, reason: "used", attempts };
  }
  if (attempts >= DAILY_FREE_ATTEMPTS) return { available: false, reason: "used", attempts };
  if (siteCount >= dailyFreeCap()) return { available: false, reason: "sold_out", attempts };
  return { available: true, attempts };
}

/**
 * Grant the credits for today's free face swap, if this account has one left.
 * Returns what the hold should record, or null when there is none to give.
 * The caller reserves `credits` straight after and calls `returnDailyFree` if
 * that reservation or the render does not go through.
 */
export async function claimDailyFree(params: {
  userId: string;
  credits: number;
  isPaid: boolean;
}): Promise<{ day: string; attempt: number } | null> {
  const state = await getDailyFreeState(params.userId, params.isPaid);
  if (!state.available) return null;
  const day = ptDay();
  const attempt = state.attempts + 1;
  const grant = await grantCredits({
    userId: params.userId,
    amount: params.credits,
    kind: "promo",
    idempotencyKey: `daily_free:${params.userId}:${day}:${attempt}`,
    reference: { service: FACESTUDIO_SERVICE, reason: "daily_free_face_swap", day, attempt },
  });
  // Already granted under this key (a double click): the first request owns it.
  if (!grant.applied) return null;
  return { day, attempt };
}

/**
 * Take back the credits of a daily free swap whose render never landed. Keyed
 * on the hold, so every path that releases it can call this and only the first
 * one counts. Without a hold (the reservation itself failed), pass the grant's
 * day and attempt instead.
 */
export async function returnDailyFree(params: {
  userId: string;
  credits: number;
  holdId?: string;
  day?: string;
  attempt?: number;
}): Promise<void> {
  const key = params.holdId
    ? `daily_free_back:${params.holdId}`
    : `daily_free_back:${params.userId}:${params.day}:${params.attempt}`;
  try {
    await grantCredits({
      userId: params.userId,
      amount: -params.credits,
      kind: "admin_adjust",
      idempotencyKey: key,
      reference: { service: FACESTUDIO_SERVICE, reason: "daily_free_unused", hold_id: params.holdId ?? null },
    });
  } catch (err: unknown) {
    // Worst case the account keeps one face swap's worth of credits; not worth failing the reply over.
    console.error("[facestudio] daily free return failed:", err instanceof Error ? err.message : err);
  }
}
