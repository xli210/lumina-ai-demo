import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureSignupGrant } from "@/lib/credits-server";

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
    return NextResponse.json({
      balance: account.balance,
      held: account.held,
      available: account.available,
      lifetime_purchased: account.lifetime_purchased,
      lifetime_spent: account.lifetime_spent,
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
