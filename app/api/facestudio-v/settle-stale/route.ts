import { NextResponse } from "next/server";
import { releaseExpiredHolds } from "@/lib/credits-server";
import { settleStaleHolds } from "@/lib/facestudio-v-server";
import { settleStaleHolds as settleStaleHeadswapHolds } from "@/lib/headswap-pro-server";
import { settleStaleEdits } from "@/lib/imageedit-server";
import { partnerAllowed, runSweep, settledOrThrow } from "@/lib/settle-sweep";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** Time the steps may take in all; under maxDuration, so the answer always gets out. */
const BUDGET_MS = 45_000;

const NO_STORE = { "cache-control": "private, no-store" };

/**
 * POST /api/facestudio-v/settle-stale   (header X-Studio-Partner: the partner secret)
 *
 * Charge or return the reservations whose page was closed before the end, for Video FaceSwap,
 * HeadSwap Pro and SpotEdit, then return those past their time. The same steps that run when
 * somebody starts a paid video (/api/facestudio-v/hold), on a clock: the studio calls this every
 * few minutes, so a video made for someone who closed the tab is charged within minutes instead of
 * whenever the next paid video happens (lib/settle-sweep.ts). Answers counts only.
 *
 * Only the studio calls it, with the secret both already share (it is what this site sends the
 * studio as X-Studio-Partner). Every step is safe to repeat and to run beside the page's own
 * settle: the credit functions lock the reservation and change only an open one.
 */
export async function POST(request: Request) {
  const secret = process.env.STUDIO_PARTNER_SECRET;
  if (!secret?.trim()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503, headers: NO_STORE });
  }
  if (!partnerAllowed(request.headers.get("x-studio-partner"), secret)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401, headers: NO_STORE });
  }
  const result = await runSweep(
    {
      settleVideo: () => settledOrThrow((report) => settleStaleHolds(25, report)),
      settleHeadswap: () => settledOrThrow((report) => settleStaleHeadswapHolds(10, report)),
      settleEdits: () => settleStaleEdits(10),
      releaseExpired: () => releaseExpiredHolds(20),
    },
    BUDGET_MS
  );
  if (result.held_back) console.warn("[settle-stale] expiry sweep held back:", result.held_back);
  return NextResponse.json(result, { headers: NO_STORE });
}
