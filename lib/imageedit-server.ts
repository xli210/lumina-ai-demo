import "server-only";
import { randomBytes } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { findHoldByJobRef, type CreditHoldRecord } from "@/lib/credits-server";
import {
  callUpstream,
  isFaceStudioConfigured,
  upstreamString,
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
  IMAGEEDIT_SERVICE,
  IMAGEEDIT_UPLOAD_TTL_SECONDS,
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
 * Storage layout, in that bucket:
 *
 *   spotedit/input/<user>/src_<12 hex>_photo          an uploaded photo
 *   spotedit/output/<yyyymmdd>/<job id>/spotedit.png  one edit's result, written by the worker
 *
 * The user id in an input path, and the job id in an output path (a job has a
 * credit hold that says who started it), are what make ownership checkable
 * from the key alone.
 */

const INPUT_ROOT = "spotedit/input";
const RESULT_KEY = /^spotedit\/output\/\d{8}\/([A-Za-z0-9-]{8,80})\/spotedit\.png$/;

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

export function newSourceKey(userId: string): { id: string; key: string } {
  const id = `src_${randomBytes(6).toString("hex")}`;
  return { id, key: `${INPUT_ROOT}/${userSegment(userId)}/${id}_photo` };
}

/**
 * May this user edit the image stored at `key`? Their uploads, or the result of
 * their own edit. A watermarked result is not: the mark would become part of
 * the photo.
 */
export async function userMayEdit(userId: string, key: string): Promise<boolean> {
  const u = userSegment(userId);
  if (new RegExp(`^${INPUT_ROOT}/${u}/src_[0-9a-f]{12}_photo$`).test(key)) return true;
  const result = RESULT_KEY.exec(key);
  if (!result) return false;
  const hold = await findHoldByJobRef(IMAGEEDIT_SERVICE, result[1]);
  return hold?.user_id === userId && hold.estimate?.watermark === false;
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

/** The storage key inside a URL the worker returned, if it is one of its results. */
export function resultKeyFromUrl(url: string, bucket: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "");
  } catch {
    return null;
  }
  const key = path.startsWith(`${bucket}/`) ? path.slice(bucket.length + 1) : path;
  return RESULT_KEY.test(key) ? key : null;
}

/* -------------------------------------------------------------------------- */
/* Gateway                                                                     */
/* -------------------------------------------------------------------------- */

export type PhotoProbe =
  | { ok: true; width: number; height: number }
  | { ok: false; status: number; detail: string };

/** The photo's real size, read from the file. May throw when the gateway cannot be reached. */
export async function probePhoto(key: string, timeoutMs: number): Promise<PhotoProbe> {
  const up = await callUpstream("/ie/api/probe", {
    method: "POST",
    json: { url: signFile(key) },
    timeoutMs,
  });
  const { width, height } = up.body;
  if (up.status === 200 && typeof width === "number" && typeof height === "number") {
    return { ok: true, width, height };
  }
  const detail = upstreamString(up.body, "detail");
  return up.status >= 400 && up.status < 500 && detail
    ? { ok: false, status: up.status, detail }
    : { ok: false, status: 502, detail: "Could not read the photo. Please try again." };
}

export async function startEdit(params: {
  srcKey: string;
  prompt: string;
  seed: number;
  watermark: boolean;
  mask: string | null;
  requestId: string;
  userId: string;
}): Promise<UpstreamResult> {
  return callUpstream("/ie/api/run", {
    method: "POST",
    json: {
      photo_url: signFile(params.srcKey),
      prompt: params.prompt,
      seed: params.seed,
      watermark: params.watermark,
      mask: params.mask,
      request_id: params.requestId,
      user: params.userId,
    },
    // The route's own limit is 60 s and a probe comes first, so this stays below it.
    timeoutMs: 30_000,
  });
}

