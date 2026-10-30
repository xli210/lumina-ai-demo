import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateReferralCode } from "@/lib/referral-server";
import { REFERRAL_FRIEND_CREDITS, REFERRAL_REWARD_CREDITS, referralLink } from "@/lib/referral";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/referral
 *
 * The signed-in user's invite link, for the "Invite a friend" buttons beside
 * the results in the static studios (public/face-studio, public/headswap-pro).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const code = await getOrCreateReferralCode(user.id);
  if (!code) {
    return NextResponse.json({ error: "Invites are not available" }, { status: 503 });
  }
  return NextResponse.json({
    link: referralLink(code),
    reward_credits: REFERRAL_REWARD_CREDITS,
    friend_credits: REFERRAL_FRIEND_CREDITS,
  });
}
