import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCreditLedger } from "@/lib/credits-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/credits/ledger?limit=25&before=<id>
 *
 * The signed-in user's own statement, newest first. `before` takes the
 * smallest id from the previous page, so paging stays stable while new
 * entries are being appended above it.
 *
 * The user id comes from the session and is never read from the query, so
 * there is no id a caller could substitute to read someone else's ledger.
 */
export async function GET(req: NextRequest) {
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

  const params = new URL(req.url).searchParams;
  const rawLimit = Number.parseInt(params.get("limit") ?? "", 10);
  const rawBefore = Number.parseInt(params.get("before") ?? "", 10);

  try {
    const entries = await listCreditLedger({
      userId: user.id,
      limit: Number.isFinite(rawLimit) ? rawLimit : undefined,
      before: Number.isFinite(rawBefore) ? rawBefore : undefined,
    });

    return NextResponse.json({
      entries,
      next_before: entries.length > 0 ? entries[entries.length - 1].id : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[credits] ledger read failed:", message);
    return NextResponse.json(
      { error: "Could not read your credit statement" },
      { status: 500 }
    );
  }
}
