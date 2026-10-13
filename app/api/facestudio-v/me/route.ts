import { getCreditAccount } from "@/lib/credits-server";
import { provisionCredits } from "@/lib/facestudio-gate";
import { reconcileOpenHolds } from "@/lib/facestudio-v-server";
import { facestudioVIsOpen } from "@/lib/facestudio-v";
import { authenticate, preflight, reply } from "../_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export function OPTIONS(request: Request) {
  return preflight(request);
}

/** GET /api/facestudio-v/me -> { available, open } : what the studio page shows before it asks for a price. */
export async function GET(request: Request) {
  const auth = authenticate(request);
  if ("response" in auth) return auth.response;
  try {
    await reconcileOpenHolds(auth.userId);
    await provisionCredits(auth.userId);
    const account = await getCreditAccount(auth.userId);
    return reply(request, { available: account.available, open: facestudioVIsOpen() });
  } catch (err: unknown) {
    console.error("[facestudio-v] me failed:", err instanceof Error ? err.message : err);
    return reply(request, { error: "Could not read your balance." }, 500);
  }
}
