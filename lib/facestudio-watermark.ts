/**
 * Who gets the NanoPocket.ai watermark on a Nano FaceStudio Online render, and
 * how a finished render is checked. Pure (no database, no network).
 *
 * Policy (from the worker maintainers' guide, 2026-10-21): a render made by an
 * account that has never bought credits carries a tiled "NanoPocket.ai" mark;
 * an account that has bought credits once never gets it again, whatever its
 * balance. Free credits (signup, free top-ups, promos) do not count as buying.
 *
 * The mark is burned in by the GPU worker before the PNG is encoded, so no
 * unmarked copy of a free render exists in storage. The only way a free user
 * could get one is a worker that did not understand the option (an old image).
 * The worker says so with `watermarked: true` on every marked render; the
 * checks here refuse to hand over a render that was owed a mark and lacks it.
 *
 * Rollout: the whole thing is off until FACESTUDIO_WATERMARK=1 is set in the
 * deployment, which must happen only after the gateway that forwards the option
 * is deployed (it is deployed by hand on Render). Off, nothing is sent and
 * nothing is checked, which is exactly the behaviour before this existed.
 */

export function watermarkEnabled(env: string | undefined = process.env.FACESTUDIO_WATERMARK): boolean {
  return env === "1";
}

/**
 * Whether this render must carry the mark. Only server-side facts go in:
 * whatever the browser sent is never read.
 */
export function needsWatermark(everPurchased: boolean | null): boolean {
  // `null` means the purchase lookup failed. Mark: the safe side to fail on.
  return everPurchased !== true;
}

/** What the gateway's status said about the finished render. */
export function upstreamWatermarked(body: Record<string, unknown> | undefined): boolean {
  return body?.watermarked === true;
}

/**
 * A render that was owed a mark but did not come back with one must not reach
 * the user. `recorded` is what was stored on the hold when the render started
 * (true/false), or undefined for a render started before the rollout.
 */
export function owesMissingWatermark(recorded: unknown, body: Record<string, unknown> | undefined): boolean {
  return recorded === true && !upstreamWatermarked(body);
}

/** The shape the console reads for a failed render. */
export const WATERMARK_MISSING_BODY = {
  status: "error",
  state: "error",
  error_code: "internal_error",
  error_kind: "server",
  error_message: "The render did not finish correctly. Please try again. You have not been charged.",
  error: "The render did not finish correctly. Please try again. You have not been charged.",
  retryable: true,
} as const;
