import { privateJson, provisionCredits } from "@/lib/facestudio-gate";
import {
  currentUserId,
  isImageEditConfigured,
  newSourceKey,
  signInRequired,
  signUpload,
} from "@/lib/imageedit-server";
import {
  IMAGEEDIT_CREDITS_PER_EDIT,
  IMAGEEDIT_MAX_SIDE,
  IMAGEEDIT_NAME,
} from "@/lib/imageedit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/imageedit/uploads -> { id, key, put_url, max_side }
 *
 * Mints a presigned PUT for one PNG. The page re-encodes the photo itself
 * (orientation fixed, long side capped) and PUTs it straight to R2, so the
 * bytes never pass through this function.
 *
 * Requires enough credits for one edit: an upload is only useful as the first
 * step of a paid edit, and without the check anyone signed in could use the
 * bucket as free storage.
 */
export async function POST() {
  const userId = await currentUserId();
  if (!userId) return signInRequired();

  if (!isImageEditConfigured()) {
    return privateJson({ detail: `${IMAGEEDIT_NAME} is not configured on this deployment.` }, 503);
  }

  let available: number;
  try {
    available = (await provisionCredits(userId)).available;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[imageedit] balance read failed:", message);
    return privateJson({ detail: "Could not read your balance." }, 500);
  }

  if (available < IMAGEEDIT_CREDITS_PER_EDIT) {
    return privateJson(
      {
        detail: `An edit costs ${IMAGEEDIT_CREDITS_PER_EDIT} credits and you have ${available}. Buy credits to keep going, or come back tomorrow for the free daily allowance.`,
        reason: "insufficient_credits",
        required: IMAGEEDIT_CREDITS_PER_EDIT,
        available,
        topup_url: "/credits",
      },
      402
    );
  }

  const { id, key } = newSourceKey(userId);
  return privateJson({ id, key, put_url: signUpload(key), max_side: IMAGEEDIT_MAX_SIDE }, 200);
}
