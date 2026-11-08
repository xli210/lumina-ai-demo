import { NextRequest } from "next/server";

import { privateJson } from "@/lib/facestudio-gate";
import {
  currentUserId,
  isImageEditConfigured,
  probePhoto,
  signInRequired,
  userMayEdit,
} from "@/lib/imageedit-server";
import { IMAGEEDIT_NAME, creditsForPhoto } from "@/lib/imageedit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const GONE = "That photo is not available any more. Upload it again.";

/**
 * POST /api/imageedit/photo
 * body: { key } -> { id, width, height, credits }
 *
 * After the upload: is this a photo we can edit, and what will an edit of it
 * cost? The result of the person's own edit can be named too ("Keep editing
 * this"), which saves sending a full-resolution PNG back and forth. The file
 * is read again when the edit starts, since the upload URL can still replace it.
 */
export async function POST(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return signInRequired();

  if (!isImageEditConfigured()) {
    return privateJson({ detail: `${IMAGEEDIT_NAME} is not configured on this deployment.` }, 503);
  }

  let key: unknown;
  try {
    key = ((await request.json()) as { key?: unknown }).key;
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }
  if (typeof key !== "string" || key.length > 200) return privateJson({ detail: GONE }, 400);

  try {
    if (!(await userMayEdit(userId, key))) return privateJson({ detail: GONE }, 400);
    // Long enough for a sleeping gateway to wake (about 32 s measured).
    const probe = await probePhoto(key, 50_000);
    if (!probe.ok) return privateJson({ detail: probe.detail }, probe.status);
    return privateJson(
      { id: key, width: probe.width, height: probe.height, credits: creditsForPhoto(probe.width, probe.height) },
      200
    );
  } catch (err: unknown) {
    console.error("[imageedit] photo check failed:", err instanceof Error ? err.message : err);
    return privateJson({ detail: "Could not read the photo. Please try again." }, 502);
  }
}
