import "server-only";
import { randomBytes } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  captureHold,
  findHoldByJobRef,
  releaseHold,
  type CreditHoldRecord,
} from "@/lib/credits-server";
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
  IMAGEEDIT_HOLD_TTL_SECONDS,
  IMAGEEDIT_NAME,
  IMAGEEDIT_SERVICE,
  IMAGEEDIT_UPLOAD_TTL_SECONDS,
  isImageEditJobId,
} from "@/lib/imageedit";
import type { NextResponse } from "next/server";

/**
 * Server-side plumbing for SpotEdit.
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
  /** The photo as it was before this edit, for a page that no longer has it. */
  before_url?: string;
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

/* -------------------------------------------------------------------------- */
/* Reading and settling an edit, with or without its page open                 */
/* -------------------------------------------------------------------------- */

export interface EditReading {
  job: EditJob;
  terminal: "done" | "error" | "cancelled" | null;
  billedMs: number | null;
  queuedMs: number | null;
}

/** The finished file in storage. The worker files it under the UTC day it was written, which can be the day after the edit began. */
export async function storedResultKey(hold: CreditHoldRecord): Promise<string | null> {
  const began = new Date(hold.created_at).getTime();
  for (const t of [began, began + 24 * 3600 * 1000]) {
    const day = new Date(t).toISOString().slice(0, 10).replace(/-/g, "");
    const key = `spotedit/output/${day}/${hold.job_ref}/spotedit.png`;
    try {
      const r = await fetch(signFile(key), {
        headers: { Range: "bytes=0-0" },
        cache: "no-store",
        signal: AbortSignal.timeout(4_000),
      });
      await r.body?.cancel();
      if (r.ok) return key;
    } catch (err: unknown) {
      console.error("[imageedit] storage check failed:", err instanceof Error ? err.message : err);
    }
  }
  return null;
}

function holdHasExpired(hold: CreditHoldRecord): boolean {
  return Date.now() - new Date(hold.created_at).getTime() > IMAGEEDIT_HOLD_TTL_SECONDS * 1000;
}

function withBefore(job: EditJob, hold: CreditHoldRecord): EditJob {
  const src = hold.estimate?.src_key;
  return job.status === "done" && typeof src === "string" ? { ...job, before_url: signFile(src) } : job;
}

/**
 * Where an edit stands. RunPod forgets a job about half an hour after it ends, so a person
 * coming back later is answered from the file in storage. Null when nothing can be said yet.
 */
export async function readEdit(hold: CreditHoldRecord): Promise<EditReading | null> {
  const jobId = hold.job_ref as string;
  const bucket = imageEditStorage()?.bucket ?? "";

  let upstream: UpstreamResult | null = null;
  try {
    upstream = await getEditStatus(jobId);
  } catch (err: unknown) {
    console.error("[imageedit] status fetch failed:", err instanceof Error ? err.message : err);
  }

  if (upstream && upstream.status < 400) {
    const { job, terminal } = toEditJob(jobId, upstream.body, {
      credits: hold.amount,
      // Anything but a recorded "no mark needed" means the mark is needed.
      mustBeWatermarked: hold.estimate?.watermark !== false,
      resultKey: (pngUrl) => resultKeyFromUrl(pngUrl, bucket),
    });
    const { executionTime, delayTime } = upstream.body;
    return {
      job: withBefore(job, hold),
      terminal,
      // RunPod's milliseconds, so cost per edit and cold starts can be measured.
      billedMs: typeof executionTime === "number" ? executionTime : null,
      queuedMs: typeof delayTime === "number" ? delayTime : null,
    };
  }

  const key = await storedResultKey(hold);
  if (key) {
    // The worker was told to mark this edit when the job was started, and the file is what it wrote.
    const watermarked = hold.estimate?.watermark !== false;
    const job: EditJob = {
      id: jobId,
      status: "done",
      url: signFile(key.replace(/\.png$/, ".jpg")),
      download_url: signFile(key, "spotedit.png"),
      result_key: watermarked ? undefined : key,
      width: num(hold.estimate?.width),
      height: num(hold.estimate?.height),
      watermarked,
      credits: hold.amount,
    };
    return { job: withBefore(job, hold), terminal: "done", billedMs: null, queuedMs: null };
  }

  // Inside the reservation's lifetime this can be a blip. After it, there is no edit to wait for.
  if (hold.status === "open" && !holdHasExpired(hold)) return null;
  return {
    job: {
      id: jobId,
      status: "error",
      error: hold.status === "open" ? GENERIC_ERROR : "This edit's result is no longer available.",
    },
    terminal: "error",
    billedMs: null,
    queuedMs: null,
  };
}

/** Charged when the edit landed, returned when it did not. Keyed on the hold, so settling twice changes nothing. */
export async function settleEdit(hold: CreditHoldRecord, reading: EditReading): Promise<void> {
  if (!reading.terminal || hold.status !== "open") return;
  try {
    if (reading.terminal === "done") {
      await captureHold({
        holdId: hold.id,
        actualAmount: hold.amount,
        reference: {
          service: IMAGEEDIT_SERVICE,
          job_ref: hold.job_ref,
          billed_ms: reading.billedMs,
          queued_ms: reading.queuedMs,
        },
      });
    } else {
      await releaseHold(hold.id, reading.terminal === "cancelled" ? "cancelled" : "edit_failed");
    }
  } catch (err: unknown) {
    // The edit's outcome is still shown; the next reading retries settlement.
    console.error(`[imageedit] settle (${reading.terminal}) failed:`, err instanceof Error ? err.message : err);
  }
}

const HOLD_COLUMNS = "id, user_id, amount, status, service, job_ref, created_at, estimate";

async function settleHolds(holds: CreditHoldRecord[]): Promise<void> {
  const results = await Promise.allSettled(
    holds.map(async (hold) => {
      if (hold.job_ref) {
        const reading = await readEdit(hold);
        if (reading) await settleEdit(hold, reading);
      } else if (holdHasExpired(hold)) {
        // Reserved, but no job was ever tied to it.
        await releaseHold(hold.id, "no_job_started");
      }
    })
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[imageedit] settling hold ${holds[i].id} failed:`, r.reason instanceof Error ? r.reason.message : r.reason);
    }
  });
}

/**
 * Settle this person's open edits. The page used to be the only thing that did, so
 * someone who closed it stayed "running" with the credits reserved.
 */
export async function settleOpenEdits(userId: string): Promise<void> {
  const { data, error } = await createAdminClient()
    .from("credit_holds")
    .select(HOLD_COLUMNS)
    .eq("service", IMAGEEDIT_SERVICE)
    .eq("user_id", userId)
    .eq("status", "open")
    .limit(10);
  if (error) throw new Error(`Failed to list open edits: ${error.message}`);
  await settleHolds((data ?? []) as CreditHoldRecord[]);
}

/**
 * Everyone's oldest open edits, so one whose page was closed does not wait for its owner to return. Called when
 * the editor opens, when /admin/reliability is read, and before the expiry sweep, which cannot tell a made edit
 * from one that never ran.
 */
export async function settleStaleEdits(limit = 10): Promise<void> {
  const { data, error } = await createAdminClient()
    .from("credit_holds")
    .select(HOLD_COLUMNS)
    .eq("service", IMAGEEDIT_SERVICE)
    .eq("status", "open")
    .lt("created_at", new Date(Date.now() - 3 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`Failed to list open edits: ${error.message}`);
  await settleHolds((data ?? []) as CreditHoldRecord[]);
}