export async function getEditStatus(jobId: string): Promise<UpstreamResult> {
  return callUpstream(`/ie/api/status/${encodeURIComponent(jobId)}`, {
    method: "GET",
    timeoutMs: 20_000,
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
/* RunPod status -> the page's job view                                        */
/* -------------------------------------------------------------------------- */

export interface EditJob {
  id: string;
  status: "queued" | "running" | "done" | "error";
  phase?: string;
  step?: number;
  steps?: number;
  error?: string;
  url?: string;
  download_url?: string;
  result_key?: string;
  width?: number;
  height?: number;
  seed?: number;
  edited_pct?: number;
  watermarked?: boolean;
  credits?: number;
}

const PHASES: Readonly<Record<string, string>> = {
  loading: "Loading your photo",
  editing: "Editing",
  rendering: "Rendering at full resolution",
  saving: "Saving",
};
const GENERIC_ERROR = "Something went wrong with this edit. Please try again. You have not been charged.";
/** The worker's own message is meant for the user, except for these. */
const INTERNAL_ERROR_CODES = new Set(["internal", "gpu_out_of_memory"]);

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined;
}

/**
 * Translate RunPod's job status into what the page polls for. `terminal` says
 * whether the reservation should now be settled, and how.
 */
export function toEditJob(
  jobId: string,
  body: Record<string, unknown>,
  ctx: { credits: number; mustBeWatermarked: boolean; resultKey: (pngUrl: string) => string | null }
): { job: EditJob; terminal: "done" | "error" | "cancelled" | null } {
  const status = typeof body.status === "string" ? body.status : "";
  const output = asRecord(body.output);

  if (status === "IN_PROGRESS") {
    const phase = typeof output?.phase === "string" ? PHASES[output.phase] : undefined;
    return {
      job: { id: jobId, status: "running", phase: phase ?? "Starting", step: num(output?.step) ?? 0, steps: num(output?.steps) ?? 0 },
      terminal: null,
    };
  }

  if (status === "COMPLETED" && output?.ok === true && typeof output.url === "string" && typeof output.png_url === "string") {
    // A free account's result without the mark is never handed over.
    if (ctx.mustBeWatermarked && output.watermarked !== true) {
      console.error(`[imageedit] CRITICAL job ${jobId} came back without the watermark it needed`);
      return { job: { id: jobId, status: "error", error: GENERIC_ERROR }, terminal: "error" };
    }
    const key = ctx.resultKey(output.png_url);
    return {
      job: {
        id: jobId,
        status: "done",
        // Our own links rather than the worker's, for the lifetime the privacy policy states.
        url: key ? signFile(key.replace(/\.png$/, ".jpg")) : output.url,
        download_url: key ? signFile(key, "spotedit.png") : output.png_url,
        // "Keep editing this" names it; a marked result stays out of that (userMayEdit).
        result_key: key && output.watermarked !== true ? key : undefined,
        width: num(output.width),
        height: num(output.height),
        seed: num(output.seed),
        edited_pct: num(output.edited_pct),
        watermarked: output.watermarked === true,
        credits: ctx.credits,
      },
      terminal: "done",
    };
  }

  if (status === "COMPLETED" && output) {
    const code = typeof output.error_code === "string" ? output.error_code : "";
    const message = typeof output.error_message === "string" ? output.error_message : "";
    if (!message || INTERNAL_ERROR_CODES.has(code)) {
      console.error(`[imageedit] worker error on ${jobId}:`, code, JSON.stringify(output).slice(0, 500));
      return { job: { id: jobId, status: "error", error: GENERIC_ERROR }, terminal: "error" };
    }
    return { job: { id: jobId, status: "error", error: `${message} You have not been charged.` }, terminal: "error" };
  }

  if (status === "CANCELLED") {
    return { job: { id: jobId, status: "error", error: "This edit was cancelled. You have not been charged." }, terminal: "cancelled" };
  }

  if (status === "FAILED" || status === "TIMED_OUT" || status === "COMPLETED") {
    console.error(`[imageedit] job ${jobId} ${status}:`, JSON.stringify(body.error ?? body.output ?? "").slice(0, 500));
    return { job: { id: jobId, status: "error", error: GENERIC_ERROR }, terminal: "error" };
  }

  // IN_QUEUE, or an unknown or transient status: keep the page polling.
  return { job: { id: jobId, status: "queued", phase: "Waiting for a GPU" }, terminal: null };
}
