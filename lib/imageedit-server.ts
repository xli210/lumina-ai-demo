import "server-only";
import { randomBytes } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { findHoldByJobRef, type CreditHoldRecord } from "@/lib/credits-server";
import {
  callUpstream,
  isFaceStudioConfigured,
  type UpstreamResult,
} from "@/lib/facestudio-server";
import { privateJson } from "@/lib/facestudio-gate";
import {
  presignR2Get,
  presignR2Put,
  r2DownloadsConfig,
  type R2Config,
} from "@/lib/r2-sign";
import {
  IMAGEEDIT_FILE_TTL_SECONDS,
  IMAGEEDIT_NAME,
  IMAGEEDIT_SAMPLES,
  IMAGEEDIT_SERVICE,
  IMAGEEDIT_UPLOAD_TTL_SECONDS,
  estimatedSeconds,
  isImageEditJobId,
} from "@/lib/imageedit";
import type { NextResponse } from "next/server";

/**
 * Server-side plumbing for Nano ImageEdit 2.0 Online.
 *
 * Reuses two things that already exist rather than adding credentials:
 *
 *   - the Nano FaceStudio Online gateway (FACESTUDIO_GATEWAY_TOKEN), which
 *     holds the RunPod key and relays job JSON to the image-edit endpoint;
 *   - the R2 token the installer downloads use (R2_DOWNLOADS_*), scoped to the
 *     `video-api` bucket the GPU worker reads and writes. With it this module
 *     signs every upload and download URL itself, so no image byte passes
 *     through a Vercel function (their bodies cap at 4.5 MB).
 *
 * Storage layout, all under `imageedit/` in that bucket:
 *
 *   src/<user>/src_<12 hex>.png       an uploaded photo
 *   out/<user>/<hold id>/<name>       one edit's results, written by the worker
 *   samples/<name>.png                the sample photos
 *
 * The user id in every path is what makes ownership checkable from the key
 * alone. The output folder is named after the credit hold, which exists
 * before the job does, so it can be chosen up front and recovered later from
 * the hold that also proves who started the job.
 */

const ROOT = "imageedit";

export function imageEditStorage(): R2Config | null {
  return r2DownloadsConfig();
}

export function isImageEditConfigured(): boolean {
  return isFaceStudioConfigured() && imageEditStorage() !== null;
}

function userSegment(userId: string): string {
  // Supabase user ids are UUIDs. Anything else must never reach a storage path.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error("unexpected user id shape");
  }
  return userId.toLowerCase();
}

function holdSegment(holdId: string): string {
  const seg = holdId.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(seg)) throw new Error("unexpected hold id shape");
  return seg;
}

export function newSourceKey(userId: string): { id: string; key: string } {
  const id = `src_${randomBytes(6).toString("hex")}`;
  return { id, key: `${ROOT}/src/${userSegment(userId)}/${id}.png` };
}

export function outPrefixFor(userId: string, holdId: string): string {
  return `${ROOT}/out/${userSegment(userId)}/${holdSegment(holdId)}`;
}

export function sampleKey(name: string): string | null {
  return (IMAGEEDIT_SAMPLES as readonly string[]).includes(name)
    ? `${ROOT}/samples/${name}.png`
    : null;
}

/** May this user edit the image stored at `key`? Their uploads, their results, or a sample. */
export function userMayEdit(userId: string, key: unknown): key is string {
  if (typeof key !== "string" || key.includes("..")) return false;
  const u = userSegment(userId);
  if (new RegExp(`^${ROOT}/src/${u}/src_[0-9a-f]{12}\\.png$`).test(key)) return true;
  if (new RegExp(`^${ROOT}/out/${u}/[0-9a-f]{32}/[A-Za-z0-9_]{1,64}\\.png$`).test(key)) return true;
  const sample = /^imageedit\/samples\/([a-z0-9]{1,32})\.png$/.exec(key);
  return !!sample && sampleKey(sample[1]) === key;
}

/** A result file name as the worker writes them: `edit_…png`, `mask_…jpg`. */
export function isResultFileName(name: string): boolean {
  return /^[A-Za-z0-9_]{1,64}(_t)?\.(png|jpg)$/.test(name);
}

