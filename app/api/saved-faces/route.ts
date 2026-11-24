import { NextRequest, NextResponse } from "next/server";

import {
  SAVED_FACES_MAX,
  SAVED_FACE_MAX_BYTES,
  SAVED_FACE_MAX_SIDE,
  currentUserId,
  isSavedFaceSource,
  listSavedFaces,
  startSave,
} from "@/lib/saved-faces-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });
}

/**
 * GET /api/saved-faces -> { faces: [{ id, thumb, image, createdAt, lastUsedAt }], max, max_side, max_bytes }
 * The signed-in person's My faces (lib/saved-faces-server.ts). 401 when signed out; 503 when it is not set up here.
 */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return json({ detail: "Sign in to see your saved faces." }, 401);
  try {
    const faces = await listSavedFaces(userId);
    return json({ faces, max: SAVED_FACES_MAX, max_side: SAVED_FACE_MAX_SIDE, max_bytes: SAVED_FACE_MAX_BYTES });
  } catch (err: unknown) {
    console.error("[saved-faces] list failed:", err instanceof Error ? err.message : err);
    return json({ detail: "My faces is not available right now." }, 503);
  }
}

/**
 * POST /api/saved-faces  body: { source: "facestudio" | "headswap-pro", consent: true, width?, height? }
 * -> { id, upload_url, thumb_upload_url }: the browser PUTs the photo (JPEG) and its thumbnail there, then calls
 * POST /api/saved-faces/{id}/confirm. `consent` must be true: the person confirmed the sentence that says the photo is kept.
 */
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return json({ detail: "Sign in to save faces." }, 401);
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ detail: "Request body must be JSON." }, 400);
  }
  if (body?.consent !== true) return json({ detail: "Confirm that the photo may be kept before saving it." }, 400);
  if (!isSavedFaceSource(body.source)) return json({ detail: "Unknown tool." }, 400);
  try {
    const started = await startSave(userId, {
      source: body.source,
      width: body.width as number | undefined,
      height: body.height as number | undefined,
    });
    if (!started.ok) return json({ detail: started.detail, reason: started.reason }, started.status);
    return json({ id: started.id, upload_url: started.uploadUrl, thumb_upload_url: started.thumbUploadUrl });
  } catch (err: unknown) {
    console.error("[saved-faces] start failed:", err instanceof Error ? err.message : err);
    return json({ detail: "Could not save the face. Try again." }, 503);
  }
}
