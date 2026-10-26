import { hasEverPurchased } from "@/lib/credits-server";
import { currentUserId, entitlementToken } from "@/lib/headswap-pro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/headswap/token -> the signed "has this person ever bought credits" token, as plain text.
 * The page sends it to the gateway as X-HS-Entitlement so a free account's result carries the
 * NanoPocket.ai mark. A visitor who is not signed in, or whose purchase history could not be read,
 * gets an empty answer, which the gateway treats as "never bought": marked, the safe side to fail on.
 */
export async function GET() {
  const headers = { "content-type": "text/plain; charset=utf-8", "cache-control": "private, no-store" };
  try {
    const userId = await currentUserId();
    if (!userId) return new Response("", { headers });
    const paid = await hasEverPurchased(userId);
    return new Response(entitlementToken(userId, paid) ?? "", { headers });
  } catch (err: unknown) {
    console.error("[headswap] token failed:", err instanceof Error ? err.message : err);
    return new Response("", { headers });
  }
}
