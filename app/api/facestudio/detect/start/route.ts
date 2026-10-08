import { NextRequest } from "next/server";

import { privateJson, requireSpendableBalance } from "@/lib/facestudio-gate";
import { detectStart, isFaceStudioConfigured } from "@/lib/facestudio-server";
import { isStorageKey } from "@/lib/facestudio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Only queues the job; the wait for a GPU happens in /detect/status polls.
export const maxDuration = 30;

/**
 * POST /api/facestudio/detect/start
 * body: { input_key }   (from /api/facestudio/uploads)
 * -> { job_id, state: "starting" }
 *
 * The asynchronous form of /api/facestudio/detect. Detection is the first GPU
 * job of every session, so it absorbs the whole cold start, from under a
 * second to several minutes. Holding one request open through that is what
 * produced "Timed out waiting for a GPU", so this returns at once and the
 * page polls /api/facestudio/detect/status/{jobId}.
 *
 * Same gate as the synchronous route: free to the user, but it does occupy a
 * GPU, so it needs a spendable balance.
 */
export async function POST(req: NextRequest) {
  const gate = await requireSpendableBalance();
  if (!gate.ok) return gate.response;

  if (!isFaceStudioConfigured()) {
    return privateJson(
      {
        state: "error",
        error_code: "not_configured",
        error_kind: "server",
        retryable: false,
        detail: "Nano FaceStudio Online is not configured on this deployment.",
      },
      503
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }

  const inputKey = new Map(Object.entries((body ?? {}) as object)).get("input_key");
  if (!isStorageKey(inputKey)) {
    return privateJson(
      { detail: "input_key is missing or malformed. Upload the photo again." },
      400
    );
  }

  try {
    const result = await detectStart(inputKey);
    return privateJson(result.body, result.status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] detect start failed:", message);
    return privateJson(
      {
        state: "error",
        error_code: "gpu_service_unreachable",
        error_kind: "server",
        retryable: true,
        detail: "Could not reach the face service. Please try again.",
      },
      502
    );
  }
}
