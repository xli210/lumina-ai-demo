import { NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

import { privateJson, provisionCredits, requireUser } from "@/lib/facestudio-gate";
import {
  isFaceStudioConfigured,
  startGenerate,
  upstreamString,
} from "@/lib/facestudio-server";
import {
  attachJobToHold,
  countOpenHolds,
  hasEverPurchased,
  holdCredits,
  releaseHold,
} from "@/lib/credits-server";
import { freeOutputStyle, needsWatermark, watermarkEnabled } from "@/lib/facestudio-watermark";
import { claimDailyFree, getDailyFreeState, returnDailyFree } from "@/lib/facestudio-daily-free";
import { DAILY_FREE_RESET_LABEL } from "@/lib/facestudio-daily-free-rules";
import { suggestPack, suggestionSentence, topUpPath } from "@/lib/credit-packs";
import { BLACK_FRIDAY_CAMPAIGN, BLACK_FRIDAY_ENDS_LABEL } from "@/lib/black-friday";
import {
  FACESTUDIO_HOLD_TTL_SECONDS,
  FACESTUDIO_MAX_FACES,
  FACESTUDIO_SERVICE,
  FREE_TOPUP_CREDITS,
  FACESTUDIO_MEMBER_FACE_SWAP_CREDITS,
  FREE_TOPUP_FREQUENCY,
  creditsForJobFor,
  creditsForMode,
  creditsPerFaceFor,
  isFaceStudioMode,
  memberFaceSwapPriceOn,
  isStorageKey,
  type FaceStudioMode,
} from "@/lib/facestudio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * At most this many renders in flight per account. Each one occupies a GPU,
 * so without a cap a single account could take the whole pool — and a
 * double-clicked button would pay twice for the same picture.
 */
const MAX_CONCURRENT_RENDERS_FREE = 1;
const MAX_CONCURRENT_RENDERS_PAID = 3;

interface GenerateRequest {
  detectionId: string;
  mode: FaceStudioMode;
  refs: Record<string, string>;
  preserveClasses: Record<string, number[]>;
}

/** A face index as it arrives over the wire: "0" through "5". */
function isFaceIndexKey(key: string): boolean {
  const n = Number.parseInt(key, 10);
  return String(n) === key && n >= 0 && n < FACESTUDIO_MAX_FACES;
}

function parseRefs(raw: unknown): Record<string, string> | string {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return "refs must be an object mapping face index to an uploaded key.";
  }

  const refs: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isFaceIndexKey(key)) {
      return `refs has an invalid face index: ${key}`;
    }
    if (!isStorageKey(value)) {
      return `The reference photo for face ${key} was not uploaded correctly.`;
    }
    refs[key] = value;
  }

  if (Object.keys(refs).length === 0) {
    return "Upload a reference photo for at least one face.";
  }
  return refs;
}

function parsePreserveClasses(
  raw: unknown
): Record<string, number[]> | string {
  if (raw === undefined || raw === null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return "preserve_classes_map must be an object.";
  }

  const out: Record<string, number[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isFaceIndexKey(key)) {
      return `preserve_classes_map has an invalid face index: ${key}`;
    }
    if (
      !Array.isArray(value) ||
      !value.every((id) => Number.isInteger(id) && id >= 0 && id < 256)
    ) {
      return `preserve_classes_map[${key}] must be a list of class ids.`;
    }
    out[key] = value;
  }
  return out;
}

function parseBody(body: unknown): GenerateRequest | string {
  const input = new Map(Object.entries((body ?? {}) as object));

  const detectionId = input.get("detection_id");
  if (!isStorageKey(detectionId)) {
    return "Detection expired. Upload the photo again.";
  }

  const mode = input.get("mode");
  if (!isFaceStudioMode(mode)) {
    return "Unknown mode. Use face_swap or head_swap.";
  }

  const refs = parseRefs(input.get("refs"));
  if (typeof refs === "string") return refs;

  // Head swap replaces the entire head, so it is defined for one face only.
  if (mode === "head_swap" && Object.keys(refs).length !== 1) {
    return "Head swap works on exactly one face.";
  }

  const preserveClasses = parsePreserveClasses(input.get("preserve_classes_map"));
  if (typeof preserveClasses === "string") return preserveClasses;

  return {
    detectionId,
    mode,
    refs,
    // Preserving original regions is a face-swap-only feature; the worker
    // ignores it for head swap, so drop it rather than send dead weight.
    preserveClasses: mode === "face_swap" ? preserveClasses : {},
  };
}

/**
 * POST /api/facestudio/generate
 * body: { detection_id, mode, refs: { "0": key }, preserve_classes_map }
 * -> { job_id, credits_held, available }
 *
 * Credits are reserved *before* the job is handed to the GPU, so a render
 * nobody can pay for never costs us any compute. The reservation is settled
 * later by /api/facestudio/status: charged when the render lands, returned in
 * full when it fails. See docs/credit-system.md for the reserve-then-settle
 * model.
 */
