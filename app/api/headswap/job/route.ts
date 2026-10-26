import { NextRequest } from "next/server";

import { attachJobToHold } from "@/lib/credits-server";
import { isGatewayJobId } from "@/lib/headswap-pro";
import { currentUserId, holdOf, privateJson } from "@/lib/headswap-pro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/** POST /api/headswap/job  { hold_id, job }  ->  { ok: true }: tie the reservation to the gateway's job. */
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return privateJson({ detail: "Sign in first." }, 401);

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }
  const holdId = typeof body.hold_id === "string" ? body.hold_id : "";
  if (!holdId || !isGatewayJobId(body.job)) return privateJson({ detail: "hold_id and job are required." }, 400);

  try {
    const hold = await holdOf(userId, holdId);
    if (!hold) return privateJson({ detail: "That reservation is not yours or does not exist." }, 404);
    if (hold.status !== "open") return privateJson({ detail: "That reservation is already closed." }, 409);
    const ok = await attachJobToHold(hold.id, body.job);
    if (!ok) return privateJson({ detail: "That job is already attached to another reservation." }, 409);
    return privateJson({ ok: true }, 200);
  } catch (err: unknown) {
    console.error("[headswap] attach failed:", err instanceof Error ? err.message : err);
    return privateJson({ detail: "Could not record the job. Your credits stay reserved and come back if it does not run." }, 500);
  }
}
