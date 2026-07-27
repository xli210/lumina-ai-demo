import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/private-demos/faceswap/v5/api/detect
 * multipart body: body_image
 * -> upstream POST /v5/api/detect -> detection response
 */
export async function POST(req: NextRequest) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  return forwardToUpstream({
    demo: "faceswap",
    upstreamPath: "/v5/api/detect",
    method: "POST",
    req,
  });
}
