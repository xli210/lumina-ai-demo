import { NextRequest, NextResponse } from "next/server";

import { confirmSave, currentUserId, isSavedFaceId } from "@/lib/saved-faces-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** POST /api/saved-faces/{id}/confirm -> { face }: lists the face once its files are in storage. */
export async function POST(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const headers = { "cache-control": "private, no-store" };
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ detail: "Sign in to save faces." }, { status: 401, headers });
  if (!isSavedFaceId(id)) return NextResponse.json({ detail: "That face was not found." }, { status: 404, headers });
  try {
    const r = await confirmSave(userId, id);
    if (!r.ok) return NextResponse.json({ detail: r.detail }, { status: r.status, headers });
    return NextResponse.json({ face: r.face }, { headers });
  } catch (err: unknown) {
    console.error("[saved-faces] confirm failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ detail: "Could not save the face. Try again." }, { status: 503, headers });
  }
}
