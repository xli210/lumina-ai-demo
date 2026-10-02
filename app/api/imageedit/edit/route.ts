import { NextRequest } from "next/server";

import { privateJson, provisionCredits } from "@/lib/facestudio-gate";
import { upstreamString } from "@/lib/facestudio-server";
import {
  attachJobToHold,
  countOpenHolds,
  holdCredits,
  releaseHold,
} from "@/lib/credits-server";
import {
  currentUserId,
  isImageEditConfigured,
  outPrefixFor,
  signInRequired,
  startEdit,
  userMayEdit,
  type ConsoleJob,
} from "@/lib/imageedit-server";
import {
  IMAGEEDIT_CREDITS_PER_EDIT,
  IMAGEEDIT_HOLD_TTL_SECONDS,
  IMAGEEDIT_MAX_OPEN_EDITS,
  IMAGEEDIT_MAX_VARIATIONS,
  IMAGEEDIT_NAME,
  IMAGEEDIT_SERVICE,
  estimatedSeconds,
  isImageEditTool,
  stepsFor,
} from "@/lib/imageedit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** The brush mask arrives as a PNG data URL; it is drawn at most 2048 px wide. */
const MAX_MASK_CHARS = 3_000_000;

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.length <= max ? v : null;
}

/**
 * Validate the console's edit request into the job body the worker expects.
 * Field meanings are documented in image-edit-studio/docs/API.md.
 */
function parse(raw: unknown): { srcKey: unknown; variations: number; req: Record<string, unknown> } | string {
  const b = new Map(Object.entries((raw ?? {}) as object));
  const tool = b.get("tool");
  if (!isImageEditTool(tool)) return "Unknown tool.";

  const prompt = str(b.get("prompt") ?? "", 2000);
  if (!prompt || !prompt.trim()) return "Describe the edit first.";

  const mask = b.get("mask") ?? null;
  if (mask !== null && !(typeof mask === "string" && mask.startsWith("data:image/png;base64,") && mask.length <= MAX_MASK_CHARS)) {
    return "The brush mask is invalid or too large.";
  }

  const pick = (name: string, allowed: string[], fallback: string) => {
    const v = b.get(name);
    return typeof v === "string" && allowed.includes(v) ? v : fallback;
  };
  const seedRaw = b.get("seed");
  const seed = Number.isInteger(seedRaw) && (seedRaw as number) >= 0 ? (seedRaw as number) % 2 ** 31 : 42;
  const varRaw = b.get("variations");
  const variations = Number.isInteger(varRaw) ? Math.min(IMAGEEDIT_MAX_VARIATIONS, Math.max(1, varRaw as number)) : 1;

  const req: Record<string, unknown> = {
    src: str(b.get("src"), 80) ?? "src",
    tool,
    prompt,
    area: pick("area", ["auto", "brush", "image"], "auto"),
    brush_mode: pick("brush_mode", ["limit", "only"], "limit"),
    mask,
    gate_in: str(b.get("gate_in") ?? "", 300) ?? "",
    gate_out: str(b.get("gate_out") ?? "", 300) ?? "",
    merge: pick("merge", ["auto", "tone", "hybrid", "raw"], "auto"),
    seed,
    variations: 1,
    preset: str(b.get("preset"), 60),
    text_new: b.get("text_new") === true,
  };
  req.steps = stepsFor({ tool, preset: req.preset as string | null, text_new: req.text_new as boolean });
  return { srcKey: b.get("src_key"), variations, req };
}

