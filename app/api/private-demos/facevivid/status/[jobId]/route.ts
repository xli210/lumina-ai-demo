import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  const { jobId } = await ctx.params;
  return forwardToUpstream({
    demo: "facevivid",
    upstreamPath: `/api/status/${encodeURIComponent(jobId)}`,
    method: "GET",
    req,
  });
}
