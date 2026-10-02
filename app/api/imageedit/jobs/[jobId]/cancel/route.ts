import { NextRequest } from "next/server";

import { privateJson } from "@/lib/facestudio-gate";
import { cancelEdit, requireEditOwner } from "@/lib/imageedit-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * POST /api/imageedit/jobs/{jobId}/cancel -> { ok }
 *
 * Asks RunPod to stop the job. The refund happens on the next status poll,
 * when the job reports CANCELLED, so a cancel that arrives after the edit
 * finished is charged like any finished edit.
 */
export async function POST(_req: NextRequest, ctx: RouteContext) {
  const { jobId } = await ctx.params;
  const gate = await requireEditOwner(jobId);
  if (!gate.ok) return gate.response;

  try {
    await cancelEdit(jobId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[imageedit] cancel failed:", message);
    return privateJson({ detail: "Could not cancel the edit." }, 502);
  }
  return privateJson({ ok: true }, 200);
}
