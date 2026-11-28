import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { captureHold, releaseHold, type CreditHoldRecord } from "@/lib/credits-server";
import { FACESTUDIO_HOLD_TTL_SECONDS, FACESTUDIO_SERVICE } from "@/lib/facestudio";
import { getJobStatus } from "@/lib/facestudio-server";
import { returnDailyFree } from "@/lib/facestudio-daily-free";
import { decidePhotoSettlement, type PhotoUpstream } from "@/lib/facestudio-settle-rules";
import type { StaleReport } from "@/lib/settle-sweep";

/**
 * Settle the Nano FaceStudio Online reservations whose page was closed before the render landed: the same rules as the status route
 * (lib/facestudio-settle-rules.ts), run by the timed settle (/api/facestudio-v/settle-stale) like the video, HeadSwap Pro and SpotEdit ones.
 *
 * Only reservations old enough that the page has had its chance (MIN_AGE_MS) and young enough that they have not expired yet: one past its
 * time is the expiry sweep's (it returns the credits, as before). That bound also keeps a job the gateway has forgotten (a 5xx) from holding
 * the sweep back for ever.
 *
 * Safe beside the page's own polling: capture and release lock the reservation and change only an open one, and a daily free swap's
 * credits are taken back only by the call whose release actually happened (and returnDailyFree is keyed on the hold anyway).
 */
const MIN_AGE_MS = 2 * 60 * 1000;

export async function settleStalePhotoHolds(limit = 20, report?: StaleReport): Promise<number> {
  const now = Date.now();
  const { data, error } = await createAdminClient()
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at, estimate")
    .eq("service", FACESTUDIO_SERVICE)
    .eq("status", "open")
    .not("job_ref", "is", null)
    .lt("created_at", new Date(now - MIN_AGE_MS).toISOString())
    .gt("created_at", new Date(now - FACESTUDIO_HOLD_TTL_SECONDS * 1000).toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`Failed to list open photo holds: ${error.message}`);
  let settled = 0;
  for (const hold of (data ?? []) as CreditHoldRecord[]) {
    if (report) report.seen += 1;
    try {
      const outcome = await settlePhotoHold(hold);
      if (outcome === "settled") settled += 1;
      if (outcome === "unreachable" && report) report.unreachable += 1;
    } catch (err: unknown) {
      if (report) report.failed += 1;
      console.error("[facestudio] settling a stale hold failed:", err instanceof Error ? err.message : err);
    }
  }
  if (report) report.settled += settled;
  return settled;
}

async function settlePhotoHold(hold: CreditHoldRecord): Promise<"settled" | "waiting" | "unreachable"> {
  if (!hold.job_ref) return "waiting";
  const estimate = hold.estimate ?? null;
  let upstream: PhotoUpstream;
  try {
    // finish=free for a free render, as the page asks: the gateway then makes its free version before it says done.
    upstream = await getJobStatus(hold.job_ref, { finishFree: estimate?.free_output === true });
  } catch (err: unknown) {
    upstream = { error: err instanceof Error ? err.message : String(err) };
  }
  const d = decidePhotoSettlement(upstream, estimate);
  switch (d.action) {
    case "wait":
      return "waiting";
    case "unreachable":
      return "unreachable";
    case "release": {
      const released = await releaseHold(hold.id, d.reason);
      if (released && estimate?.daily_free === true) {
        await returnDailyFree({ userId: hold.user_id, credits: hold.amount, holdId: hold.id });
      }
      if (d.reason === "watermark_missing" || d.reason === "free_finish_missing") {
        console.error(`[facestudio] stale hold ${hold.id}: ${d.reason}`);
      }
      return "settled";
    }
    case "capture": {
      const body = "body" in upstream ? upstream.body : {};
      const elapsed = body.elapsed_seconds;
      await captureHold({
        holdId: hold.id,
        actualAmount: hold.amount,
        reference: {
          service: "facestudio",
          job_ref: hold.job_ref,
          elapsed_seconds: typeof elapsed === "number" ? elapsed : null,
          settled_by: "stale",
        },
      });
      return "settled";
    }
  }
}
