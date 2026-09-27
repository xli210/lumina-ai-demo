import { NextRequest, NextResponse } from "next/server";
import { adminGate } from "@/lib/private-demo-proxy";
import { createJob } from "@/lib/vsrpro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/vsrpro/jobs
 * body: { input_key, resolution?, model? }
 * -> upstream POST /v1/jobs -> { job_id, status }
 *
 * Only enqueues; the render happens on a worker and is observed through
 * GET /api/vsrpro/jobs/{job_id}.
 */
export async function POST(req: NextRequest) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { detail: "Request body must be JSON." },
      { status: 400 }
    );
  }

  return createJob(body);
}
