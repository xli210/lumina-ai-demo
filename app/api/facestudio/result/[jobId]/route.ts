import { NextRequest, NextResponse } from "next/server";

import { privateJson, requireJobOwner } from "@/lib/facestudio-gate";
import { fetchResult, getJobStatus } from "@/lib/facestudio-server";
import { upstreamWatermarked } from "@/lib/facestudio-watermark";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/facestudio/result/{jobId}
 * -> image/png at full resolution (up to ~4080x4080, around 20 MB)
 *
 * Streamed through this route rather than redirected to storage because the
 * console draws the result on a `<canvas>`, which needs a same-origin image.
 * The body is piped, not buffered — 20 MB through a function's memory for no
 * reason would be wasteful and slow.
 *
 * Never charges. Downloads repeat (the user re-saves, reloads, or the canvas
 * re-reads the image), and the render was already paid for at settlement.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { jobId } = await ctx.params;

  const gate = await requireJobOwner(jobId);
  if (!gate.ok) return gate.response;

  // A render owed the NanoPocket.ai mark is served only once the worker has
  // said it applied one. This route reads the image straight from storage, so
  // without this check an old worker's unmarked result could be fetched by
  // calling it directly before the status route had seen the mismatch.
  //
  // A settled hold needs no second look: the status route only settles a render
  // after it has seen `watermarked: true`. A released or expired hold is a
  // failed render, with no image to serve.
  if (gate.hold.estimate?.watermark === true && gate.hold.status !== "captured") {
    if (gate.hold.status !== "open") {
      return privateJson({ detail: "That result is not ready yet." }, 404);
    }
    try {
      const st = await getJobStatus(jobId);
      if (!upstreamWatermarked(st.body)) {
        return privateJson({ detail: "That result is not ready yet." }, 404);
      }
    } catch (err: unknown) {
      console.error("[facestudio] watermark check failed:", err instanceof Error ? err.message : err);
      return privateJson({ detail: "Could not fetch the result." }, 502);
    }
  }

  let upstream: Response;
  try {
    upstream = await fetchResult(jobId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] result fetch failed:", message);
    return privateJson({ detail: "Could not fetch the result." }, 502);
  }

  if (!upstream.ok) {
    return privateJson(
      { detail: "That result is not ready yet." },
      upstream.status === 404 ? 404 : 502
    );
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "image/png",
      // Private, but cacheable in the user's own browser: the console reads
      // the same image more than once while the user pans and compares.
      "cache-control": "private, max-age=86400",
    },
  });
}
