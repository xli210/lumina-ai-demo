import { privateJson, provisionCredits } from "@/lib/facestudio-gate";
import { hasEverPurchased } from "@/lib/credits-server";
import { currentUserId, signInRequired } from "@/lib/imageedit-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/imageedit/me -> { watermark, available }
 *
 * What the page shows before anything is uploaded. Accounts that have never
 * bought credits get a marked result, and an unreadable purchase history counts
 * as never bought, the safe side to fail on.
 */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return signInRequired();

  let watermark = true;
  try {
    watermark = !(await hasEverPurchased(userId));
  } catch (err: unknown) {
    console.error("[imageedit] purchase history read failed:", err instanceof Error ? err.message : err);
  }
  try {
    const { available } = await provisionCredits(userId);
    return privateJson({ watermark, available }, 200);
  } catch (err: unknown) {
    console.error("[imageedit] balance read failed:", err instanceof Error ? err.message : err);
    return privateJson({ watermark, available: null }, 200);
  }
}
