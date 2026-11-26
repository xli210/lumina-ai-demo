import "server-only";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  ensureDailyAllowance,
  ensureSignupGrant,
  findHoldByJobRef,
  type CreditHoldRecord,
} from "@/lib/credits-server";
import {
  DETECT_MIN_BALANCE,
  FACESTUDIO_MEMBER_FACE_SWAP_CREDITS,
  creditsForMode,
  memberFaceSwapPriceOn,
  FACESTUDIO_SERVICE,
  FREE_TOPUP_CREDITS,
  FREE_TOPUP_FREQUENCY,
  FREE_TOPUP_PAID_ONLY,
  isFaceStudioJobId,
} from "@/lib/facestudio";
import { suggestPack, suggestionSentence, topUpPath } from "@/lib/credit-packs";
import { BLACK_FRIDAY_ENDS_LABEL } from "@/lib/black-friday";
import { todayUtc } from "@/lib/demo-quota";
import type { CreditAccountState } from "@/lib/credits";
import { getDailyFreeState } from "@/lib/facestudio-daily-free";

/**
 * Access control for the /api/facestudio/* routes.
 *
 * Three things have to be true before a request reaches the GPU, and each is
 * checked in exactly one place here so no route can forget one:
 *
 *   1. the caller is signed in;
 *   2. they can afford at least the cheapest render;
 *   3. for anything naming a job, that job is theirs.
 *
 * Ownership is answered by credit_holds rather than a separate table: every
 * render reserves credits first, so the reservation *is* the record of who
 * started the job, and it survives settlement so finished results stay
 * downloadable.
 */

/** JSON with caching disabled — every response here is user-specific. */
export function privateJson(
  body: unknown,
  status: number
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "private, no-store" },
  });
}

export type FaceStudioGate =
  | { ok: true; userId: string; account: CreditAccountState }
  | { ok: false; response: NextResponse };

export type FaceStudioJobGate =
  | { ok: true; userId: string; hold: CreditHoldRecord }
  | { ok: false; response: NextResponse };

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Bring an account's credits up to date before anything reads them.
 *
 * Two grants, both idempotent: the one-off welcome credits, and the free
 * top-up, which since 2026-11-01 only accounts that have bought credits get. Called by
 * every gate rather than on a schedule, so it costs nothing for accounts
 * that never visit.
 */
export async function provisionCredits(
  userId: string
): Promise<CreditAccountState> {
  await ensureSignupGrant(userId);
  return ensureDailyAllowance({
    userId,
    amount: FREE_TOPUP_CREDITS,
    service: FACESTUDIO_SERVICE,
    day: todayUtc(),
    paidOnly: FREE_TOPUP_PAID_ONLY,
  });
}

/** Signed-in check only. Used by the free GPU-warming route. */
export async function requireUser(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const userId = await currentUserId();
  if (!userId) {
    return {
      ok: false,
      response: privateJson({ detail: "Sign in to use Nano FaceStudio Online." }, 401),
    };
  }
  return { ok: true, userId };
}

/**
 * Signed in, and holding enough credits to pay for the cheapest render.
 *
 * Applied to upload and detect, which are free to the user but not free to
 * run. See DETECT_MIN_BALANCE for why a balance check stands in for a rate
 * limit here.
 */
export async function requireSpendableBalance(): Promise<FaceStudioGate> {
  const userId = await currentUserId();
  if (!userId) {
    return {
      ok: false,
      response: privateJson({ detail: "Sign in to use Nano FaceStudio Online." }, 401),
    };
  }

  let account: CreditAccountState;
  try {
    account = await provisionCredits(userId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] balance read failed:", message);
    return {
      ok: false,
      response: privateJson({ detail: "Could not read your balance." }, 500),
    };
  }

  // During Black Friday an account that has bought credits pays the members' face swap price, so it
  // can still detect with that much left. `lifetime_purchased` is enough here: the render route
  // decides the price from the purchase record.
  const paid = account.lifetime_purchased > 0;
  const minBalance = memberFaceSwapPriceOn(paid) ? Math.min(DETECT_MIN_BALANCE, FACESTUDIO_MEMBER_FACE_SWAP_CREDITS) : DETECT_MIN_BALANCE;
  // Today's free face swap needs no balance: an account that has it may upload and detect.
  let hasDailyFree = false;
  if (account.available < minBalance) {
    try {
      hasDailyFree = (await getDailyFreeState(userId, paid)).available;
    } catch (err: unknown) {
      console.error("[facestudio] daily free check failed:", err instanceof Error ? err.message : err);
    }
  }
  if (account.available < minBalance && !hasDailyFree) {
    const memberOffer =
      !paid && memberFaceSwapPriceOn(true)
        ? ` Black Friday: once you have bought credits, a face swap costs ${FACESTUDIO_MEMBER_FACE_SWAP_CREDITS} credits instead of ${creditsForMode("face_swap")}, until ${BLACK_FRIDAY_ENDS_LABEL}.`
        : "";
    return {
      ok: false,
      response: privateJson(
        {
          detail:
            `You have used your free credits. Buy credits to keep going: ${suggestionSentence()} Free ` +
            `credits are topped up to ${FREE_TOPUP_CREDITS} ${FREE_TOPUP_FREQUENCY}.` + memberOffer,
          reason: "insufficient_credits",
          required: minBalance,
          available: account.available,
          shortfall: minBalance - account.available,
          suggested_pack: suggestPack(0).id,
          topup_url: topUpPath(suggestPack(0), "fs_free_used"),
        },
        402
      ),
    };
  }

  return { ok: true, userId, account };
}

/**
 * Signed in, and the named job was started by this user.
 *
 * A job id that has no reservation is reported as not found rather than
 * forbidden: the caller learns nothing about whether it exists, and a job
 * belonging to someone else is indistinguishable from one that never did.
 */
export async function requireJobOwner(
  rawJobId: string
): Promise<FaceStudioJobGate> {
  const userId = await currentUserId();
  if (!userId) {
    return {
      ok: false,
      response: privateJson({ detail: "Sign in to use Nano FaceStudio Online." }, 401),
    };
  }

  if (!isFaceStudioJobId(rawJobId)) {
    return { ok: false, response: privateJson({ detail: "Unknown job." }, 404) };
  }

  let hold: CreditHoldRecord | null;
  try {
    hold = await findHoldByJobRef(FACESTUDIO_SERVICE, rawJobId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] hold lookup failed:", message);
    return {
      ok: false,
      response: privateJson({ detail: "Could not verify the job." }, 500),
    };
  }

  if (!hold || hold.user_id !== userId) {
    return { ok: false, response: privateJson({ detail: "Unknown job." }, 404) };
  }

  return { ok: true, userId, hold };
}
