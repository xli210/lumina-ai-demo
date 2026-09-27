import "server-only";
import { NextResponse } from "next/server";
import {
  VSRPRO_DEFAULT_BASE_URL,
  isSupportedFilename,
  isVsrProModel,
  isVsrProResolution,
  type VsrProModel,
  type VsrProResolution,
} from "./vsrpro";

/**
 * Server-side plumbing for the VSR-Pro gateway.
 *
 * §2 of the API doc is explicit that the API key is a server-side secret and
 * that a browser frontend cannot call the gateway directly. So the console at
 * /private-demos/vsr-pro talks only to our own /api/vsrpro/* routes, and this
 * module is the single place that ever sees VSRPRO_API_KEY:
 *
 *   browser ──► /api/vsrpro/* (holds the key) ──► VSR-Pro gateway
 *
 * The two bulk transfers stay out of this path entirely: the browser PUTs to
 * `upload_url` and GETs from `output_url` directly against object storage,
 * since those presigned URLs carry their own authorization.
 */

interface UpstreamConfig {
  baseUrl: string;
  apiKey: string;
}

function upstream(): UpstreamConfig {
  const baseUrl = (
    process.env.VSRPRO_BASE_URL || VSRPRO_DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
  return { baseUrl, apiKey: process.env.VSRPRO_API_KEY || "" };
}

export function isVsrProConfigured(): boolean {
  return !!process.env.VSRPRO_API_KEY;
}

export interface ForwardResult {
  status: number;
  /** Parsed JSON body, or null when the upstream sent something unparseable. */
  body: unknown;
}

/**
 * Call the gateway with the Bearer key injected. All three endpoints we proxy
 * return small JSON documents, so this buffers rather than streams.
 */
async function callUpstream(
  path: string,
  init: { method: "GET" | "POST"; json?: unknown }
): Promise<ForwardResult> {
  const { baseUrl, apiKey } = upstream();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
  if (init.json !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${baseUrl}${path}`, {
    method: init.method,
    headers,
    body: init.json === undefined ? undefined : JSON.stringify(init.json),
    cache: "no-store",
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Render's edge can return an HTML error page during a cold start.
      body = { detail: text.slice(0, 400) };
    }
  }
  return { status: response.status, body };
}

/** Never cache a response derived from a per-account presigned URL. */
function jsonResponse(result: ForwardResult): NextResponse {
  return NextResponse.json(result.body ?? {}, {
    status: result.status,
    headers: { "cache-control": "private, no-store" },
  });
}

function configError(): NextResponse {
  return NextResponse.json(
    {
      detail:
        "VSR-Pro upstream is not configured. Set VSRPRO_API_KEY in the deploy environment.",
    },
    { status: 503, headers: { "cache-control": "private, no-store" } }
  );
}

function badRequest(detail: string): NextResponse {
  return NextResponse.json(
    { detail },
    { status: 400, headers: { "cache-control": "private, no-store" } }
  );
}

function upstreamUnavailable(path: string, cause: unknown): NextResponse {
  console.error(`[vsrpro] upstream fetch failed for ${path}:`, cause);
  return NextResponse.json(
    { detail: "VSR-Pro gateway unreachable. Try again shortly." },
    { status: 502, headers: { "cache-control": "private, no-store" } }
  );
}

/* -------------------------------------------------------------------------- */
/* POST /v1/uploads                                                            */
/* -------------------------------------------------------------------------- */

export async function requestUploadTicket(raw: unknown): Promise<NextResponse> {
  if (!isVsrProConfigured()) return configError();

  const input = (raw ?? {}) as Record<string, unknown>;
  const filename = input.filename;
  if (typeof filename !== "string" || filename.length < 1 || filename.length > 200) {
    return badRequest("filename is required and must be 1-200 characters.");
  }
  if (!isSupportedFilename(filename)) {
    return badRequest(
      "Unsupported file extension. Allowed: .mp4, .mov, .mkv, .webm, .avi, .m4v"
    );
  }
  const contentType =
    typeof input.content_type === "string" && input.content_type
      ? input.content_type
      : "video/mp4";

  try {
    const result = await callUpstream("/v1/uploads", {
      method: "POST",
      json: { filename, content_type: contentType },
    });
    return jsonResponse(result);
  } catch (e) {
    return upstreamUnavailable("/v1/uploads", e);
  }
}

/* -------------------------------------------------------------------------- */
/* POST /v1/jobs                                                               */
/* -------------------------------------------------------------------------- */

export async function createJob(raw: unknown): Promise<NextResponse> {
  if (!isVsrProConfigured()) return configError();

  const input = (raw ?? {}) as Record<string, unknown>;

  const inputKey = input.input_key;
  if (typeof inputKey !== "string" || !inputKey) {
    return badRequest("input_key is required.");
  }

  // `model_parameters` was replaced by `resolution` in 1.1 and the gateway
  // rejects a non-empty object rather than silently ignoring it. Reject here
  // too so the failure is identical whether or not the proxy is in the path.
  const modelParameters = input.model_parameters;
  if (
    modelParameters &&
    typeof modelParameters === "object" &&
    Object.keys(modelParameters as object).length > 0
  ) {
    return badRequest(
      "model_parameters is no longer accepted; use resolution instead, one of ['1080p', '4k', 'original']"
    );
  }

  let resolution: VsrProResolution | undefined;
  if (input.resolution !== undefined) {
    if (!isVsrProResolution(input.resolution)) {
      return badRequest(
        "Unrecognised resolution. Use one of ['1080p', '4k', 'original']"
      );
    }
    resolution = input.resolution;
  }

  let model: VsrProModel | undefined;
  if (input.model !== undefined) {
    if (!isVsrProModel(input.model)) {
      return badRequest(
        "Unrecognised model. Use one of ['vsr-combined', 'vsr-flash']"
      );
    }
    model = input.model;
  }

  // Send only the fields the caller actually chose. Omitting `model` is what
  // keeps a request on the 1.2 default pipeline.
  const payload: Record<string, unknown> = { input_key: inputKey };
  if (resolution) payload.resolution = resolution;
  if (model) payload.model = model;

  try {
    const result = await callUpstream("/v1/jobs", {
      method: "POST",
      json: payload,
    });
    return jsonResponse(result);
  } catch (e) {
    return upstreamUnavailable("/v1/jobs", e);
  }
}

/* -------------------------------------------------------------------------- */
/* GET /v1/jobs/{job_id}                                                       */
/* -------------------------------------------------------------------------- */

export async function getJob(jobId: string): Promise<NextResponse> {
  if (!isVsrProConfigured()) return configError();
  if (!jobId) return badRequest("job_id is required.");

  const path = `/v1/jobs/${encodeURIComponent(jobId)}`;
  try {
    const result = await callUpstream(path, { method: "GET" });
    return jsonResponse(result);
  } catch (e) {
    return upstreamUnavailable(path, e);
  }
}

/* -------------------------------------------------------------------------- */
/* GET /healthz                                                                */
/* -------------------------------------------------------------------------- */

/** Liveness check. The upstream needs no auth here, but we still gate ours. */
export async function getHealth(): Promise<NextResponse> {
  const { baseUrl } = upstream();
  try {
    const response = await fetch(`${baseUrl}/healthz`, { cache: "no-store" });
    const text = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { status: text.slice(0, 200) };
    }
    return NextResponse.json(
      { reachable: response.ok, upstream_status: response.status, body },
      { status: 200, headers: { "cache-control": "private, no-store" } }
    );
  } catch (e) {
    console.error("[vsrpro] healthz failed:", e);
    return NextResponse.json(
      { reachable: false, upstream_status: 0, body: null },
      { status: 200, headers: { "cache-control": "private, no-store" } }
    );
  }
}
