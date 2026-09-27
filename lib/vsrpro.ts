/**
 * Shared VSR-Pro API contract (v1, revision 1.3).
 *
 * Isomorphic on purpose: the console UI, the client-side pre-flight checks,
 * and the server-side proxy validation all read the same enums and limits so
 * they cannot drift apart. Nothing secret lives here — the API key is
 * server-only and handled in lib/vsrpro-server.ts.
 *
 * Reference: docs/vsr-pro-api.zh-CN.md
 */

export const VSRPRO_DEFAULT_BASE_URL = "https://vsrpro-gateway.onrender.com";

/* -------------------------------------------------------------------------- */
/* Enums                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Delivery preset. Sets the SHORT EDGE of the output, not a bounding box.
 *
 * "original" is a deprecated 1.1 alias for "1080p" — it no longer preserves
 * the source dimensions. There is no preset that means "keep input size".
 */
export type VsrProResolution = "1080p" | "4k" | "original";

/** Which pipeline renders the job. */
export type VsrProModel = "vsr-combined" | "vsr-flash";

export type VsrProStatus =
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

export const VSRPRO_RESOLUTIONS: readonly VsrProResolution[] = [
  "1080p",
  "4k",
  "original",
];

export const VSRPRO_MODELS: readonly VsrProModel[] = [
  "vsr-combined",
  "vsr-flash",
];

/** Statuses that mean the job will never produce an output. */
export const VSRPRO_FAILURE_STATUSES: readonly VsrProStatus[] = [
  "FAILED",
  "CANCELLED",
  "TIMED_OUT",
];

export function isVsrProResolution(v: unknown): v is VsrProResolution {
  return typeof v === "string" && VSRPRO_RESOLUTIONS.some((r) => r === v);
}

export function isVsrProModel(v: unknown): v is VsrProModel {
  return typeof v === "string" && VSRPRO_MODELS.some((m) => m === v);
}

/* -------------------------------------------------------------------------- */
/* Presets                                                                     */
/* -------------------------------------------------------------------------- */

export interface ResolutionPreset {
  value: VsrProResolution;
  label: string;
  /** Pixels on the short edge of the delivered file. */
  shortEdge: number;
  blurb: string;
  deprecated?: boolean;
}

export const RESOLUTION_PRESETS: readonly ResolutionPreset[] = [
  {
    value: "1080p",
    label: "1080p",
    shortEdge: 1080,
    blurb: "Short edge 1080 px. A 16:9 source is delivered as 1920×1080.",
  },
  {
    value: "4k",
    label: "4K",
    shortEdge: 2160,
    blurb:
      "Short edge 2160 px. A 16:9 source is delivered as 3840×2160. (Default)",
  },
  {
    value: "original",
    label: "original",
    shortEdge: 1080,
    blurb:
      "Deprecated alias for 1080p. Despite the name it does NOT keep the source size — a 4K source comes back at 1080.",
    deprecated: true,
  },
];

export interface ModelPreset {
  value: VsrProModel;
  label: string;
  /** One-line description of what the pipeline actually does. */
  blurb: string;
  /** When this pipeline is the right choice. */
  useWhen: string;
  /** The failure mode a caller needs to know about. */
  caveat: string;
}

export const MODEL_PRESETS: readonly ModelPreset[] = [
  {
    value: "vsr-combined",
    label: "vsr-combined",
    blurb: "Restore the picture first, then upscale. (Default)",
    useWhen:
      "The source has compression artifacts, noise, or softness that must be cleaned up before adding pixels.",
    caveat:
      "Roughly half the throughput of flash, and ~3× the cost per finished minute, because it runs the extra restoration stage on H100 hardware.",
  },
  {
    value: "vsr-flash",
    label: "vsr-flash",
    blurb: "Upscale only — the restoration stage is skipped.",
    useWhen:
      "The source is already clean and simply needs more pixels. Runs on cheaper hardware (RTX 4090) at ~1/3 the cost and ~2× the throughput.",
    caveat:
      "It does not repair anything. A source with visible artifacts comes back with those same artifacts, upscaled. This is a quality decision, not a speed switch.",
  },
];

/* -------------------------------------------------------------------------- */
/* Documented service limits (§5)                                              */
/* -------------------------------------------------------------------------- */

/** 2 GiB max upload → 413 Payload Too Large. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;
/** 600 s max input duration → the job fails with an `error`. */
export const MAX_DURATION_SECONDS = 600;
/** Presigned upload URL lifetime. */
export const UPLOAD_URL_TTL_SECONDS = 60 * 60;
/** Presigned output URL lifetime. */
export const OUTPUT_URL_TTL_SECONDS = 24 * 60 * 60;
/** 30 requests / minute per account. */
export const RATE_LIMIT_PER_MINUTE = 30;
/** Concurrent jobs per model before new ones queue. */
export const MAX_CONCURRENT_JOBS_PER_MODEL = 3;

/**
 * Recommended poll cadence (§6 says 5–10 s; don't hot-spin).
 */
export const POLL_INTERVAL_MS = 6_000;

/**
 * Both pipelines scale to zero after ~30 s idle, so the first job after an
 * idle period waits on a worker boot. 120–235 s of wall time is normal and
 * is not a stuck job.
 */
export const COLD_START_HINT_AFTER_MS = 30_000;

/* -------------------------------------------------------------------------- */
/* Upload helpers                                                              */
/* -------------------------------------------------------------------------- */

/** Extensions the gateway accepts (§3.1). */
export const SUPPORTED_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".avi",
  ".m4v",
] as const;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
};

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export function isSupportedFilename(filename: string): boolean {
  const extension = extensionOf(filename);
  return SUPPORTED_EXTENSIONS.some((e) => e === extension);
}