export function signUpload(key: string): string {
  const config = imageEditStorage();
  if (!config) throw new Error("image storage is not configured");
  return presignR2Put(config, key, { expiresIn: IMAGEEDIT_UPLOAD_TTL_SECONDS });
}

export function signFile(key: string, downloadAs?: string): string {
  const config = imageEditStorage();
  if (!config) throw new Error("image storage is not configured");
  return presignR2Get(config, key, {
    expiresIn: IMAGEEDIT_FILE_TTL_SECONDS,
    downloadAs,
  });
}

/* -------------------------------------------------------------------------- */
/* Gateway                                                                     */
/* -------------------------------------------------------------------------- */

export async function startEdit(params: {
  srcKey: string;
  outPrefix: string;
  req: Record<string, unknown>;
}): Promise<UpstreamResult> {
  return callUpstream("/ie/api/run", {
    method: "POST",
    json: { src_key: params.srcKey, out_prefix: params.outPrefix, req: params.req },
    // Long enough for a sleeping gateway to wake (about 32 s measured) and then
    // queue the job. The route's own limit is 60 s, so this stays below it.
    timeoutMs: 50_000,
  });
}

export async function getEditStatus(jobId: string): Promise<UpstreamResult> {
  return callUpstream(`/ie/api/status/${encodeURIComponent(jobId)}`, {
    method: "GET",
    timeoutMs: 20_000,
  });
}

export async function cancelEdit(jobId: string): Promise<UpstreamResult> {
  return callUpstream(`/ie/api/cancel/${encodeURIComponent(jobId)}`, {
    method: "POST",
    timeoutMs: 15_000,
  });
}

/* -------------------------------------------------------------------------- */
/* Access                                                                      */
/* -------------------------------------------------------------------------- */

export async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function signInRequired(): NextResponse {
  return privateJson({ detail: `Sign in to use ${IMAGEEDIT_NAME}.` }, 401);
}

/**
 * Signed in, and the named edit was started by this user. An edit with no
 * reservation, or someone else's, is reported as not found.
 */
export async function requireEditOwner(
  rawJobId: string
): Promise<
  | { ok: true; userId: string; hold: CreditHoldRecord }
  | { ok: false; response: NextResponse }
> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, response: signInRequired() };
  if (!isImageEditJobId(rawJobId)) {
    return { ok: false, response: privateJson({ detail: "Unknown edit." }, 404) };
  }

  let hold: CreditHoldRecord | null;
  try {
    hold = await findHoldByJobRef(IMAGEEDIT_SERVICE, rawJobId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[imageedit] hold lookup failed:", message);
    return { ok: false, response: privateJson({ detail: "Could not verify the edit." }, 500) };
  }
  if (!hold || hold.user_id !== userId) {
    return { ok: false, response: privateJson({ detail: "Unknown edit." }, 404) };
  }
  return { ok: true, userId, hold };
}

/* -------------------------------------------------------------------------- */
/* RunPod status -> the console's job view                                     */
/* -------------------------------------------------------------------------- */

export interface ConsoleJob {
  id: string;
  status: "queued" | "running" | "done" | "error" | "cancelled";
  stage: string;
  step: number;
  steps: number;
  eta?: number;
  waiting?: boolean;
  error?: string;
  result?: Record<string, unknown>;
}

/** How far through an edit each stage the worker reports sits, for the ETA. */
const STAGE_PROGRESS: Readonly<Record<string, number>> = {
  "Reading your prompt": 0.02,
  "Encoding your photo": 0.05,
  "Decoding the result": 0.82,
  "Aligning to your photo": 0.86,
  "Blending the edit at full resolution": 0.92,
  "Downloading the result": 0.98,
};
/** Rough GPU cold start; only used while no worker has picked the job up. */
const COLD_START_S = 60;
const GENERIC_ERROR = "Something went wrong with this edit. Please try again.";

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/**
 * Point every `/files/<name>` URL in a worker result at our file route, and
 * give each image object the storage key a follow-up edit needs.
 */
