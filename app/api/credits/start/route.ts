import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startSummary } from "@/lib/start-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/credits/start
 *
 * The signed-in user's balance, tool prices and past tools, for /start, the home page's strip and the result screens.
 * It sits under /api/credits so that middleware issues the device cookie the welcome grant needs, as for the balance.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    return NextResponse.json(await startSummary(user.id));
  } catch (err: unknown) {
    console.error("[credits] start summary failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not read your credits" }, { status: 500 });
  }
}
