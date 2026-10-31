import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The signed "has this person ever topped up" token the studio asks for.
 * The studio has no accounts: it puts a moving NanoPocket mark on every video
 * unless this token, made here and checked with the secret both sides share,
 * says the person has bought credits. Pure (no database, no network).
 *
 *   token = base64url({"p":1|0,"e":<unix seconds>,"n":"<random>","a":"<account>"}) + "." + hex(HMAC-SHA256(secret, thatText))[:32]
 *
 * "a" names the person without saying who they are: hex(HMAC-SHA256(secret, "account:" + user id))[:24]. The
 * studio counts a person's videos by it (a few at once per account instead of one per address).
 *
 * "Bought" means a purchase. Signup credits, trials, promos and admin
 * adjustments do not count (see hasEverPurchased in credits-server.ts).
 */

/** Long enough for the page to start the video, not worth keeping. */
export const ENTITLEMENT_TTL_SECONDS = 15 * 60;

/** The opaque name of a user in the token ("a"): the studio can tell people apart but not who they are. */
export function accountOf(userId: string, secret: string): string {
  return createHmac("sha256", secret).update(`account:${userId}`).digest("hex").slice(0, 24);
}

export function signEntitlement(
  paid: boolean,
  secret: string | undefined = process.env.STUDIO_PARTNER_SECRET,
  now = Date.now(),
  userId?: string
): string | null {
  if (!secret) return null;
  const body: Record<string, unknown> = { p: paid ? 1 : 0, e: Math.floor(now / 1000) + ENTITLEMENT_TTL_SECONDS, n: randomBytes(4).toString("hex") };
  if (userId) body.a = accountOf(userId, secret);
  const raw = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", secret).update(raw).digest("hex").slice(0, 32);
  return `${raw}.${sig}`;
}

/** What the studio does with a token; here so the format can be tested end to end. */
export function readEntitlement(
  token: string | null | undefined,
  secret: string,
  now = Date.now()
): { paid: boolean; account?: string } | null {
  if (!token) return null;
  const [raw, sig, extra] = token.split(".");
  if (!raw || !sig || extra !== undefined) return null;
  const expected = createHmac("sha256", secret).update(raw).digest("hex").slice(0, 32);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const p = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as { p?: unknown; e?: unknown; a?: unknown };
    if (typeof p.e !== "number" || p.e * 1000 <= now) return null;
    return typeof p.a === "string" ? { paid: p.p === 1, account: p.a } : { paid: p.p === 1 };
  } catch {
    return null;
  }
}
