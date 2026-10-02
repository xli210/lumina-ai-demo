/**
 * The first-party cookie that tells one browser from another.
 *
 * Kept apart from lib/free-claim.ts because middleware.ts sets it, and
 * middleware cannot import `server-only` or `node:crypto`. Web Crypto exists
 * in both runtimes.
 *
 * It holds a random id and nothing else: no account, no tracking across
 * sites, never sent to a third party. Its only use is deciding whether a
 * second account on the same browser may collect free credits again
 * (lib/free-claim.ts). It is listed in the privacy policy.
 */

export const DEVICE_COOKIE = "np_did";

/** Two years, long enough to outlast any reason to open a second account. */
export const DEVICE_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 730;

/** 128 random bits as 32 hex characters. */
export function newDeviceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Only ids we minted are accepted back, so a forged cookie cannot pin a hash. */
export function isDeviceId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{32}$/.test(value);
}
