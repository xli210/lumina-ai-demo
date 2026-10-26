import { countOpenHolds, hasEverPurchased, holdCredits, releaseExpiredHolds } from "@/lib/credits-server";
import { provisionCredits } from "@/lib/facestudio-gate";
import {
  FSV_HOLD_TTL_SECONDS,
  FSV_MAX_CREDITS,
  FSV_MAX_OPEN,
  reconcileOpenHolds,
  settleStaleHolds,
} from "@/lib/facestudio-v-server";
import { signEntitlement } from "@/lib/facestudio-v-entitlement";
import { FACESTUDIO_V_MODES, FACESTUDIO_V_SERVICE, facestudioVIsOpen } from "@/lib/facestudio-v";
import { authenticate, preflight, readJson, reply } from "../_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export function OPTIONS(request: Request) {
  return preflight(request);
}

/**
 * POST /api/facestudio-v/hold  { credits }  ->  { hold_id, available, entitlement }
 *
 * Reserve the studio's price before the studio page starts the job. Nothing is
 * charged yet: /settle charges or releases once the studio says how it went.
 * An unaffordable video is refused here, before it reaches the GPU.
 */
export async function POST(request: Request) {
  const auth = authenticate(request);
  if ("response" in auth) return auth.response;

  if (!facestudioVIsOpen()) {
    return reply(request, { error: "Video FaceSwap Online is not open right now." }, 403);
  }
  const body = await readJson(request);
  const credits = body?.credits;
  if (typeof credits !== "number" || !Number.isInteger(credits) || credits < 1 || credits > FSV_MAX_CREDITS) {
    return reply(request, { error: "The price is missing or not valid." }, 400);
  }

  try {
    // Free whatever this user left hanging (a closed tab) before counting and charging.
    await reconcileOpenHolds(auth.userId);
    // Charge what was made for people who closed the page while it was being made, BEFORE the
    // sweep returns whatever has expired (it cannot tell a made video from one that never ran).
    await settleStaleHolds(10).catch(() => 0);
    await releaseExpiredHolds(20).catch(() => 0);
    await provisionCredits(auth.userId);

    const open = await countOpenHolds(FACESTUDIO_V_SERVICE, auth.userId);
    if (open >= FSV_MAX_OPEN) {
      return reply(
        request,
        { error: "You already have videos in line. Wait for them to finish first.", reason: "too_many_open" },
        429
      );
    }

    const hold = await holdCredits({
      userId: auth.userId,
      amount: credits,
      service: FACESTUDIO_V_SERVICE,
      ttlSeconds: FSV_HOLD_TTL_SECONDS,
      // Which studio mode this was, so reliability can be read per mode. Optional and
      // checked against the known list: an unknown value is dropped, never stored.
      estimate: { credits, ...(typeof body?.mode === "string" && Object.prototype.hasOwnProperty.call(FACESTUDIO_V_MODES, body.mode) ? { mode: body.mode } : {}) },
    });
    if (!hold.ok || !hold.hold_id) {
      return reply(
        request,
        {
          error: `You need ${credits} credits for this video and have ${hold.available}.`,
          reason: "insufficient_credits",
          shortfall: hold.shortfall ?? Math.max(0, credits - hold.available),
          available: hold.available,
        },
        402
      );
    }
    // Tells the studio whether to leave the NanoPocket mark off this video. If the
    // lookup or the secret fails, no token goes out and the video is marked: the
    // safe side to fail on, and it never stops a hold.
    let entitlement: string | null = null;
    try {
      entitlement = signEntitlement(await hasEverPurchased(auth.userId));
    } catch (err: unknown) {
      console.error("[facestudio-v] entitlement failed:", err instanceof Error ? err.message : err);
    }
    return reply(request, { hold_id: hold.hold_id, available: hold.available, ...(entitlement ? { entitlement } : {}) });
  } catch (err: unknown) {
    console.error("[facestudio-v] hold failed:", err instanceof Error ? err.message : err);
    return reply(request, { error: "Could not reserve your credits. Nothing was charged." }, 500);
  }
}
