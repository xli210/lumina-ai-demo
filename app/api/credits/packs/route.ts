import { NextResponse } from "next/server";
import {
  CREDIT_PACKS,
  baseCredits,
  bonusPercent,
  totalCredits,
} from "@/lib/credit-packs";
import { CREDITS_PER_USD } from "@/lib/credits";

export const runtime = "nodejs";

/**
 * GET /api/credits/packs
 *
 * The top-up catalog, with the credit maths already done so no client has
 * to reproduce it. Public on purpose — these are list prices, and the
 * pricing page needs them before anyone signs in.
 *
 * Checkout still resolves the pack server-side from its id alone, so a
 * client that edits these numbers changes nothing it gets charged.
 */
export function GET() {
  return NextResponse.json({
    credits_per_usd: CREDITS_PER_USD,
    packs: CREDIT_PACKS.map((pack) => ({
      id: pack.id,
      name: pack.name,
      blurb: pack.blurb,
      price_in_cents: pack.priceInCents,
      base_credits: baseCredits(pack),
      bonus_credits: pack.bonusCredits,
      bonus_percent: bonusPercent(pack),
      total_credits: totalCredits(pack),
      highlight: pack.highlight === true,
    })),
  });
}
