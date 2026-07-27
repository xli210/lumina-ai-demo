import { NextRequest } from "next/server";
import { adminGate, forwardToUpstream } from "@/lib/private-demo-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/private-demos/facevivid/visit
 * Analytics ping fired by the frontend on page load. Best-effort \u2014
 * a failed upstream call must not break the page. The adminGate still
 * runs first so we don't accept anonymous visit pings on this hidden URL.
 */
export async function POST(req: NextRequest) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  return forwardToUpstream({
    demo: "facevivid",
    upstreamPath: "/api/visit",
    method: "POST",
    req,
  });
}
