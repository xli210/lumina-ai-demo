import { NextRequest } from "next/server";

import { privateJson, requireUser } from "@/lib/facestudio-gate";
import { detectStatus } from "@/lib/facestudio-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/** `<RunPod job id>.<unix seconds the job was queued>`: the gateway keeps no state. */
const DETECT_JOB_ID = /^[A-Za-z0-9-]{8,80}\.\d{9,11}$/;

/**
 * GET /api/facestudio/detect/status/{jobId}
 * -> { state: "starting" | "processing" | "done" | "error", ... }
 *
 * `starting` means waiting for a GPU (with `waited_s`), `processing` means a
 * GPU has the job, `done` carries `count` and `faces`, `error` carries
 * `error_code`, `error_message`, `error_kind`, `retryable` and `field`. The
 * gateway cancels a job that waits longer than 15 minutes, so the page needs
 * no timer of its own.
 *
 * Detection is not billed, so nothing is settled here. Signed-in only: the
 * reply holds thumbnails of the user's photo.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { jobId } = await ctx.params;
  if (!DETECT_JOB_ID.test(jobId)) {
    return privateJson(
      { state: "error", error_code: "job_not_found", error_kind: "user", retryable: false, detail: "Unknown job." },
      404
    );
  }

  try {
    const result = await detectStatus(jobId);
    return privateJson(result.body, result.status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] detect status failed:", message);
    // Not terminal: a blip talking to the gateway does not mean the job failed.
    // The page keeps polling and only complains after several in a row.
    return privateJson(
      {
        state: "error",
        error_code: "gpu_service_unreachable",
        error_kind: "server",
        retryable: true,
        detail: "Could not reach the face service. Retrying.",
      },
      502
    );
  }
}
