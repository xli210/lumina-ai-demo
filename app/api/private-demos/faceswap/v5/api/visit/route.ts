import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/private-demos/faceswap/v5/api/visit
 * Analytics ping fired by the frontend on page load. Best-effort;
 * upstream failure must not break the page.
 */
export async function POST(req: NextRequest) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  return forwardToUpstream({
    demo: "faceswap",
    upstreamPath: "/v5/api/visit",
    method: "POST",
    req,
  });
}
