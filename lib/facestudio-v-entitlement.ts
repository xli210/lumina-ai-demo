import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The signed "has this person ever topped up" token the studio asks for.
 * The studio has no accounts: it puts a moving NanoPocket mark on every video
 * unless this token, made here and checked with the secret both sides share,
 * says the person has bought credits. Pure (no database, no network).
 *
 *   token = base64url({"p":1|0,"e":<unix seconds>,"n":"<random>"}) + "." + hex(HMAC-SHA256(secret, thatText))[:32]
 *
 * "Bought" means a purchase. Signup credits, trials, promos and admin
 * adjustments do not count (see hasEverPurchased in credits-server.ts).
 */

/** Long enough for the page to start the video, not worth keeping. */
export const ENTITLEMENT_TTL_SECONDS = 15 * 60;

export function signEntitlement(
  paid: boolean,
  secret: string | undefined = process.env.STUDIO_PARTNER_SECRET,
  now = Date.now()
): string | null {
  if (!secret) return null;
  const raw = Buffer.from(
    JSON.stringify({ p: paid ? 1 : 0, e: Math.floor(now / 1000) + ENTITLEMENT_TTL_SECONDS, n: randomBytes(4).toString("hex") })
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(raw).digest("hex").slice(0, 32);
  return `${raw}.${sig}`;
}

/** What the studio does with a token; here so the format can be tested end to end. */
export function readEntitlement(
  token: string | null | undefined,
  secret: string,
  now = Date.now()
): { paid: boolean } | null {
  if (!token) return null;
  const [raw, sig, extra] = token.split(".");
  if (!raw || !sig || extra !== undefined) return null;
  const expected = createHmac("sha256", secret).update(raw).digest("hex").slice(0, 32);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const p = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as { p?: unknown; e?: unknown };
    if (typeof p.e !== "number" || p.e * 1000 <= now) return null;
    return { paid: p.p === 1 };
  } catch {
    return null;
  }
}
