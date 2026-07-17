import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_DAILY_LIMIT, todayUtc } from "@/lib/demo-quota";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface UsageResponse {
  signedIn: boolean;
  limit: number;
  /** Count of image-kind opens today (Image FaceSwap Pro 2.0 + NanoFace Vivid). */
  image: number;
  /** Count of video-kind opens today (Video FaceSwap Pro). */
  video: number;
  /** UTC date (YYYY-MM-DD) the counts are for. */
  day: string;
}

/**
 * GET /api/demos/usage
 *
 * Returns the signed-in user's current daily open-count for each kind so the
 * /face-swap page can render a live "3 / 10 image · 1 / 10 video used today"
 * chip. Anonymous callers get all zeros + signedIn=false; the UI shows a
 * "sign in to see your quota" message instead of a counter.
 */
export async function GET(): Promise<NextResponse<UsageResponse>> {
  const day = todayUtc();
  const empty: UsageResponse = {
    signedIn: false,
    limit: DEMO_DAILY_LIMIT,
    image: 0,
    video: 0,
    day,
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(empty);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("demo_usage_daily")
    .select("kind, count")
    .eq("user_id", user.id)
    .eq("day", day);

  if (error) {
    console.error("[demos] Failed to read demo_usage_daily for widget:", error);
    return NextResponse.json({ ...empty, signedIn: true });
  }

  const counts: Record<"image" | "video", number> = { image: 0, video: 0 };
  for (const row of data ?? []) {
    const k = row.kind as string;
    if (k === "image" || k === "video") {
      counts[k] = row.count as number;
    }
  }

  return NextResponse.json({
    signedIn: true,
    limit: DEMO_DAILY_LIMIT,
    image: counts.image,
    video: counts.video,
    day,
  });
}
