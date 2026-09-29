import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEMOS,
  demoUrl,
  isInternalDemo,
  isMeteredDemo,
  isUnderMaintenance,
  type DemoId,
} from "@/lib/demos";
import {
  DEMO_DAILY_LIMIT,
  kindForDemo,
  todayUtc,
} from "@/lib/demo-quota";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KNOWN_IDS = new Set<string>(DEMOS.map((d) => d.id));

function isDemoId(v: string): v is DemoId {
  return KNOWN_IDS.has(v);
}

/**
 * GET /api/demos/open?id=<image|video|vivid>
 *
 * The single hop every "Try online" button on the site goes through, which is
 * what lets a demo be repointed without touching a page.
 *
 * Auth-gates all three, and rate-limits the free ones: a signed-in user gets
 * DEMO_DAILY_LIMIT opens per "kind" per UTC day. `image` is metered in
 * credits instead and lands on the Face Studio console; see the metered branch below.
 * The free ones 302 to their Cloudflare tunnel exactly as before.
 *
 * Failure modes (all 302 redirects — the button opened in a new tab and we
 * want the user to land on a real page, never on a JSON error):
 *   - unknown id           -> /face-swap
 *   - not signed in        -> /auth/login?next=/api/demos/open?id=X
 *   - hit daily quota      -> /demos/limit?kind=<image|video>
 *   - Supabase 5xx (both   -> tunnel URL anyway; better UX than blocking on
 *     the RPC increment)      a DB hiccup, and the next click will re-attempt
 *                             the increment. The counter is best-effort under
 *                             DB failure, hard-enforced when DB is healthy.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const raw = url.searchParams.get("id") ?? "";

  if (!isDemoId(raw)) {
    return NextResponse.redirect(`${origin}/face-swap`, { status: 302 });
  }

  const demoId = raw;
  const demo = DEMOS.find((d) => d.id === demoId)!;
  const kind = kindForDemo(demoId);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const next = `/api/demos/open?id=${demoId}`;
    return NextResponse.redirect(
      `${origin}/auth/login?next=${encodeURIComponent(next)}`,
      { status: 302 }
    );
  }

  // Knowingly offline: send the visitor to a page that says so and points
  // at what does work, rather than to an origin that will fail as a browser
  // connection error with no explanation and no way back.
  //
  // Checked before the quota so a maintenance visit never burns an open.
  if (isUnderMaintenance(demo)) {
    return NextResponse.redirect(
      `${origin}/demos/unavailable?id=${demoId}`,
      { status: 302 }
    );
  }

  // A metered demo charges per render, so it does not also consume the free
  // daily allowance — the credit balance is already the limit. This is the
  // branch Image FaceSwap Pro 2.0 takes, landing on /face-studio/launch.
  if (isMeteredDemo(demo)) {
    const target = isInternalDemo(demo)
      ? `${origin}${demo.landingPath}`
      : demoUrl(demo);
    return NextResponse.redirect(target, { status: 302 });
  }

  const admin = createAdminClient();
  const day = todayUtc();

  const { data: existing, error: readError } = await admin
    .from("demo_usage_daily")
    .select("count")
    .eq("user_id", user.id)
    .eq("kind", kind)
    .eq("day", day)
    .maybeSingle();

  if (readError) {
    console.error("[demos] Failed to read demo_usage_daily:", readError);
    // Fall through to redirect — do not block on DB failure.
    return NextResponse.redirect(demoUrl(demo), { status: 302 });
  }

  const current = existing?.count ?? 0;
  if (current >= DEMO_DAILY_LIMIT) {
    return NextResponse.redirect(
      `${origin}/demos/limit?kind=${kind}`,
      { status: 302 }
    );
  }

  const { error: rpcError } = await admin.rpc("increment_demo_usage", {
    p_user_id: user.id,
    p_kind: kind,
    p_day: day,
  });
  if (rpcError) {
    console.error("[demos] increment_demo_usage RPC failed:", rpcError);
    // Fall through: do not block a demo open on a counter hiccup. The user's
    // real quota is still enforced on the *next* click because the read
    // above will have observed the pre-increment count.
  }

  return NextResponse.redirect(demoUrl(demo), { status: 302 });
}