export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const { userId } = gate;

  if (!isFaceStudioConfigured()) {
    return privateJson(
      {
        detail:
          "Nano FaceStudio Online is not configured on this deployment. Set " +
          "FACESTUDIO_GATEWAY_TOKEN. See docs/face-studio.md.",
      },
      503
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }

  const parsed = parseBody(raw);
  if (typeof parsed === "string") {
    return privateJson({ detail: parsed }, 400);
  }

  // One diffusion pass runs per face, so a six-face group photo is six times
  // the GPU work of a portrait and is priced accordingly. Counted from the
  // references actually supplied, not the faces detected: swapping one person
  // out of a crowd is one face of work.
  const faceCount = Object.keys(parsed.refs).length;

  // Hand out a free top-up if one is due before reserving, so the first renders
  // are paid for by it rather than out of a purchased balance.
  try {
    await provisionCredits(userId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] could not provision credits:", message);
    return privateJson({ detail: "Could not check your balance." }, 500);
  }

  // Has this account ever bought credits? From the purchase record, never from the request. It sets
  // the number of renders at a time and, during Black Friday, the members' face swap price; a failed
  // lookup counts as not paid (one render at a time, regular price).
  let purchased: boolean | null = null;
  try {
    purchased = await hasEverPurchased(userId);
  } catch (err: unknown) {
    console.error("[facestudio] purchase lookup failed:", err instanceof Error ? err.message : err);
  }
  const isPaid = purchased === true;
  const now = Date.now();
  const perFace = creditsPerFaceFor(parsed.mode, isPaid, now);
  const price = creditsForJobFor(parsed.mode, faceCount, isPaid, now);
  const memberPrice = parsed.mode === "face_swap" && memberFaceSwapPriceOn(isPaid, now);
  // Said in the "not enough credits" reply to an account that has not bought yet: what a top-up would change here.
  const memberOffer =
    parsed.mode === "face_swap" && !isPaid && memberFaceSwapPriceOn(true, now)
      ? ` Black Friday: once you have bought credits, a face swap costs ${FACESTUDIO_MEMBER_FACE_SWAP_CREDITS} credits instead of ${creditsForMode("face_swap")}, until ${BLACK_FRIDAY_ENDS_LABEL}.`
      : "";

  try {
    // An account that has never bought credits runs one render at a time, one that has runs three: a few free accounts cannot hold the line.
    const inFlight = await countOpenHolds(FACESTUDIO_SERVICE, userId);
    if (inFlight >= (isPaid ? MAX_CONCURRENT_RENDERS_PAID : MAX_CONCURRENT_RENDERS_FREE)) {
      return privateJson(
        {
          detail:
            `You already have ${inFlight} render${inFlight === 1 ? "" : "s"} running. Wait for ${inFlight === 1 ? "it" : "one"} to ` +
            `finish before starting another.` +
            (isPaid ? "" : " Add credits once to run up to 3 at a time."),
          reason: "too_many_concurrent_jobs",
        },
        429
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] concurrency check failed:", message);
    return privateJson({ detail: "Could not start the render." }, 500);
  }

  // Whether this is a free render: decided from our own records (has this
  // account ever bought credits?), never from the request body, which is not
  // read for it. A failed lookup counts as free, the safe side to fail on. Off
  // until FACESTUDIO_WATERMARK=1 is set. Since 2026-11-25 a free render is
  // rendered clean and finished by the gateway (at most 1536 px, a small
  // nanopocket.ai mark, AI-generated metadata: `free_output`);
  // FACESTUDIO_FREE_OUTPUT=tiled goes back to the worker's tiled watermark.
  let watermark: boolean | undefined;
  let freeOutput = false;
  if (watermarkEnabled()) {
    const owed = needsWatermark(purchased);
    if (owed && freeOutputStyle() === "badge") {
      freeOutput = true;
      watermark = false;
    } else {
      watermark = owed;
    }
  }

  // An admin can ask for the free version of a render (`test_free_output: true`), to check the free
  // path from an account that has bought credits. Read only when the field is sent, and only for admins.
  if (!freeOutput && (raw as { test_free_output?: unknown } | null)?.test_free_output === true) {
    try {
      const { data } = await createAdminClient().from("profiles").select("role").eq("id", userId).maybeSingle();
      if ((data as { role?: string } | null)?.role === "admin") {
        freeOutput = true;
        watermark = false;
      }
    } catch (err: unknown) {
      console.error("[facestudio] admin check failed:", err instanceof Error ? err.message : err);
    }
  }

  // Today's free face swap (one face), if this account has it: credits granted
  // here and reserved straight after, taken back if the render does not land.
  let dailyFree: { day: string; attempt: number } | null = null;
  if (parsed.mode === "face_swap" && faceCount === 1) {
    try {
      dailyFree = await claimDailyFree({ userId, credits: price, isPaid });
    } catch (err: unknown) {
      // Without it the render is paid as usual; say so in the log only.
      console.error("[facestudio] daily free check failed:", err instanceof Error ? err.message : err);
    }
  }

  // Reserve first. A failure to afford the render stops here, before any GPU
  // time is spent, and tells the user exactly how many credits short they are.
  let hold;
  try {
    hold = await holdCredits({
      userId,
      amount: price,
      service: FACESTUDIO_SERVICE,
      ttlSeconds: FACESTUDIO_HOLD_TTL_SECONDS,
      estimate: {
        mode: parsed.mode,
        faces: faceCount,
        credits_per_face: perFace,
        // Bumped whenever the pricing formula changes, so historical holds
        // stay interpretable when the rate no longer matches today's.
        price_version: 3,
        ...(memberPrice ? { promo: BLACK_FRIDAY_CAMPAIGN } : {}),
        // The photo as uploaded (the gateway's S3_INPUT_PREFIX), so "My images" can show it beside the result.
        target_key: `${process.env.FACESTUDIO_INPUT_PREFIX || "facestudio/input"}/${parsed.detectionId}`,
        // Kept on the hold so the status and result routes can refuse a render
        // that was owed a mark and came back without one.
        ...(watermark === undefined ? {} : { watermark }),
        ...(freeOutput ? { free_output: true } : {}),
        ...(dailyFree ? { daily_free: true, daily_free_day: dailyFree.day } : {}),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] hold failed:", message);
    if (dailyFree) await returnDailyFree({ userId, credits: price, ...dailyFree });
    return privateJson({ detail: "Could not reserve credits." }, 500);
  }

  if ((!hold.ok || !hold.hold_id) && dailyFree) {
    await returnDailyFree({ userId, credits: price, ...dailyFree });
    dailyFree = null;
  }

  if (!hold.ok || !hold.hold_id) {
    const shortfall = hold.shortfall ?? price - hold.available;
    const pack = suggestPack(shortfall);
    // A one-face swap: say whether today's free one is still to come.
    let dailyNote = "";
    if (parsed.mode === "face_swap") {
      try {
        const st = await getDailyFreeState(userId, isPaid);
        if (st.reason === "used") dailyNote = ` Your free face swap for today is used; the next one comes after ${DAILY_FREE_RESET_LABEL}.`;
        else if (st.reason === "sold_out") dailyNote = ` Today's free face swaps are all given out; try again after ${DAILY_FREE_RESET_LABEL}.`;
        else if (st.available && faceCount > 1) dailyNote = " The daily free face swap covers one face: swap one face to use it.";
      } catch {
        // The note is a courtesy; the reply stands without it.
      }
    }
    return privateJson(
      {
        detail:
          `Swapping ${faceCount} face${faceCount === 1 ? "" : "s"} costs ` +
          `${price} credits and you have ${hold.available}. Swap fewer faces, ` +
          `or buy credits: ${suggestionSentence(shortfall)} Free credits are topped up to ${FREE_TOPUP_CREDITS} ` +
          `${FREE_TOPUP_FREQUENCY}.` + memberOffer + dailyNote,
        reason: "insufficient_credits",
        required: price,
        available: hold.available,
        shortfall,
        suggested_pack: pack.id,
        topup_url: topUpPath(pack, "fs_low"),
      },
      402
    );
  }
  const holdId = hold.hold_id;

  /** Give the credits back, then report why the render never started. */
  async function abort(
    reason: string,
    detail: string,
    status: number
  ): Promise<Response> {
    try {
      await releaseHold(holdId, reason);
      if (dailyFree) await returnDailyFree({ userId, credits: price, holdId });
    } catch (err: unknown) {
      // The sweeper will free it at TTL, so this is recoverable — but it
      // means the user's credits are stuck until then, which is worth a loud
      // log line.
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[facestudio] release after failure failed:", message);
    }
    return privateJson({ detail }, status);
  }

  let started;
  try {
    started = await startGenerate({
      detectionId: parsed.detectionId,
      mode: parsed.mode,
      refs: parsed.refs,
      preserveClasses: parsed.preserveClasses,
      watermark,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] gateway unreachable:", message);
    return abort(
      "gateway_unreachable",
      "Nano FaceStudio Online gateway unreachable. You have not been charged.",
      502
    );
  }

  const jobId = upstreamString(started.body, "job_id");
  if (started.status >= 400 || !jobId) {
    const detail =
      upstreamString(started.body, "detail") ??
      "The render could not be started. You have not been charged.";
    console.error(
      "[facestudio] gateway rejected generate:",
      started.status,
      detail
    );
    return abort("gateway_rejected", detail, started.status >= 400 ? 502 : 500);
  }

  // Record which job the reservation belongs to. This is also the ownership
  // record that status/result/feedback check, so a job we cannot attach is
  // one the user could never poll — better to refund and fail loudly.
  try {
    const attached = await attachJobToHold(holdId, jobId);
    if (!attached) {
      return abort(
        "attach_failed",
        "The render started but could not be tracked. You have not been charged.",
        500
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] attach job failed:", message);
    return abort(
      "attach_failed",
      "The render started but could not be tracked. You have not been charged.",
      500
    );
  }

  return privateJson(
    {
      job_id: jobId,
      credits_held: price,
      // Paid for by today's free face swap: nothing comes out of the balance.
      ...(dailyFree ? { daily_free: true } : {}),
      ...(freeOutput ? { free_output: true } : {}),
      faces: faceCount,
      balance: hold.balance,
      available: hold.available,
    },
    200
  );
}
