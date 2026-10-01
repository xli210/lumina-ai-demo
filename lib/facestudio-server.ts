import "server-only";

import {
  FACESTUDIO_DEFAULT_BASE_URL,
  type FaceStudioMode,
} from "@/lib/facestudio";

/**
 * Server-side plumbing for the Nano FaceStudio Online gateway.
 *
 * The gateway holds the RunPod key and the R2 credentials, so the browser can
 * never reach either. The console at /face-studio talks only to our own
 * /api/facestudio/* routes, and this module is the single place that sees
 * FACESTUDIO_GATEWAY_TOKEN:
 *
 *   browser ──► /api/facestudio/* (auth + credits) ──► gateway ──► RunPod
 *
 * The two bulk transfers stay out of this path: the browser PUTs the photo
 * straight to storage using a presigned URL the gateway minted, and the
 * result PNG is streamed back through us only because the page draws it on a
 * canvas and therefore needs a same-origin image. A 40 MB upload could not
 * pass through here anyway — a Vercel function body caps out at 4.5 MB.
 */

interface UpstreamConfig {
  baseUrl: string;
  token: string;
}

function upstream(): UpstreamConfig {
  const baseUrl = (
    process.env.FACESTUDIO_BASE_URL || FACESTUDIO_DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
  return { baseUrl, token: process.env.FACESTUDIO_GATEWAY_TOKEN || "" };
}

export function isFaceStudioConfigured(): boolean {
  return !!process.env.FACESTUDIO_GATEWAY_TOKEN;
}

export interface UpstreamResult {
  status: number;
  /** Parsed JSON, or `{ detail }` when the upstream sent something else. */
  body: Record<string, unknown>;
}

/** True for any 2xx. */
export function isOk(result: UpstreamResult): boolean {
  return result.status >= 200 && result.status < 300;
}

/** Read a string field out of an upstream body without prototype lookups. */
export function upstreamString(
  body: Record<string, unknown>,
  key: string
): string | undefined {
  const value = new Map(Object.entries(body)).get(key);
  return typeof value === "string" ? value : undefined;
}

/**
 * Call the gateway with the Bearer token injected.
 *
 * Every route we proxy returns a small JSON document, so this buffers rather
 * than streams. The one exception is the result PNG, handled by
 * `fetchResult` below.
 */
async function callUpstream(
  path: string,
  init: { method: "GET" | "POST"; json?: unknown; timeoutMs?: number }
): Promise<UpstreamResult> {
  const { baseUrl, token } = upstream();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (init.json !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${baseUrl}${path}`, {
    method: init.method,
    headers,
    body: init.json === undefined ? undefined : JSON.stringify(init.json),
    cache: "no-store",
    signal:
      init.timeoutMs === undefined
        ? undefined
        : AbortSignal.timeout(init.timeoutMs),
  });

  const text = await response.text();
  let body: Record<string, unknown> = {};
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text);
      body =
        typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : { detail: text.slice(0, 400) };
    } catch {
      // Render's edge serves an HTML error page during a cold start.
      body = { detail: text.slice(0, 400) };
    }
  }
  return { status: response.status, body };
}

/* -------------------------------------------------------------------------- */
/* Routes                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Ask the gateway to start a worker. Fire-and-forget: a failure here only
 * means the user pays the cold start they would have paid anyway.
 */
export async function warmGateway(): Promise<UpstreamResult> {
  return callUpstream("/v5/api/visit", { method: "POST", timeoutMs: 15_000 });
}

/** Mint a presigned PUT so the browser can upload straight to storage. */
export async function requestUploadTicket(params: {
  filename: string;
  contentType: string;
}): Promise<UpstreamResult> {
  return callUpstream("/v5/api/uploads", {
    method: "POST",
    json: { filename: params.filename, content_type: params.contentType },
    timeoutMs: 30_000,
  });
}

/**
 * Detect faces in an already-uploaded photo.
 *
 * Synchronous by design — the console cannot draw the face cards until it has
 * them. The gateway bounds its own wait below our function timeout so a stuck
 * GPU produces a clean error instead of a platform-level 504.
 */
export async function detectFaces(inputKey: string): Promise<UpstreamResult> {
  return callUpstream("/v5/api/detect", {
    method: "POST",
    json: { input_key: inputKey },
    timeoutMs: 55_000,
  });
}

/** Start a render. Returns `{ job_id }` on success. */
export async function startGenerate(params: {
  detectionId: string;
  mode: FaceStudioMode;
  /** face index (as a string) -> storage key of that face's reference photo */
  refs: Record<string, string>;
  preserveClasses: Record<string, number[]>;
}): Promise<UpstreamResult> {
  return callUpstream("/v5/api/generate", {
    method: "POST",
    json: {
      detection_id: params.detectionId,
      mode: params.mode,
      refs: params.refs,
      preserve_classes_map: params.preserveClasses,
    },
    timeoutMs: 30_000,
  });
}

export async function getJobStatus(jobId: string): Promise<UpstreamResult> {
  return callUpstream(`/v5/api/status/${encodeURIComponent(jobId)}`, {
    method: "GET",
    timeoutMs: 20_000,
  });
}

export async function sendFeedback(params: {
  jobId: string;
  rating: string;
}): Promise<UpstreamResult> {
  return callUpstream("/v5/api/feedback", {
    method: "POST",
    json: { job_id: params.jobId, rating: params.rating },
    timeoutMs: 15_000,
  });
}

/**
 * Fetch the finished PNG.
 *
 * Returns the raw Response so the caller can stream the body through without
 * buffering ~20 MB of image into the function's memory.
 */
export async function fetchResult(jobId: string): Promise<Response> {
  const { baseUrl, token } = upstream();
  return fetch(`${baseUrl}/v5/api/result/${encodeURIComponent(jobId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}
