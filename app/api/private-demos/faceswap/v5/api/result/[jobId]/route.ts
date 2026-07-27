import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/private-demos/faceswap/v5/api/result/{jobId}
 * -> upstream GET /v5/api/result/{jobId} -> image/png
 * Streamed to avoid buffering large PNGs into memory.
 */
export async function GET(req: NextRequest, ctx: RouteContext) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  const { jobId } = await ctx.params;
  return forwardToUpstream({
    demo: "faceswap",
    upstreamPath: `/v5/api/result/${encodeURIComponent(jobId)}`,
    method: "GET",
    req,
  });
}
