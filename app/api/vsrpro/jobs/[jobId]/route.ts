import { NextRequest } from "next/server";
import { adminGate } from "@/lib/private-demo-proxy";
import { getJob } from "@/lib/vsrpro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/vsrpro/jobs/{jobId}
 * -> upstream GET /v1/jobs/{job_id}
 *
 * Polled by the console every ~6 s. Re-polling after `output_url` expires is
 * also how a caller gets a fresh download URL, so this stays callable for the
 * lifetime of the job record.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  const { jobId } = await ctx.params;
  return getJob(jobId);
}
