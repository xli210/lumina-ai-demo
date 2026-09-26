import { NextRequest } from "next/server";

import { privateJson, requireJobOwner } from "@/lib/facestudio-gate";
import { getJobStatus, upstreamString } from "@/lib/facestudio-server";
import { captureHold, getCreditAccount, releaseHold } from "@/lib/credits-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/facestudio/status/{jobId}
 * -> { status, progress_pct, elapsed_seconds, error?, credits_charged?, balance? }
 *
 * Polled by the console every 1.5 s, and the place where a reservation is
 * settled: charged in full when the render lands, returned in full when it
 * fails. A render that produced no image is not billable.
 *
 * Safe to poll repeatedly. `credit_capture` and `credit_release` are both
 * keyed on the hold, so the second and later reports of the same terminal
 * state change nothing.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { jobId } = await ctx.params;

  const gate = await requireJobOwner(jobId);
  if (!gate.ok) return gate.response;
  const { userId, hold } = gate;

  let upstream;
  try {
    upstream = await getJobStatus(jobId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] status fetch failed:", message);
    // Deliberately not a terminal state: a blip talking to the gateway must
    // not settle the hold, or a running render would be refunded and then
    // charged again on the next poll.
    return privateJson(
      { detail: "Could not reach the render service. Retrying." },
      502
    );
  }

  const status = upstreamString(upstream.body, "status");
  const settled = hold.status !== "open";

  if (status === "done") {
    let charged = settled ? 0 : hold.amount;
    if (!settled) {
      try {
        const capture = await captureHold({
          holdId: hold.id,
          actualAmount: hold.amount,
          reference: { service: "facestudio", job_ref: jobId },
        });
        charged = capture.charged ?? hold.amount;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        // The render succeeded; failing the poll would hide a finished image
        // from the user over a bookkeeping error. The hold stays open and the
        // next poll retries the capture.
        console.error("[facestudio] capture failed:", message);
        charged = 0;
      }
    }

    const account = await getCreditAccount(userId);
    return privateJson(
      {
        ...upstream.body,
        credits_charged: charged,
        balance: account.balance,
        available: account.available,
      },
      upstream.status
    );
  }

  if (status === "error") {
    if (!settled) {
      try {
        await releaseHold(hold.id, "render_failed");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        // The sweeper frees it at TTL, so the user is not permanently out of
        // pocket, but they cannot spend those credits until then.
        console.error("[facestudio] release after failure failed:", message);
      }
    }

    const account = await getCreditAccount(userId);
    return privateJson(
      {
        ...upstream.body,
        credits_charged: 0,
        balance: account.balance,
        available: account.available,
      },
      upstream.status
    );
  }

  // queued / running: nothing to settle yet.
  return privateJson(upstream.body, upstream.status);
}
