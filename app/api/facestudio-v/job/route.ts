import { attachStudioJob } from "@/lib/facestudio-v-server";
import { authenticate, holdOf, preflight, readJson, reply } from "../_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export function OPTIONS(request: Request) {
  return preflight(request);
}

/**
 * POST /api/facestudio-v/job  { hold_id, job }  ->  { ok: true }
 *
 * The studio page started a job after reserving credits: tie the two together.
 * The job's price is read from the studio itself and must fit the reservation.
 */
export async function POST(request: Request) {
  const auth = authenticate(request);
  if ("response" in auth) return auth.response;

  const body = await readJson(request);
  const holdId = typeof body?.hold_id === "string" ? body.hold_id : "";
  const job = typeof body?.job === "string" ? body.job : "";
  if (!holdId || !/^[0-9a-f]{12}$/.test(job)) return reply(request, { error: "hold_id and job are required." }, 400);

  try {
    const hold = await holdOf(auth.userId, holdId);
    if (!hold) return reply(request, { error: "That reservation is not yours or does not exist." }, 404);
    const r = await attachStudioJob(hold, job);
    if (!r.ok) return reply(request, { error: r.reason }, r.status);
    return reply(request, { ok: true });
  } catch (err: unknown) {
    console.error("[facestudio-v] attach failed:", err instanceof Error ? err.message : err);
    return reply(request, { error: "Could not record the job. Your credits are still reserved and will be returned if it does not run." }, 500);
  }
}
