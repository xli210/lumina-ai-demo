import { getCreditAccount, hasEverPurchased } from "@/lib/credits-server";
import { provisionCredits } from "@/lib/facestudio-gate";
import { reconcileOpenHolds } from "@/lib/facestudio-v-server";
import { signEntitlement } from "@/lib/facestudio-v-entitlement";
import { facestudioVIsOpen } from "@/lib/facestudio-v";
import { authenticate, preflight, reply } from "../_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export function OPTIONS(request: Request) {
  return preflight(request);
}

/**
 * GET /api/facestudio-v/me -> { available, open, paid?, entitlement? } : what the studio page shows before it asks for a price.
 *
 * `paid` (has this person ever bought credits) and the signed `entitlement` saying so let the studio tell a free account
 * its shorter limits before the price, and put it behind people who paid. The studio checks the token's signature; the
 * page only uses `paid` to show the right limits. If the lookup or the secret fails both are left out: the studio then
 * does not limit the price, and the run is decided with the reservation's own token, as before.
 */
export async function GET(request: Request) {
  const auth = authenticate(request);
  if ("response" in auth) return auth.response;
  try {
    await reconcileOpenHolds(auth.userId);
    await provisionCredits(auth.userId);
    const account = await getCreditAccount(auth.userId);
    let tier: { paid?: boolean; entitlement?: string } = {};
    try {
      const paid = await hasEverPurchased(auth.userId);
      const entitlement = signEntitlement(paid);
      if (entitlement) tier = { paid, entitlement };
    } catch (err: unknown) {
      console.error("[facestudio-v] me: entitlement failed:", err instanceof Error ? err.message : err);
    }
    return reply(request, { available: account.available, open: facestudioVIsOpen(), ...tier });
  } catch (err: unknown) {
    console.error("[facestudio-v] me failed:", err instanceof Error ? err.message : err);
    return reply(request, { error: "Could not read your balance." }, 500);
  }
}
