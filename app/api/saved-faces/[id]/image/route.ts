import { NextRequest, NextResponse } from "next/server";

import { currentUserId, isSavedFaceId, savedFaceImage } from "@/lib/saved-faces-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/saved-faces/{id}/image -> image/jpeg, to the owner only.
 * Same origin on purpose: the tool reads it as a file and uploads it through its normal path.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const headers = { "cache-control": "private, no-store" };
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ detail: "Sign in to use your saved faces." }, { status: 401, headers });
  if (!isSavedFaceId(id)) return NextResponse.json({ detail: "That face was not found." }, { status: 404, headers });
  let res: Response | null;
  try {
    res = await savedFaceImage(userId, id);
  } catch (err: unknown) {
    console.error("[saved-faces] read failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ detail: "Could not load the face. Try again." }, { status: 502, headers });
  }
  if (!res) return NextResponse.json({ detail: "That face was not found." }, { status: 404, headers });
  return new NextResponse(res.body, {
    status: 200,
    headers: { "content-type": res.headers.get("content-type") ?? "image/jpeg", "cache-control": "private, no-store" },
  });
}