/**
 * POST /api/imageedit/edit
 * body: the console's edit request plus `src_key` -> { jobs: [job, …], credits_held, available }
 *
 * One GPU job and one credit reservation per variation. Reserving happens
 * before anything reaches the GPU, so an edit nobody can pay for costs no
 * compute; /api/imageedit/jobs/{id} settles each reservation when its job
 * finishes (charged on success, refunded on failure or cancel).
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
  if (!userMayEdit(userId, parsed.srcKey)) {
    return privateJson({ detail: "That photo is not available any more. Upload it again." }, 400);
  }
  const srcKey = parsed.srcKey;
  const n = parsed.variations;

  try {
    await provisionCredits(userId);
    const open = await countOpenHolds(IMAGEEDIT_SERVICE, userId);
    if (open + n > IMAGEEDIT_MAX_OPEN_EDITS) {
      return privateJson(
        {
          detail: `You already have ${open} edit${open === 1 ? "" : "s"} running. Wait for ${open === 1 ? "it" : "them"} to finish, or ask for fewer variations.`,
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

  const jobs: ConsoleJob[] = [];
  let available: number | undefined;
  let firstError: { detail: string; status: number; extra?: Record<string, unknown> } | null = null;

  for (let k = 0; k < n; k++) {
    const req: Record<string, unknown> = { ...parsed.req, seed: (parsed.req.seed as number) + k };

    let hold;
    try {
      hold = await holdCredits({
        userId,
        amount: IMAGEEDIT_CREDITS_PER_EDIT,
        service: IMAGEEDIT_SERVICE,
        ttlSeconds: IMAGEEDIT_HOLD_TTL_SECONDS,
        estimate: { tool: req.tool, steps: req.steps, variation: k + 1, price_version: 1 },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[imageedit] hold failed:", message);
      firstError = { detail: "Could not reserve credits.", status: 500 };
      break;
    }
    available = hold.available;
    if (!hold.ok || !hold.hold_id) {
      firstError = {
        detail:
          jobs.length > 0
            ? `Started ${jobs.length} of ${n}; each edit costs ${IMAGEEDIT_CREDITS_PER_EDIT} credits and you have ${hold.available} left.`
            : `An edit costs ${IMAGEEDIT_CREDITS_PER_EDIT} credits and you have ${hold.available}. Buy credits to keep editing.`,
        status: 402,
        extra: { reason: "insufficient_credits", required: IMAGEEDIT_CREDITS_PER_EDIT, available: hold.available, topup_url: "/credits" },
      };
      break;
    }
    const holdId = hold.hold_id;

    const refund = async (why: string) => {
      try {
        await releaseHold(holdId, why);
      } catch (err: unknown) {
        // The sweeper frees it at TTL; loud because the credits are stuck until then.
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[imageedit] release after failure failed:", message);
      }
    };

    let started;
    try {
      started = await startEdit({ srcKey, outPrefix: outPrefixFor(userId, holdId), req });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[imageedit] gateway unreachable:", message);
      await refund("gateway_unreachable");
      firstError = { detail: "The editing service is unreachable right now. You have not been charged.", status: 502 };
      break;
    }

    const jobId = upstreamString(started.body, "job_id");
    if (started.status >= 400 || !jobId) {
      const detail = upstreamString(started.body, "detail") ?? "The edit could not be started.";
      console.error("[imageedit] gateway rejected run:", started.status, detail);
      await refund("gateway_rejected");
      firstError = { detail: `${detail} You have not been charged.`, status: 502 };
      break;
    }

    try {
      if (!(await attachJobToHold(holdId, jobId))) throw new Error("not attached");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[imageedit] attach job failed:", message);
      await refund("attach_failed");
      firstError = { detail: "The edit started but could not be tracked. You have not been charged.", status: 500 };
      break;
    }

    jobs.push({
      id: jobId,
      status: "queued",
      stage: "Queue",
      step: 0,
      steps: req.steps as number,
      waiting: true,
      eta: estimatedSeconds(req.steps as number) + 60,
    });
  }

  if (jobs.length === 0 && firstError) {
    return privateJson({ detail: firstError.detail, ...firstError.extra }, firstError.status);
  }
  return privateJson(
    {
      jobs,
      credits_held: jobs.length * IMAGEEDIT_CREDITS_PER_EDIT,
      available,
      // Some variations started and a later one could not: tell the page.
      warning: firstError?.detail ?? null,
    },
    200
  );
}
