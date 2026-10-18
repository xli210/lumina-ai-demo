import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  attachJobToHold,
  captureHold,
  releaseHold,
  type CreditHoldRecord,
} from "@/lib/credits-server";
import { FACESTUDIO_V_SERVICE } from "@/lib/facestudio-v";
import { bearerToken, signStudioToken, verifyStudioToken } from "@/lib/facestudio-v-token";
import { billingEnabledIn, decideSettlement, parseStudioAddress, priceFits, type StudioBilling, type StudioJob } from "@/lib/facestudio-v-billing";

export { bearerToken, signStudioToken, verifyStudioToken };
export type { StudioBilling, StudioJob };

/**
 * Server side of the Video FaceSwap Online trial's billing.
 *
 * The studio (a Python server on the owner's GPU machine) prices each video and
 * reports, per job, whether the price should be kept (`settled`) or returned
 * (`refunded`). It knows no balances. This file is the other half:
 *
 *   studio page --token--> hold (reserve credits) -> run -> attach job id
 *                      \-> settle (ask the studio what happened, then charge or release)
 *
 * Who is who: the studio page runs on the studio's own origin and cannot use our
 * cookies, so /facestudio-v/launch gives it a short-lived signed token (in the
 * URL fragment, which is never sent to any server). Every billing call carries
 * it. The token names a user; it grants nothing else.
 *
 * What this does not do: the studio cannot tell whether the page really reserved
 * credits before it ran a job, and anyone holding the studio's access key could
 * call it directly. Settlement does not trust the page: `settle` asks the studio
 * itself (with the key, server to server) what the job's billing status is.
 */

/** A reservation covers waiting in line (up to ~30 min) and rendering (~5 min), with room to spare. */
export const FSV_HOLD_TTL_SECONDS = 60 * 60;
/** Videos one account can have in line or rendering at once. */
export const FSV_MAX_OPEN = 2;
/** Largest price one hold may ask for. The studio's own caps keep real prices far below it. */
export const FSV_MAX_CREDITS = 2000;

/* ------------------------------------------------------------------ */
/* The studio                                                          */
/* ------------------------------------------------------------------ */

export interface StudioConfig {
  origin: string;
  key: string;
}

/** The studio's address and access key, from FACESTUDIO_V_STUDIO_URL (https only). */
export function studioConfig(): StudioConfig | null {
  const a = parseStudioAddress(process.env.FACESTUDIO_V_STUDIO_URL);
  return "problem" in a ? null : a;
}

