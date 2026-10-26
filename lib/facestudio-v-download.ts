import { createHmac } from "node:crypto";

/**
 * Download links for "My videos": a link to the studio that works without the
 * studio's own cookie, for one job, for a short while. The studio checks it with
 * the secret both sides share (swap_pipelines/results.py there). Pure (no
 * database, no network).
 *
 *   <studio>/api/outputs/<job>.mp4?exp=<unix seconds>&sig=<hex(HMAC-SHA256(secret, "download:<job>:<exp>"))[:32]>&dl=1
 *
 * The studio keeps a finished video for 24 hours after it was made and then
 * deletes it for good, so a link never outlives that: it expires at whichever
 * comes first, an hour from now or the end of those 24 hours.
 */

export const DOWNLOAD_LINK_SECONDS = 60 * 60;

export function signDownload(
  jobId: string,
  exp: number,
  secret: string | undefined = process.env.STUDIO_PARTNER_SECRET
): string | null {
  if (!secret || !/^[0-9a-f]{12}$/.test(jobId)) return null;
  return createHmac("sha256", secret).update(`download:${jobId}:${Math.floor(exp)}`).digest("hex").slice(0, 32);
}

/** The link, or null when it cannot be made (no secret here, a bad id, or the video's time is already up). */
export function downloadUrl(
  studioOrigin: string,
  jobId: string,
  keptUntil: number | null | undefined,
  now = Date.now(),
  secret: string | undefined = process.env.STUDIO_PARTNER_SECRET
): string | null {
  const nowS = Math.floor(now / 1000);
  let exp = nowS + DOWNLOAD_LINK_SECONDS;
  if (typeof keptUntil === "number") exp = Math.min(exp, Math.floor(keptUntil));
  if (exp <= nowS) return null;
  const sig = signDownload(jobId, exp, secret);
  if (!sig) return null;
  return `${studioOrigin}/api/outputs/${jobId}.mp4?exp=${exp}&sig=${sig}&dl=1`;
}

/** "5 h 12 min" until a unix time, for "deleted in ...". */
export function timeLeft(until: number, now = Date.now()): string {
  const m = Math.max(0, Math.floor((until * 1000 - now) / 60000));
  const h = Math.floor(m / 60);
  return h > 0 ? `${h} h ${m % 60} min` : `${m} min`;
}