function rewriteResult(
  value: unknown,
  jobId: string,
  outPrefix: string
): unknown {
  if (typeof value === "string" && value.startsWith("/files/")) {
    const name = value.slice("/files/".length);
    return isResultFileName(name)
      ? `/api/imageedit/files/${encodeURIComponent(jobId)}/${name}`
      : null;
  }
  if (Array.isArray(value)) return value.map((v) => rewriteResult(v, jobId, outPrefix));
  const rec = asRecord(value);
  if (!rec) return value;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) out[k] = rewriteResult(v, jobId, outPrefix);

  // An image object: { id, w, h, url, thumb, png }.
  if (typeof rec.id === "string" && typeof rec.png === "string" && /^[A-Za-z0-9_]{1,64}$/.test(rec.id)) {
    out.key = `${outPrefix}/${rec.id}.png`;
    out.png = `${out.png}?download=1`;
  }
  return out;
}

/**
 * Translate RunPod's job status into what the page polls for. `terminal` says
 * whether the reservation should now be settled, and how.
 */
export function toConsoleJob(
  jobId: string,
  body: Record<string, unknown>,
  ctx: { createdAt: string; outPrefix: string }
): { job: ConsoleJob; terminal: "done" | "error" | "cancelled" | null } {
  const status = typeof body.status === "string" ? body.status : "";
  const output = asRecord(body.output);
  const elapsed = Math.max(0, (Date.now() - Date.parse(ctx.createdAt)) / 1000);

  const stage = typeof output?.stage === "string" ? output.stage : "";
  const step = typeof output?.step === "number" ? output.step : 0;
  const steps = typeof output?.steps === "number" && output.steps > 0 ? output.steps : 24;
  const est = estimatedSeconds(steps);

  if (status === "IN_QUEUE" || (status === "IN_PROGRESS" && !stage)) {
    return {
      job: {
        id: jobId,
        status: "queued",
        stage: "Queue",
        step: 0,
        steps,
        waiting: true,
        eta: Math.round(Math.max(5, COLD_START_S + est - elapsed)),
      },
      terminal: null,
    };
  }

  if (status === "IN_PROGRESS") {
    const progress =
      stage === "Generating the edit" ? 0.08 + 0.72 * (step / steps) : STAGE_PROGRESS[stage] ?? 0.1;
    return {
      job: {
        id: jobId,
        status: "running",
        stage,
        step,
        steps,
        eta: Math.round(Math.max(1, est * (1 - progress))),
      },
      terminal: null,
    };
  }

  if (status === "COMPLETED" && output) {
    if (typeof output.error === "string") {
      // The worker's own messages ("Describe the edit first.") are meant for
      // the user; a Python exception is not.
      const internal = /^\w+(Error|Exception)\b/.test(output.error) || output.error.includes("bad request");
      if (internal) console.error(`[imageedit] worker error on ${jobId}:`, output.error.slice(0, 500));
      return {
        job: { id: jobId, status: "error", stage: "", step: 0, steps, error: internal ? GENERIC_ERROR : output.error },
        terminal: "error",
      };
    }
    const result = asRecord(output.result);
    if (result) {
      const rewritten = asRecord(rewriteResult(result, jobId, ctx.outPrefix)) ?? {};
      const timing = asRecord(rewritten.timing) ?? {};
      rewritten.timing = { ...timing, total: Math.round(elapsed) };
      return {
        job: { id: jobId, status: "done", stage: "", step: steps, steps, result: rewritten },
        terminal: "done",
      };
    }
  }

  if (status === "CANCELLED") {
    return { job: { id: jobId, status: "cancelled", stage: "", step: 0, steps }, terminal: "cancelled" };
  }

  if (status === "FAILED" || status === "TIMED_OUT" || status === "COMPLETED") {
    console.error(`[imageedit] job ${jobId} ${status}:`, JSON.stringify(body.error ?? body.output ?? "").slice(0, 500));
    return {
      job: { id: jobId, status: "error", stage: "", step: 0, steps, error: GENERIC_ERROR },
      terminal: "error",
    };
  }

  // Unknown or transient status: keep the page polling.
  return {
    job: { id: jobId, status: "queued", stage: "Queue", step: 0, steps, waiting: true, eta: Math.round(Math.max(5, est)) },
    terminal: null,
  };
}
