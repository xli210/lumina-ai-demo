import { owesFreeFinish, owesMissingWatermark } from "@/lib/facestudio-watermark";

/**
 * What to do with an open Nano FaceStudio Online reservation, given what the gateway says about its job. Pure: no database, no network.
 *
 * The page settles its own render when it polls /api/facestudio/status/[jobId]. A person who closed the page left the reservation open,
 * and it expired after FACESTUDIO_HOLD_TTL_SECONDS: the credits went back although the picture was made (2026-11-28). The timed settle
 * (/api/facestudio-v/settle-stale) now asks the gateway the same question, and these are the status route's own rules, case for case:
 *
 *   done, owed the NanoPocket.ai mark but without it       -> release "watermark_missing"   (never handed over, never billed)
 *   done, a free render without its free version           -> release "free_finish_missing"
 *   done                                                   -> capture the reserved amount
 *   error, the gateway says it was the person's photo      -> release "input_rejected"
 *   error                                                  -> release "render_failed"
 *   anything else (queued, running, a status it lacks)     -> wait
 *
 * A gateway that cannot be asked (an exception, or a 5xx answer) is "unreachable": the reservation stays open, as on the page.
 */

export type PhotoUpstream = { status: number; body: Record<string, unknown> } | { error: string };

export type PhotoDecision =
  | { action: "wait" }
  | { action: "unreachable"; message: string }
  | { action: "capture" }
  | { action: "release"; reason: "watermark_missing" | "free_finish_missing" | "input_rejected" | "render_failed" };

function str(body: Record<string, unknown>, key: string): string | undefined {
  const v = body[key];
  return typeof v === "string" ? v : undefined;
}

export function decidePhotoSettlement(upstream: PhotoUpstream, estimate: Record<string, unknown> | null | undefined): PhotoDecision {
  if ("error" in upstream) return { action: "unreachable", message: upstream.error };
  if (upstream.status >= 500) return { action: "unreachable", message: `the gateway answered ${upstream.status}` };
  const status = str(upstream.body, "status");
  if (status === "done") {
    if (owesMissingWatermark(estimate?.watermark, upstream.body)) return { action: "release", reason: "watermark_missing" };
    if (estimate?.free_output === true && owesFreeFinish(true, upstream.body)) return { action: "release", reason: "free_finish_missing" };
    return { action: "capture" };
  }
  if (status === "error") {
    return { action: "release", reason: str(upstream.body, "error_kind") === "user" ? "input_rejected" : "render_failed" };
  }
  return { action: "wait" };
}
