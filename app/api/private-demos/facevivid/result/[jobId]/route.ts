import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/private-demos/facevivid/result/{jobId}
 * -> upstream GET /api/result/{jobId} -> image/png
 * Streamed through so we don't buffer multi-MB result images.
 */
export async function GET(req: NextRequest, ctx: RouteContext) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  const { jobId } = await ctx.params;
  return forwardToUpstream({
    demo: "facevivid",
    upstreamPath: `/api/result/${encodeURIComponent(jobId)}`,
    method: "GET",
    req,
  });
}
