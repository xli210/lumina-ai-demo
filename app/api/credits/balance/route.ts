import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureSignupGrant } from "@/lib/credits-server";
import { freeOutputStyle, watermarkEnabled } from "@/lib/facestudio-watermark";
import { getDailyFreeState } from "@/lib/facestudio-daily-free";
import { DAILY_FREE_RESET_LABEL, FREE_PHOTO_MAX_SIDE } from "@/lib/facestudio-daily-free-rules";
import { BLACK_FRIDAY_ENDS_LABEL } from "@/lib/black-friday";
import { FACESTUDIO_MEMBER_FACE_SWAP_CREDITS, creditsPerFaceFor, memberFaceSwapPriceOn } from "@/lib/facestudio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/credits/balance
 *
 * The signed-in user's own balance. Spend decisions must read `available`,
 * not `balance`: the difference is credits already reserved by jobs that
 * have not settled yet.
 *
 * This read also hands out the welcome grant on first sight of an account,
 * so a brand-new user's first balance is already spendable. See
 * `ensureSignupGrant` for why that lives here rather than in the signup
 * trigger.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const account = await ensureSignupGrant(user.id);
    const paid = account.lifetime_purchased > 0;
    // Today's free Face Studio face swap (display only: the render route decides).
    let dailyFree: { available: boolean; reason: string | null } | null = null;
    try {
      const st = await getDailyFreeState(user.id, paid);
      dailyFree = { available: st.available, reason: st.reason ?? null };
    } catch (err: unknown) {
      console.error("[credits] daily free read failed:", err instanceof Error ? err.message : err);
    }
    const freeRender = watermarkEnabled() && account.lifetime_purchased === 0;
    return NextResponse.json({
      balance: account.balance,
      held: account.held,
      available: account.available,
      lifetime_purchased: account.lifetime_purchased,
      lifetime_spent: account.lifetime_spent,
      // Only a hint for the Face Studio console to warn before a render. The render
      // route decides the real thing from the purchase record, never from this.
      watermark_applies: freeRender && freeOutputStyle() === "tiled",
      // Since 2026-11-25: a free render is at most `max_side` px with a small nanopocket.ai mark instead.
      free_output: freeRender && freeOutputStyle() === "badge" ? { max_side: FREE_PHOTO_MAX_SIDE } : null,
      facestudio_daily_free: dailyFree ? { ...dailyFree, resets: DAILY_FREE_RESET_LABEL } : null,
      // Face Studio's per-face prices for this account right now (Black Friday: half-price face swaps
      // once it has bought credits). Display only: the render route prices from the purchase record.
      facestudio_prices: {
        face_swap: creditsPerFaceFor("face_swap", account.lifetime_purchased > 0),
        head_swap: creditsPerFaceFor("head_swap", account.lifetime_purchased > 0),
      },
      // The members' price, while it runs: `member` is whether this account already pays it.
      facestudio_member_offer: memberFaceSwapPriceOn(true)
        ? { face_swap: FACESTUDIO_MEMBER_FACE_SWAP_CREDITS, member: account.lifetime_purchased > 0, until: BLACK_FRIDAY_ENDS_LABEL }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[credits] balance read failed:", message);
    return NextResponse.json(
      { error: "Could not read your credit balance" },
      { status: 500 }
    );
  }
}