async function studioFetch(cfg: StudioConfig, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${cfg.origin}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), cookie: `studio_auth=${cfg.key}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

/** What the studio says about one job. `{ found: false }` is a real "no such job"; `{ error }` is "could not ask". */
export async function fetchStudioJob(jobId: string): Promise<StudioJob> {
  const cfg = studioConfig();
  if (!cfg) return { error: "The studio address is not configured." };
  if (!/^[0-9a-f]{12}$/.test(jobId)) return { found: false };
  try {
    const r = await studioFetch(cfg, `/api/jobs/${jobId}`);
    if (r.status === 404) return { found: false };
    if (!r.ok) return { error: `The studio answered ${r.status}.` };
    const j = (await r.json()) as { state?: string; billing?: StudioBilling };
    return { found: true, state: String(j.state ?? ""), billing: j.billing ?? null };
  } catch {
    return { error: "The studio did not answer." };
  }
}

/** Ask the studio to stop a job (best effort). Used when a job does not match what was reserved. */
export async function cancelStudioJob(jobId: string): Promise<void> {
  const cfg = studioConfig();
  if (!cfg || !/^[0-9a-f]{12}$/.test(jobId)) return;
  try {
    await studioFetch(cfg, `/api/jobs/${jobId}/cancel`, { method: "POST" });
  } catch {
    /* best effort */
  }
}

export type StudioStatus =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "bad_address" | "unreachable" | "rejected" | "studio_error" | "billing_off" };

/**
 * Is the studio up and insisting on a quote? The launch page asks before it sends
 * anyone in, and shows the reason code when the answer is no (it contains nothing secret).
 */
export async function studioStatus(): Promise<StudioStatus> {
  const a = parseStudioAddress(process.env.FACESTUDIO_V_STUDIO_URL);
  if ("problem" in a) return { ok: false, reason: a.problem };
  let r: Response;
  try {
    r = await studioFetch(a, "/api/health");
  } catch {
    return { ok: false, reason: "unreachable" };
  }
  if (r.status === 401 || r.status === 403) return { ok: false, reason: "rejected" };
  if (!r.ok) return { ok: false, reason: "studio_error" };
  try {
    return billingEnabledIn(await r.json()) ? { ok: true } : { ok: false, reason: "billing_off" };
  } catch {
    return { ok: false, reason: "studio_error" };
  }
}

/* ------------------------------------------------------------------ */
/* CORS: the studio page is a different origin                         */
/* ------------------------------------------------------------------ */

export function corsHeaders(request: Request): Record<string, string> {
  const cfg = studioConfig();
  const origin = request.headers.get("origin");
  const h: Record<string, string> = {
    "cache-control": "private, no-store",
    vary: "Origin",
  };
  if (cfg && origin === cfg.origin) {
    h["access-control-allow-origin"] = origin;
    h["access-control-allow-headers"] = "authorization, content-type";
    h["access-control-allow-methods"] = "GET, POST, OPTIONS";
    h["access-control-max-age"] = "600";
  }
  return h;
}

/* ------------------------------------------------------------------ */
/* Settling a reservation from what the studio says                    */
/* ------------------------------------------------------------------ */

export type SettleOutcome =
  | { status: "settled"; charged: number }
  | { status: "refunded" }
  | { status: "held" }
  | { status: "closed"; hold: string }
  | { status: "unreachable"; message: string };

/**
 * Charge or release one reservation according to the studio's own billing
 * status for its job. Safe to call again: a hold that is no longer open is
 * reported as it is, never changed twice.
 */
export async function settleHold(hold: CreditHoldRecord): Promise<SettleOutcome> {
  if (hold.status !== "open") return { status: "closed", hold: hold.status };
  if (!hold.job_ref) return { status: "held" };

  const d = decideSettlement(hold.amount, await fetchStudioJob(hold.job_ref));
  switch (d.action) {
    case "unreachable":
      return { status: "unreachable", message: d.message };
    case "wait":
      return { status: "held" };
    case "release":
      await releaseHold(hold.id, d.reason);
      return { status: "refunded" };
    case "capture": {
      const r = await captureHold({
        holdId: hold.id,
        actualAmount: d.amount,
        reference: { service: FACESTUDIO_V_SERVICE, job: hold.job_ref },
      });
      return { status: "settled", charged: r.charged ?? d.amount };
    }
  }
}

/** This user's open reservations for the trial, newest first. */
export async function openHoldsFor(userId: string, limit = 10): Promise<CreditHoldRecord[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at")
    .eq("service", FACESTUDIO_V_SERVICE)
    .eq("user_id", userId)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list open holds: ${error.message}`);
  return (data ?? []) as CreditHoldRecord[];
}

/**
 * Settle whatever this user left open (closed tab, lost connection) before a
 * new reservation, so stale holds never lock their credits or count against
 * the open-videos cap. A hold with no job after a few minutes never got as far
 * as the studio and is released.
 */
export async function reconcileOpenHolds(userId: string): Promise<void> {
  const holds = await openHoldsFor(userId);
  for (const h of holds) {
    if (h.job_ref) {
      await settleHold(h);
    } else if (Date.now() - Date.parse(h.created_at) > 10 * 60 * 1000) {
      await releaseHold(h.id, "no_job_started");
    }
  }
}

/**
 * Tie a reservation to a studio job, after checking the job really costs what
 * was reserved. A job priced above its reservation is stopped and the
 * reservation returned: the page asked for less than the studio charges.
 */
export async function attachStudioJob(
  hold: CreditHoldRecord,
  jobId: string
): Promise<{ ok: true } | { ok: false; reason: string; status: number }> {
  if (hold.status !== "open") return { ok: false, reason: "That reservation is already closed.", status: 409 };
  const job = await fetchStudioJob(jobId);
  if ("error" in job) return { ok: false, reason: job.error, status: 502 };
  if (!job.found) return { ok: false, reason: "The studio does not know that job.", status: 404 };

  if (!priceFits(hold.amount, job)) {
    await cancelStudioJob(jobId);
    await releaseHold(hold.id, "price_mismatch");
    return { ok: false, reason: "The price of this video changed; nothing was charged. Please try again.", status: 409 };
  }
  const attached = await attachJobToHold(hold.id, jobId);
  if (!attached) return { ok: false, reason: "That job is already attached to another reservation.", status: 409 };
  return { ok: true };
}

/**
 * Has this person ever bought credits? Only a purchase counts: signup credits,
 * trials, promos and admin adjustments do not (the studio's watermark policy).
 * A volume bonus is always attached to a purchase, so it needs no check of its own.
 */
export async function hasEverPurchased(userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("id")
    .eq("user_id", userId)
    .eq("kind", "purchase")
    .limit(1);
  if (error) throw new Error(`Failed to read purchases: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
