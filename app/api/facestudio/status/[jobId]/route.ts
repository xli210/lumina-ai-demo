import { NextRequest } from "next/server";

import { privateJson, requireJobOwner } from "@/lib/facestudio-gate";
import { getJobStatus, upstreamString } from "@/lib/facestudio-server";
import { captureHold, getCreditAccount, releaseHold } from "@/lib/credits-server";
import { WATERMARK_MISSING_BODY as RENDER_NOT_FINISHED_BODY, owesMissingWatermark } from "@/lib/facestudio-watermark";

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
 *
 * A settled render is answered from its hold. RunPod forgets a job some time
 * after it ends, and the page asks again about the last job whenever it is
 * reopened in the next 24 hours; the gateway reports a forgotten job as a 502,
 * which the page takes for a blip and retries.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { jobId } = await ctx.params;

  const gate = await requireJobOwner(jobId);
  if (!gate.ok) return gate.response;
  const { userId, hold } = gate;

  // Captured only after the render was seen to land, watermark included, and
  // its image is read from storage, so nothing is left to ask the gateway.
  if (hold.status === "captured") {
    const account = await getCreditAccount(userId);
    return privateJson(
      {
        status: "done",
        state: "done",
        ok: true,
        progress_pct: 1,
        ...(hold.estimate?.watermark === true ? { watermarked: true } : {}),
        credits_charged: 0,
        balance: account.balance,
        available: account.available,
      },
      200
    );
  }

  if (hold.status === "released") {
    const account = await getCreditAccount(userId);
    return privateJson(
      { ...RENDER_NOT_FINISHED_BODY, credits_charged: 0, balance: account.balance, available: account.available },
      200
    );
  }

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

  // The sweeper freed this hold, so a render can still land after it; once the
  // gateway has no answer either there is nothing left to wait for.
  if (hold.status === "expired" && upstream.status >= 500) {
    const account = await getCreditAccount(userId);
    return privateJson(
      { ...RENDER_NOT_FINISHED_BODY, credits_charged: 0, balance: account.balance, available: account.available },
      200
    );
  }

  const status = upstreamString(upstream.body, "status");
  const settled = hold.status !== "open";

  // A render that was owed the NanoPocket.ai mark and came back without it
  // (the job landed on an old worker image) must not be handed over, or billed.
  // Treated as a failed render: credits returned, the user is told to retry.
  if (status === "done" && owesMissingWatermark(hold.estimate?.watermark, upstream.body)) {
    console.error("[facestudio] watermark requested but missing:", jobId);
    if (!settled) {
      try {
        await releaseHold(hold.id, "watermark_missing");
      } catch (err: unknown) {
        console.error("[facestudio] release after missing watermark failed:", err instanceof Error ? err.message : err);
      }
    }
    const account = await getCreditAccount(userId);
    return privateJson(
      { ...RENDER_NOT_FINISHED_BODY, credits_charged: 0, balance: account.balance, available: account.available },
      200
    );
  }

  if (status === "done") {
    let charged = settled ? 0 : hold.amount;
    if (!settled) {
      try {
        // Record what the render actually took. Pricing is currently linear
        // in face count, which ignores the fixed per-render overhead; pairing
        // elapsed time with the face count already in the hold's estimate is
        // what will let that curve be fitted from real jobs instead of
        // re-guessed.
        const elapsed = upstream.body.elapsed_seconds;
        const capture = await captureHold({
          holdId: hold.id,
          actualAmount: hold.amount,
          reference: {
            service: "facestudio",
            job_ref: jobId,
            elapsed_seconds: typeof elapsed === "number" ? elapsed : null,
          },
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
        // The gateway says whose fault it is: a photo with no usable face is the
        // person's input, not a GPU failure, and the reliability page must not
        // count it against us.
        const reason = upstreamString(upstream.body, "error_kind") === "user" ? "input_rejected" : "render_failed";
        await releaseHold(hold.id, reason);
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
