import { NextRequest } from "next/server";

import { privateJson, provisionCredits } from "@/lib/facestudio-gate";
import { suggestPack, suggestionSentence, topUpPath } from "@/lib/credit-packs";
import { upstreamString } from "@/lib/facestudio-server";
import {
  attachJobToHold,
  countOpenHolds,
  hasEverPurchased,
  holdCredits,
  releaseHold,
} from "@/lib/credits-server";
import {
  currentUserId,
  isImageEditConfigured,
  probePhoto,
  settleOpenEdits,
  signInRequired,
  startEdit,
  userMayEdit,
} from "@/lib/imageedit-server";
import {
  IMAGEEDIT_HOLD_TTL_SECONDS,
  IMAGEEDIT_MAX_OPEN_EDITS,
  IMAGEEDIT_NAME,
  IMAGEEDIT_SERVICE,
  creditsForPhoto,
} from "@/lib/imageedit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** The brush mask arrives as a PNG data URL; the page draws it at most 1600 px wide. */
const MAX_MASK_CHARS = 3_000_000;
const MASK_PREFIX = "data:image/png;base64,";

function parse(raw: unknown): { key: string; prompt: string; seed: number; mask: string | null } | string {
  const b = new Map(Object.entries((raw ?? {}) as object));
  const key = b.get("key");
  if (typeof key !== "string" || key.length > 200) return "That photo is not available any more. Upload it again.";

  const rawPrompt = b.get("prompt");
  const prompt = typeof rawPrompt === "string" ? rawPrompt.split(/\s+/).filter(Boolean).join(" ") : "";
  if (!prompt) return "Describe the change first.";
  if (prompt.length > 2000) return "The description is too long.";

  const mask = b.get("mask") ?? null;
  if (mask !== null && !(typeof mask === "string" && mask.startsWith(MASK_PREFIX) && mask.length <= MAX_MASK_CHARS)) {
    return "The brushed area is invalid or too large.";
  }

  const seedRaw = b.get("seed");
  const seed = Number.isInteger(seedRaw) && (seedRaw as number) >= 0 ? (seedRaw as number) % 2 ** 31 : -1;
  return { key, prompt, seed, mask: mask === null ? null : (mask as string).slice(MASK_PREFIX.length) };
}

/**
 * POST /api/imageedit/edit
 * body: { key, prompt, seed, mask } -> { job, watermark, credits, available }
 *
 * The price comes from the size read out of the stored file, not from the page.
 * Reserving happens before anything reaches the GPU, so an edit nobody can pay
 * for costs no compute; /api/imageedit/jobs/{id} settles the reservation when
 * the job finishes (charged on success, refunded on failure).
 */
export async function POST(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return signInRequired();

  if (!isImageEditConfigured()) {
    return privateJson({ detail: `${IMAGEEDIT_NAME} is not configured on this deployment.` }, 503);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }
  const parsed = parse(raw);
  if (typeof parsed === "string") return privateJson({ detail: parsed }, 400);

  let watermark = true;
  try {
    if (!(await userMayEdit(userId, parsed.key))) {
      return privateJson({ detail: "That photo is not available any more. Upload it again." }, 400);
    }
    await provisionCredits(userId);
    let open = await countOpenHolds(IMAGEEDIT_SERVICE, userId);
    if (open >= IMAGEEDIT_MAX_OPEN_EDITS) {
      // Edits whose page was closed are only settled when someone looks.
      await settleOpenEdits(userId);
      open = await countOpenHolds(IMAGEEDIT_SERVICE, userId);
    }
    if (open >= IMAGEEDIT_MAX_OPEN_EDITS) {
      return privateJson(
        {
          detail: `You already have ${open} edit${open === 1 ? "" : "s"} running. Wait for ${open === 1 ? "it" : "them"} to finish.`,
          reason: "too_many_concurrent_jobs",
        },
        429
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[imageedit] pre-edit checks failed:", message);
    return privateJson({ detail: "Could not check your balance." }, 500);
  }
  try {
    watermark = !(await hasEverPurchased(userId));
  } catch (err: unknown) {
    // Marked is the safe side to fail on.
    console.error("[imageedit] purchase history read failed:", err instanceof Error ? err.message : err);
  }

  let probe;
  try {
    probe = await probePhoto(parsed.key, 25_000);
  } catch (err: unknown) {
    console.error("[imageedit] probe failed:", err instanceof Error ? err.message : err);
    return privateJson({ detail: "The editing service is unreachable right now. You have not been charged." }, 502);
  }
  if (!probe.ok) return privateJson({ detail: probe.detail }, probe.status);
  const credits = creditsForPhoto(probe.width, probe.height);

  let hold;
  try {
    hold = await holdCredits({
      userId,
      amount: credits,
      service: IMAGEEDIT_SERVICE,
      ttlSeconds: IMAGEEDIT_HOLD_TTL_SECONDS,
      estimate: { model: "spotedit", width: probe.width, height: probe.height, watermark, price_version: 3, src_key: parsed.key },
    });
  } catch (err: unknown) {
    console.error("[imageedit] hold failed:", err instanceof Error ? err.message : err);
    return privateJson({ detail: "Could not reserve credits." }, 500);
  }
  if (!hold.ok || !hold.hold_id) {
    return privateJson(
      {
        detail: `This edit costs ${credits} credits and you have ${hold.available}. Buy credits to keep editing: ${suggestionSentence()}`,
        reason: "insufficient_credits",
        required: credits,
        available: hold.available,
        suggested_pack: suggestPack(0).id,
        topup_url: topUpPath(suggestPack(0), "ie_low"),
      },
      402
    );
  }
  const holdId = hold.hold_id;

  const refund = async (why: string) => {
    try {
      await releaseHold(holdId, why);
    } catch (err: unknown) {
      // The sweeper frees it at TTL; loud because the credits are stuck until then.
      console.error("[imageedit] release after failure failed:", err instanceof Error ? err.message : err);
    }
  };

  let started;
  try {
    started = await startEdit({
      srcKey: parsed.key,
      prompt: parsed.prompt,
      seed: parsed.seed,
      watermark,
      mask: parsed.mask,
      requestId: holdId,
      userId,
    });
  } catch (err: unknown) {
    console.error("[imageedit] gateway unreachable:", err instanceof Error ? err.message : err);
    await refund("gateway_unreachable");
    return privateJson({ detail: "The editing service is unreachable right now. You have not been charged." }, 502);
  }

  const jobId = upstreamString(started.body, "job_id");
  if (started.status >= 400 || !jobId) {
    console.error("[imageedit] gateway rejected run:", started.status, upstreamString(started.body, "detail"));
    await refund("gateway_rejected");
    return privateJson({ detail: "The edit could not be started. You have not been charged." }, 502);
  }

  try {
    if (!(await attachJobToHold(holdId, jobId))) throw new Error("not attached");
  } catch (err: unknown) {
    console.error("[imageedit] attach job failed:", err instanceof Error ? err.message : err);
    await refund("attach_failed");
    return privateJson({ detail: "The edit started but could not be tracked. You have not been charged." }, 500);
  }

  return privateJson({ job: jobId, watermark, credits, available: hold.available }, 200);
}
