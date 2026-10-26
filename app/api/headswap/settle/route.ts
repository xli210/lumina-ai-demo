import { NextRequest } from "next/server";

import { getCreditAccount } from "@/lib/credits-server";
import { HEADSWAP_PRO_SERVICE } from "@/lib/headswap-pro";
import { currentUserId, holdOf, privateJson, settleHold } from "@/lib/headswap-pro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/headswap/settle  { hold_id, abandon? }  ->  { status: "settled" | "refunded" | "held" | "closed", charged?, available }
 *
 * Charge or release a reservation. The page does not get to say how it went: this asks the gateway.
 * With no job attached (the swap never started) the reservation is given back when the page says it
 * was abandoned, or after a few minutes. Safe to call again and again: a closed reservation is
 * reported as it is, never changed twice.
 */
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
  if (!holdId) return privateJson({ detail: "hold_id is required." }, 400);

  try {
    const hold = await holdOf(userId, holdId);
    if (!hold || hold.service !== HEADSWAP_PRO_SERVICE) return privateJson({ detail: "That reservation is not yours or does not exist." }, 404);
    if (hold.status !== "open") return privateJson({ status: "closed", hold: hold.status }, 200);

    const out = await settleHold(hold, body.abandon === true);
    if (out.status === "held") return privateJson({ status: "held", note: out.note }, out.note ? 202 : 200);
    const a = await getCreditAccount(userId);
    return privateJson(
      out.status === "settled"
        ? { status: "settled", charged: out.charged, available: a.available }
        : { status: "refunded", reason: out.reason, available: a.available },
      200
    );
  } catch (err: unknown) {
    console.error("[headswap] settle failed:", err instanceof Error ? err.message : err);
    return privateJson({ detail: "Could not settle your credits right now. They stay reserved and are settled automatically." }, 500);
  }
}
