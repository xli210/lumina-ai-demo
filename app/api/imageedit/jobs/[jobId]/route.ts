import { NextRequest } from "next/server";

import { privateJson } from "@/lib/facestudio-gate";
import { captureHold, getCreditAccount, releaseHold } from "@/lib/credits-server";
import {
  getEditStatus,
  outPrefixFor,
  requireEditOwner,
  toConsoleJob,
} from "@/lib/imageedit-server";
import { IMAGEEDIT_SERVICE } from "@/lib/imageedit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/imageedit/jobs/{jobId} -> the console's job view (+ available)
 *
 * Polled about once a second, and where the reservation is settled: charged
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

  const { job, terminal } = toConsoleJob(jobId, upstream.body, {
    createdAt: hold.created_at,
    outPrefix: outPrefixFor(userId, hold.id),
  });

  if (terminal && hold.status === "open") {
    try {
      if (terminal === "done") {
        const billed = upstream.body.executionTime;
        await captureHold({
          holdId: hold.id,
          actualAmount: hold.amount,
          reference: {
            service: IMAGEEDIT_SERVICE,
            job_ref: jobId,
            // RunPod's billed milliseconds, so cost per edit can be measured.
            billed_ms: typeof billed === "number" ? billed : null,
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
