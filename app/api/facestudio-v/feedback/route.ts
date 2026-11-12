import { FACESTUDIO_V_SERVICE } from "@/lib/facestudio-v";
import { saveResultFeedback } from "@/lib/result-feedback-server";
import { authenticate, preflight, readJson, reply } from "../_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 15;

export function OPTIONS(request: Request) {
  return preflight(request);
}

/**
 * POST /api/facestudio-v/feedback  { job, rating: "good" | "bad", reasons?, note?, detail? }  ->  { ok: true }
 *
 * "How was this result?" on the studio's finished screen, with the studio's sign-in (it is on another address,
 * so it cannot use the site's cookie). Same table and rules as /api/result-feedback.
 */
export async function POST(request: Request) {
  const auth = authenticate(request);
  if ("response" in auth) return auth.response;

  const body = await readJson(request);
  if (!body) return reply(request, { error: "Request body must be JSON." }, 400);

  try {
    const r = await saveResultFeedback(auth.userId, { ...body, service: FACESTUDIO_V_SERVICE });
    return r.ok ? reply(request, { ok: true }) : reply(request, { error: r.error }, r.status);
  } catch (err: unknown) {
    console.error("[facestudio-v] feedback failed:", err instanceof Error ? err.message : err);
    return reply(request, { error: "Could not save your answer. Please try again." }, 500);
  }
}
