import { NextRequest } from "next/server";

import { provisionCredits } from "@/lib/facestudio-gate";
import { countOpenHolds, hasEverPurchased, holdCredits } from "@/lib/credits-server";
import {
  HEADSWAP_PRO_HOLD_TTL_SECONDS,
  HEADSWAP_PRO_MAX_OPEN,
  HEADSWAP_PRO_NAME,
  HEADSWAP_PRO_SERVICE,
  creditsFor,
  parseVariations,
} from "@/lib/headswap-pro";
import { currentUserId, privateJson, reconcileOpenHolds, swapTicket, unavailableReason } from "@/lib/headswap-pro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/headswap/hold  { variations }  ->  { hold_id, ticket, credits, available, watermark }
 *
 * Reserve the price of the swap before it starts. Nothing is charged yet: /settle charges what was
 * delivered or gives everything back. The ticket is the gateway's proof that credits are reserved:
 * the gateway refuses a swap without one, so a render nobody has paid for never reaches a GPU.
 */
export async function POST(req: NextRequest) {
  const why = unavailableReason();
  if (why) {
    return privateJson(
      { detail: why === "not_open" ? `${HEADSWAP_PRO_NAME} is not open yet.` : `${HEADSWAP_PRO_NAME} is not configured on this deployment.` },
      503
    );
  }

  const userId = await currentUserId();
  if (!userId) return privateJson({ detail: `Sign in to use ${HEADSWAP_PRO_NAME}.`, reason: "sign_in" }, 401);

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }
  const images = parseVariations(body.variations);
  if (images === null) return privateJson({ detail: "Choose 1 to 4 variations." }, 400);
  const price = creditsFor(images);

  try {
    // The welcome credits and the free top-up are paid out first, so a new account's first swaps come out of them.
    await provisionCredits(userId);
    // A swap that finished while its tab was closed is charged now, before it can count as "still running".
    await reconcileOpenHolds(userId).catch((err: unknown) =>
      console.error("[headswap] reconcile failed:", err instanceof Error ? err.message : err)
    );
    const open = await countOpenHolds(HEADSWAP_PRO_SERVICE, userId);
    if (open >= HEADSWAP_PRO_MAX_OPEN) {
      return privateJson(
        { detail: `You already have ${open} swaps running. Wait for one to finish first.`, reason: "too_many_open" },
        429
      );
    }

    // Decided here from our own records, never from the request.
    let paid = false;
    try {
      paid = await hasEverPurchased(userId);
    } catch (err: unknown) {
      console.error("[headswap] purchase lookup failed:", err instanceof Error ? err.message : err);
    }

    const hold = await holdCredits({
      userId,
      amount: price,
      service: HEADSWAP_PRO_SERVICE,
      ttlSeconds: HEADSWAP_PRO_HOLD_TTL_SECONDS,
      estimate: { mode: "headswap-pro", variations: images, watermark: !paid, price_version: 1 },
    });
    if (!hold.ok || !hold.hold_id) {
      return privateJson(
        {
          detail: `You need ${price} credits for ${images === 1 ? "this image" : `these ${images} images`} and have ${hold.available}.`,
          reason: "insufficient_credits",
          required: price,
          available: hold.available,
          shortfall: hold.shortfall ?? Math.max(0, price - hold.available),
          topup_url: "/credits",
        },
        402
      );
    }

    const ticket = swapTicket(userId, hold.hold_id, images, paid);
    if (!ticket) return privateJson({ detail: "Could not prepare the swap." }, 500);
    return privateJson({ hold_id: hold.hold_id, ticket, credits: price, available: hold.available, watermark: !paid }, 200);
  } catch (err: unknown) {
    console.error("[headswap] hold failed:", err instanceof Error ? err.message : err);
    return privateJson({ detail: "Could not reserve your credits. Nothing was charged." }, 500);
  }
}
