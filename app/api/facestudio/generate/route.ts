import { NextRequest } from "next/server";

import { privateJson, provisionCredits, requireUser } from "@/lib/facestudio-gate";
import {
  isFaceStudioConfigured,
  startGenerate,
  upstreamString,
} from "@/lib/facestudio-server";
import {
  attachJobToHold,
  countOpenHolds,
  holdCredits,
  releaseHold,
} from "@/lib/credits-server";
import {
  FACESTUDIO_HOLD_TTL_SECONDS,
  FACESTUDIO_MAX_FACES,
  FACESTUDIO_SERVICE,
  FREE_DAILY_CREDITS,
  creditsForJob,
  creditsForMode,
  isFaceStudioMode,
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
const MAX_CONCURRENT_RENDERS = 2;

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
          "Face Studio is not configured on this deployment. Set " +
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
  const price = creditsForJob(parsed.mode, faceCount);

  // Hand out today's free allowance before reserving, so the first renders of
  // the day are paid for by it rather than out of a purchased balance.
  try {
    await provisionCredits(userId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] could not provision credits:", message);
    return privateJson({ detail: "Could not check your balance." }, 500);
  }

  try {
    const inFlight = await countOpenHolds(FACESTUDIO_SERVICE, userId);
    if (inFlight >= MAX_CONCURRENT_RENDERS) {
      return privateJson(
        {
          detail:
            `You already have ${inFlight} renders running. Wait for one to ` +
            `finish before starting another.`,
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
        credits_per_face: creditsForMode(parsed.mode),
        // Bumped whenever the pricing formula changes, so historical holds
        // stay interpretable when the rate no longer matches today's.
        price_version: 2,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] hold failed:", message);
    return privateJson({ detail: "Could not reserve credits." }, 500);
  }

  if (!hold.ok || !hold.hold_id) {
    return privateJson(
      {
        detail:
          `Swapping ${faceCount} face${faceCount === 1 ? "" : "s"} costs ` +
          `${price} credits and you have ${hold.available}. Swap fewer faces, ` +
          `buy credits, or come back tomorrow for another ` +
          `${FREE_DAILY_CREDITS} free.`,
        reason: "insufficient_credits",
        required: price,
        available: hold.available,
        shortfall: hold.shortfall ?? price - hold.available,
        topup_url: "/credits",
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
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] gateway unreachable:", message);
    return abort(
      "gateway_unreachable",
      "Face Studio gateway unreachable. You have not been charged.",
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
      faces: faceCount,
      balance: hold.balance,
      available: hold.available,
    },
    200
  );
}
