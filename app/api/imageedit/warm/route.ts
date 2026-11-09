import { after, NextRequest } from "next/server";

import { privateJson, provisionCredits } from "@/lib/facestudio-gate";
import { callUpstream, isFaceStudioConfigured } from "@/lib/facestudio-server";
import { currentUserId, settleStaleEdits, signInRequired } from "@/lib/imageedit-server";
import { IMAGEEDIT_CREDITS_PER_EDIT } from "@/lib/imageedit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 50;

/**
 * POST /api/imageedit/warm [body: { gpu: true }]
 *
 * With no body, called when the editor opens, to wake the gateway while the
 * person is still choosing a photo. The gateway sleeps when idle and takes
 * about half a minute to answer the first request after that (measured 32 s on
 * 2026-10-06). It touches only /healthz, so it cannot start GPU work.
 *
 * With `gpu: true`, called once a photo is chosen, to start a GPU while it
 * uploads and the person writes the request. A GPU started and not used is
 * billed until its idle timeout, so only an account that can pay for an edit
 * may ask, and the gateway limits how often.
 *
 * Always answers 200: warming is an optimisation, never a reason to break the
 * page. It spends no credits.
 */
export async function POST(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return signInRequired();
  if (!isFaceStudioConfigured()) return privateJson({ ok: false, reason: "not_configured" }, 200);

  const body = (await request.json().catch(() => null)) as { gpu?: unknown } | null;
  try {
    if (body?.gpu === true) {
      if ((await provisionCredits(userId)).available < IMAGEEDIT_CREDITS_PER_EDIT) {
        return privateJson({ ok: false, reason: "insufficient_credits" }, 200);
      }
      await callUpstream("/ie/api/warm", { method: "POST", json: { user: userId }, timeoutMs: 45_000 });
    } else {
      // Edits whose page was closed, settled after the answer so the editor does not wait for them.
      after(() =>
        settleStaleEdits(5).catch((err: unknown) => {
          console.error("[imageedit] settling stale edits failed:", err instanceof Error ? err.message : err);
        })
      );
      await callUpstream("/healthz", { method: "GET", timeoutMs: 45_000 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn("[imageedit] warm failed (harmless):", message);
  }
  return privateJson({ ok: true }, 200);
}