/**
 * Pick the single `content_type` used for BOTH the `/v1/uploads` request and
 * the subsequent `PUT`. §3.2 requires the two to match exactly, so the value
 * is derived once from the extension rather than trusting `File.type`, which
 * browsers leave empty for .mkv / .avi.
 */
export function contentTypeFor(filename: string, browserType?: string): string {
  const fromExtension = MIME_BY_EXTENSION[extensionOf(filename)];
  if (fromExtension !== undefined) return fromExtension;
  // Browsers report "" rather than undefined for containers they don't know.
  if (browserType !== undefined && browserType !== "") return browserType;
  return "video/mp4";
}

/* -------------------------------------------------------------------------- */
/* Output-size prediction                                                      */
/* -------------------------------------------------------------------------- */

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Resolve what the gateway will actually deliver for a given source.
 *
 * The preset pins the SHORT edge and the aspect ratio is preserved, so the
 * long edge follows the source — which means the output can be much wider
 * than the preset name suggests (a 2.39:1 source at "1080p" is 2582 px wide,
 * not 1920). Presets are targets, not floors: a 4K source asking for 1080p
 * comes back smaller than it went in.
 */
export function predictOutputSize(
  source: Dimensions,
  shortEdge: number
): Dimensions {
  const { width, height } = source;
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  // Integer math off the short edge so the pinned edge lands exactly on the
  // preset instead of 1079.9999 from float division.
  if (width <= height) {
    return {
      width: shortEdge,
      height: Math.floor((height * shortEdge) / width),
    };
  }
  return {
    width: Math.floor((width * shortEdge) / height),
    height: shortEdge,
  };
}

/** True when the preset would deliver fewer pixels than the source has. */
export function isDownscale(source: Dimensions, shortEdge: number): boolean {
  return Math.min(source.width, source.height) > shortEdge;
}

/* -------------------------------------------------------------------------- */
/* Response payloads                                                           */
/* -------------------------------------------------------------------------- */

/** `POST /v1/uploads` → 200 */
export interface VsrProUploadTicket {
  upload_url: string;
  input_key: string;
  max_bytes: number;
  expires_in: number;
}

/** `POST /v1/jobs` → 200 */
export interface VsrProJobCreated {
  job_id: string;
  status: VsrProStatus;
}

/**
 * Per-stage timing breakdown.
 *
 * Read `stage1_s`, not `vsr_pro_s`. Before 1.2 the restoration stage had a
 * single model so its timing used a field named after that model; there is
 * more than one now, and `stage1`/`stage1_s` report whichever actually ran.
 * `vsr_pro_s` stays in the contract only so older clients don't throw — it is
 * no longer emitted, and a client reading only the old field gets a breakdown
 * with the upscale cost but not the restoration cost, which is the bulk of it.
 */
export interface VsrProStages {
  /** Restoration model that ran. Currently always "fast". */
  stage1?: string;
  /** Restoration stage seconds. This is the field to read. */
  stage1_s?: number;
  /** 2× upscale seconds. Absent on `1080p:direct`, which does no upscale. */
  proteus_s?: number;
  /** Seconds spent fitting the result to the exact target size. */
  fit_s?: number;
  /** @deprecated Old name for `stage1_s`. No longer emitted. */
  vsr_pro_s?: number;
}

/**
 * `GET /v1/jobs/{job_id}` → 200
 *
 * Everything past `status` is optional. Notably `route`, `stages`,
 * `stage1_base`, and `vsr_pro_base` describe a two-stage render and are absent
 * for `vsr-flash`, which has only one stage. Parse them as optional fields
 * rather than branching on `model`, so one code path handles both pipelines.
 */
export interface VsrProJobState {
  job_id: string;
  status: VsrProStatus;
  /** Presigned download URL. Treat as a short-lived credential. */
  output_url?: string;
  output_expires_in?: number;
  error?: string;
  model?: VsrProModel;
  target?: "1080p" | "4k";
  target_short_edge?: number;
  source?: { width: number; height: number; frames: number };
  frames?: number;
  /** Render seconds on the worker, excluding queue time. */
  seconds?: number;
  fps?: number;
  /** Render path taken, e.g. "4k:1080base+2x". Two-stage renders only. */
  route?: string;
  /** Short edge the restoration stage worked at. Two-stage renders only. */
  stage1_base?: number;
  /** @deprecated Old name for `stage1_base`. Always null now. */
  vsr_pro_base?: number | null;
  stages?: VsrProStages;
}

/* -------------------------------------------------------------------------- */
/* Terminal-state helpers                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A job only succeeded when it is COMPLETED *and* carries no `error`. §4 is
 * explicit that `error` can be present on a 200, so status alone is not
 * enough.
 */
export function isJobSuccess(job: VsrProJobState): boolean {
  if (job.status !== "COMPLETED") return false;
  return job.error === undefined || job.error === "";
}

export function isJobFailure(job: VsrProJobState): boolean {
  if (job.error !== undefined && job.error !== "") return true;
  return VSRPRO_FAILURE_STATUSES.some((s) => s === job.status);
}

export function isJobTerminal(job: VsrProJobState): boolean {
  return isJobSuccess(job) || isJobFailure(job);
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                  */
/* -------------------------------------------------------------------------- */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes / 1024;
  let unit = "KiB";
  for (const next of ["MiB", "GiB"]) {
    if (value < 1024) break;
    value /= 1024;
    unit = next;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${unit}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}
