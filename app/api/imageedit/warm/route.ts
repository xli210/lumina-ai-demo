import { privateJson } from "@/lib/facestudio-gate";
import { callUpstream, isFaceStudioConfigured } from "@/lib/facestudio-server";
import { currentUserId, signInRequired } from "@/lib/imageedit-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 50;

/**
 * POST /api/imageedit/warm
 *
 * Called when the editor opens, to wake the gateway while the person is still
 * choosing a photo. The gateway sleeps when idle and takes about half a minute
 * to answer the first request after that (measured 32 s on 2026-10-06), which
 * is longer than a visitor will stare at a spinner, and it used to land on the
 * first edit. Asking now hides it behind the time it takes to pick a file.
 *
 * Always answers 200: warming is an optimisation, never a reason to break the
 * page. It touches only /healthz, so it cannot start GPU work or spend credits.
 */
export async function POST() {
  if (!(await currentUserId())) return signInRequired();
  if (!isFaceStudioConfigured()) return privateJson({ ok: false, reason: "not_configured" }, 200);

  try {
    await callUpstream("/healthz", { method: "GET", timeoutMs: 45_000 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn("[imageedit] gateway warm failed (harmless):", message);
  }
  return privateJson({ ok: true }, 200);
}
