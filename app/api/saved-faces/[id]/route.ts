import { NextRequest, NextResponse } from "next/server";

import { currentUserId, deleteSavedFace, isSavedFaceId } from "@/lib/saved-faces-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** DELETE /api/saved-faces/{id}: removes the face from My faces and both its files from storage. */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const headers = { "cache-control": "private, no-store" };
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ detail: "Sign in to manage your saved faces." }, { status: 401, headers });
  if (!isSavedFaceId(id)) return NextResponse.json({ detail: "That face was not found." }, { status: 404, headers });
  try {
    const deleted = await deleteSavedFace(userId, id);
    if (!deleted) return NextResponse.json({ detail: "That face was not found." }, { status: 404, headers });
    return NextResponse.json({ deleted: true }, { headers });
  } catch (err: unknown) {
    console.error("[saved-faces] delete failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ detail: "Could not delete the face. Try again." }, { status: 503, headers });
  }
}
