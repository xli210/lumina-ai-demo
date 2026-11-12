import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { saveResultFeedback } from "@/lib/result-feedback-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 15;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });
}

/**
 * POST /api/result-feedback  { service, job, rating: "good" | "bad", reasons?, note?, detail? }  ->  { ok: true }
 *
 * The photo tools' "How was this result?" (public/result-feedback.js). The video studio, on another address,
 * sends the same body to /api/facestudio-v/feedback with its own sign-in.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "Sign in first." }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Request body must be JSON." }, 400);
  }

  try {
    const r = await saveResultFeedback(user.id, body ?? {});
    return r.ok ? json({ ok: true }) : json({ error: r.error }, r.status);
  } catch (err: unknown) {
    console.error("[result-feedback] save failed:", err instanceof Error ? err.message : err);
    return json({ error: "Could not save your answer. Please try again." }, 500);
  }
}
