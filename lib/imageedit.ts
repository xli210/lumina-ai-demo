/**
 * Nano ImageEdit 2.0 Online contract — safe to import from both client and server.
 *
 * A prompt-driven photo editor (add, remove, replace, text, light & style,
 * season, restore, and a free-form brush edit). The GPU work runs on the RunPod
 * Serverless endpoint `qwen-image-studio`, reached through the same gateway as
 * Nano FaceStudio Online; images travel through R2 under `imageedit/`.
 *
 *   browser ──► /api/imageedit/* (auth + credits) ──► gateway ──► RunPod
 *      └──────────── presigned PUT / GET ────────────► R2 ◄────────┘
 *
 * Nothing secret lives here. See docs/image-edit.md.
 */

export const IMAGEEDIT_NAME = "Nano ImageEdit 2.0 Online";

/** `service` on credit holds and ledger rows. */
export const IMAGEEDIT_SERVICE = "imageedit";

/**
 * Credits charged per finished edit (1 credit = $0.01). Each variation is its
 * own edit and its own GPU job, so it is charged separately.
 *
 * Measured cost is about $0.05 per edit: ~26-32 s billed on an H100 for the
 * warm path, plus the cold start when no worker is up. 30 credits ($0.30) is
 * roughly an 80% margin before Stripe fees, which take a large share of a small
 * pack, and before edits that fail after the GPU has run: those are refunded in
 * full, so the successful edits have to carry them.
 *
 * It equals the free top-up (FREE_TOPUP_CREDITS, 30), so an account that has
 * spent its welcome credits can still make one edit per top-up. That is a
 * deliberate cost (about $0.05 each, at most twice in any 7 days for an account
 * that has never bought credits), not an accident: raising either number
 * changes it. Free edits otherwise come from
 * the welcome grant, which is the part limited to one claim per person.
 *
 * It was 30 for the first day, then 50, then 30 again on 2026-10-06 because
 * almost nobody tried the tool at 50.
 */
export const IMAGEEDIT_CREDITS_PER_EDIT = 30;

export const IMAGEEDIT_MAX_VARIATIONS = 4;

/**
 * Open reservations per account. One request can start four variations, and
 * the endpoint runs one job at a time, so more than this only builds a queue
 * that the user is paying to hold.
 */
export const IMAGEEDIT_MAX_OPEN_EDITS = 4;

/**
 * How long a reservation may stay open before the sweeper frees it. Longer
 * than Face Studio's: four queued variations behind a cold start can take
 * several minutes, and a hold released before its job finishes is an edit
 * delivered free.
 */
export const IMAGEEDIT_HOLD_TTL_SECONDS = 30 * 60;

/**
 * Longest side of an uploaded photo, applied in the browser before upload.
 * 4096 rather than the worker's 6000 because iOS Safari cannot allocate a
 * canvas above ~16.7 megapixels, and the page re-encodes on a canvas.
 */
export const IMAGEEDIT_MAX_SIDE = 4096;

/** Presigned upload lifetime. */
export const IMAGEEDIT_UPLOAD_TTL_SECONDS = 15 * 60;

/** Presigned result-download lifetime. */
export const IMAGEEDIT_FILE_TTL_SECONDS = 60 * 60;

export const IMAGEEDIT_TOOLS = [
  "magic",
  "add",
  "remove",
  "replace",
  "text",
  "style",
  "season",
  "restore",
] as const;
export type ImageEditTool = (typeof IMAGEEDIT_TOOLS)[number];

export function isImageEditTool(v: unknown): v is ImageEditTool {
  return typeof v === "string" && IMAGEEDIT_TOOLS.some((t) => t === v);
}

/** Sample photos shipped with the editor; their PNGs live at imageedit/samples/. */
export const IMAGEEDIT_SAMPLES = [
  "lake2",
  "park2",
  "room",
  "fruit",
  "cars",
  "barber",
  "trends",
  "houses",
  "park",
  "glassplate",
  "sepia",
  "hangar",
] as const;

/*
 * Diffusion steps per tool: the fewest whose result is visually
 * indistinguishable from 40, measured by the worker's authors. Mirrors
 * studio_core.py in the image-edit-studio package; the worker uses the value
 * we send.
 */
const TOOL_STEPS: Readonly<Record<string, number>> = {
  remove: 12,
  restore: 12,
  add: 20,
  text: 20,
  replace: 24,
  season: 24,
  magic: 24,
  style: 24,
};
const STYLE_STEPS: Readonly<Record<string, number>> = {
  "Teal & orange": 12,
  "Black & white film": 12,
  "Foggy morning": 12,
  "Golden hour": 20,
  "Moonlit night": 24,
  "Blue hour": 24,
};
/** Typical warm seconds per edit by step count; progress estimate only. */
const EST_SECONDS: Readonly<Record<number, number>> = {
  8: 31,
  12: 39,
  16: 45,
  20: 45,
  24: 50,
  28: 53,
  40: 60,
};

export function stepsFor(req: {
  tool: string;
  preset?: string | null;
  text_new?: boolean;
}): number {
  if (req.tool === "style") return STYLE_STEPS[req.preset ?? ""] ?? 24;
  if (req.tool === "text" && req.text_new) return 24;
  return TOOL_STEPS[req.tool] ?? 24;
}

export function estimatedSeconds(steps: number): number {
  const known = Object.keys(EST_SECONDS).map(Number);
  const nearest = known.reduce((a, b) =>
    Math.abs(b - steps) < Math.abs(a - steps) ? b : a
  );
  return EST_SECONDS[nearest];
}

/** RunPod job ids, e.g. `53e40671-8baa-479d-a46b-c413bb7083a8-u1`. */
export function isImageEditJobId(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9-]{8,80}$/.test(v);
}
