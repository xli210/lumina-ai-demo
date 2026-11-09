import { NextRequest } from "next/server";

import { privateJson } from "@/lib/facestudio-gate";
import { getCreditAccount } from "@/lib/credits-server";
import { readEdit, requireEditOwner, settleEdit } from "@/lib/imageedit-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/imageedit/jobs/{jobId} -> the page's job view (+ available)
 *
 * Polled every two seconds, and read again when someone comes back from
 * "My images". Where the reservation is settled: charged when the edit lands,
 * returned in full when it fails or is cancelled. Both are keyed on the hold,
 * so polling a finished job again changes nothing.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { jobId } = await ctx.params;
  const gate = await requireEditOwner(jobId);
  if (!gate.ok) return gate.response;
  const { userId, hold } = gate;

  const reading = await readEdit(hold);
  // Not terminal: a blip must not settle the hold.
  if (!reading) return privateJson({ detail: "Could not reach the editing service. Retrying." }, 502);

  const { job, terminal } = reading;
  await settleEdit(hold, reading);

  if (!terminal) return privateJson(job, 200);
  const account = await getCreditAccount(userId);
  return privateJson({ ...job, available: account.available }, 200);
}
