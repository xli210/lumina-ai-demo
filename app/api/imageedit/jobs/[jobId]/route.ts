import { NextRequest } from "next/server";

import { privateJson } from "@/lib/facestudio-gate";
import { captureHold, getCreditAccount, releaseHold } from "@/lib/credits-server";
import {
  getEditStatus,
  imageEditStorage,
  requireEditOwner,
  resultKeyFromUrl,
  toEditJob,
} from "@/lib/imageedit-server";
import { IMAGEEDIT_SERVICE } from "@/lib/imageedit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/imageedit/jobs/{jobId} -> the page's job view (+ available)
 *
 * Polled every two seconds, and where the reservation is settled: charged
 * when the edit lands, returned in full when it fails or is cancelled. Both
 * are keyed on the hold, so polling a finished job again changes nothing.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { jobId } = await ctx.params;
  const gate = await requireEditOwner(jobId);
  if (!gate.ok) return gate.response;
  const { userId, hold } = gate;

  let upstream;
  try {
    upstream = await getEditStatus(jobId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[imageedit] status fetch failed:", message);
    // Not terminal: a blip must not settle the hold.
    return privateJson({ detail: "Could not reach the editing service. Retrying." }, 502);
  }
  if (upstream.status >= 400) {
    return privateJson({ detail: "Could not read the edit's status. Retrying." }, 502);
  }

  const bucket = imageEditStorage()?.bucket ?? "";
  const { job, terminal } = toEditJob(jobId, upstream.body, {
    credits: hold.amount,
    // Anything but a recorded "no mark needed" means the mark is needed.
    mustBeWatermarked: hold.estimate?.watermark !== false,
    resultKey: (pngUrl) => resultKeyFromUrl(pngUrl, bucket),
  });

  if (terminal && hold.status === "open") {
    try {
      if (terminal === "done") {
        const billed = upstream.body.executionTime;
        const queued = upstream.body.delayTime;
        await captureHold({
          holdId: hold.id,
          actualAmount: hold.amount,
          reference: {
            service: IMAGEEDIT_SERVICE,
            job_ref: jobId,
            // RunPod's milliseconds, so cost per edit and cold starts can be measured.
            billed_ms: typeof billed === "number" ? billed : null,
            queued_ms: typeof queued === "number" ? queued : null,
          },
        });
      } else {
        await releaseHold(hold.id, terminal === "cancelled" ? "cancelled" : "edit_failed");
      }
    } catch (err: unknown) {
      // The edit's outcome is still shown; the next poll retries settlement.
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[imageedit] settle (${terminal}) failed:`, message);
    }
  }

  if (!terminal) return privateJson(job, 200);
  const account = await getCreditAccount(userId);
  return privateJson({ ...job, available: account.available }, 200);
}
