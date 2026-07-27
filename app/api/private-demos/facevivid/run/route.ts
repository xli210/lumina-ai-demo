import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/private-demos/facevivid/run
 * multipart body: image, detail_strength
 * -> upstream POST /api/run -> { job_id }
 */
export async function POST(req: NextRequest) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  return forwardToUpstream({
    demo: "facevivid",
    upstreamPath: "/api/run",
    method: "POST",
    req,
  });
}
