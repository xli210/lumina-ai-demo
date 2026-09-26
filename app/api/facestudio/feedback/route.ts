import { NextRequest } from "next/server";

import { privateJson, requireJobOwner } from "@/lib/facestudio-gate";
import { sendFeedback } from "@/lib/facestudio-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const RATINGS: readonly string[] = ["up", "down"];

/**
 * POST /api/facestudio/feedback
 * body: { job_id, rating: "up" | "down" }
 *
 * Ownership-checked so a rating can only be left on a render the caller paid
 * for, which is what stops the signal from being trivially poisoned.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }

  const input = new Map(Object.entries((body ?? {}) as object));
  const jobId = input.get("job_id");
  const rating = input.get("rating");

  if (typeof jobId !== "string") {
    return privateJson({ detail: "job_id is required." }, 400);
  }
  if (typeof rating !== "string" || !RATINGS.some((r) => r === rating)) {
    return privateJson({ detail: "rating must be 'up' or 'down'." }, 400);
  }

  const gate = await requireJobOwner(jobId);
  if (!gate.ok) return gate.response;

  try {
    const result = await sendFeedback({ jobId, rating });
    return privateJson(result.body, result.status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Losing a thumbs-up is not worth an error in the user's face.
    console.warn("[facestudio] feedback failed:", message);
    return privateJson({ ok: true }, 200);
  }
}
