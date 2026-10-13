import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * The short-lived token /facestudio-v/launch hands to the studio page, and the
 * billing API checks. Pure (no database, no network) so it can be tested alone.
 * It names a user and an expiry and is signed with a key derived from a server
 * secret; it grants nothing else.
 */

/** How long the studio page's token lives. A session of several videos fits. */
export const FSV_TOKEN_TTL_SECONDS = 3 * 60 * 60;

function tokenKey(secret: string | undefined): Buffer {
  if (!secret) throw new Error("The token secret is not set");
  // Derived, so the token key is not the secret itself and a leaked token reveals nothing about it.
  return createHash("sha256").update(`facestudio-v-token:${secret}`).digest();
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function signStudioToken(
  userId: string,
  secret: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY,
  now = Date.now()
): string {
  const body = b64(JSON.stringify({ u: userId, e: Math.floor(now / 1000) + FSV_TOKEN_TTL_SECONDS }));
  const sig = b64(createHmac("sha256", tokenKey(secret)).update(body).digest());
  return `${body}.${sig}`;
}

/** The user id a valid, unexpired token names, or null. */
export function verifyStudioToken(
  token: string | null | undefined,
  secret: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY,
  now = Date.now()
): string | null {
  if (!token) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  let expected: Buffer;
  try {
    expected = createHmac("sha256", tokenKey(secret)).update(body).digest();
  } catch {
    return null;
  }
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { u?: unknown; e?: unknown };
    if (typeof p.u !== "string" || !p.u || typeof p.e !== "number") return null;
    if (p.e * 1000 <= now) return null;
    return p.u;
  } catch {
    return null;
  }
}

export function bearerToken(request: Request): string | null {
  const h = request.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(\S+)$/i.exec(h);
  return m ? m[1] : null;
}
