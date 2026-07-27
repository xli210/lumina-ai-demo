import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  return forwardToUpstream({
    demo: "faceswap",
    upstreamPath: "/v5/api/feedback",
    method: "POST",
    req,
  });
}
