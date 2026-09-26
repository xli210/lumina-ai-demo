import { requireUser, privateJson } from "@/lib/facestudio-gate";
import { isFaceStudioConfigured, warmGateway } from "@/lib/facestudio-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/facestudio/visit
 *
 * Called when the console opens, to start a GPU worker while the user is
 * still picking a photo. That hides a 1-20 s cold start.
 *
 * Always answers 200: warming is an optimisation, and a user who cannot be
 * warmed should still see a working page. The gateway rate-limits this on its
 * own side, so a reload loop cannot turn it into a way to burn GPU time.
 */
export async function POST() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  if (!isFaceStudioConfigured()) {
    return privateJson({ ok: false, reason: "not_configured" }, 200);
  }

  try {
    await warmGateway();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn("[facestudio] warm failed (harmless):", message);
  }

  return privateJson({ ok: true }, 200);
}
