import { getCreditAccount, findHoldByJobRef, releaseHold } from "@/lib/credits-server";
import { settleHold } from "@/lib/facestudio-v-server";
import { FACESTUDIO_V_SERVICE } from "@/lib/facestudio-v";
import { authenticate, holdOf, preflight, readJson, reply } from "../_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export function OPTIONS(request: Request) {
  return preflight(request);
}

/**
 * POST /api/facestudio-v/settle  { job } or { hold_id }
 *   -> { status: "settled" | "refunded" | "held" | "closed", charged?, available }
 *
 * Charge or release a reservation. The page does not get to say how it went:
 * this asks the studio for the job's billing status and acts on that. With a
 * hold_id and no job (the page could not start the job) the reservation is
 * simply released.
 */
export async function POST(request: Request) {
  const auth = authenticate(request);
  if ("response" in auth) return auth.response;

  const body = await readJson(request);
  const job = typeof body?.job === "string" ? body.job : "";
  const holdId = typeof body?.hold_id === "string" ? body.hold_id : "";
  if (!job && !holdId) return reply(request, { error: "job or hold_id is required." }, 400);

  try {
    let hold = job ? await findHoldByJobRef(FACESTUDIO_V_SERVICE, job) : await holdOf(auth.userId, holdId);
    if (hold && hold.user_id !== auth.userId) hold = null;
    if (!hold) return reply(request, { error: "That reservation is not yours or does not exist." }, 404);

    if (!job && hold.status === "open" && !hold.job_ref) {
      await releaseHold(hold.id, "page_released_before_job");
      const a = await getCreditAccount(auth.userId);
      return reply(request, { status: "refunded", available: a.available });
    }

    const outcome = await settleHold(hold);
    const account = await getCreditAccount(auth.userId);
    if (outcome.status === "unreachable") {
      // The studio could not be asked. Keep the reservation; the next call, or the expiry sweep, settles it.
      return reply(request, { status: "held", note: outcome.message, available: account.available }, 202);
    }
    return reply(request, {
      status: outcome.status,
      charged: outcome.status === "settled" ? outcome.charged : undefined,
      available: account.available,
    });
  } catch (err: unknown) {
    console.error("[facestudio-v] settle failed:", err instanceof Error ? err.message : err);
    return reply(request, { error: "Could not settle your credits right now. They stay reserved and will be settled automatically." }, 500);
  }
}
