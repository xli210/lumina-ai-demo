import { NextRequest, NextResponse } from "next/server";

import { privateJson, requireJobOwner } from "@/lib/facestudio-gate";
import { fetchResult } from "@/lib/facestudio-server";

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
