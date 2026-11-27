import { timingSafeEqual } from "node:crypto";

/**
 * The timed settle of reservations whose page was closed (app/api/facestudio-v/settle-stale).
 *
 * Until 2026-11-27 a reservation left open by a closed tab was settled only when somebody else
 * started a paid video (the steps ran inside /api/facestudio-v/hold): on a quiet evening a paid
 * Headswap Fast made at 19:53 UTC was not charged until about 21:50, its credits locked all that
 * time. The studio (always running) now asks for this every few minutes.
 *
 * Kept free of the database so it can be tested on its own: the route passes the real steps in.
 */

/** Is `given` (the X-Studio-Partner header) the partner secret? Never true without a secret. */
export function partnerAllowed(given: string | null | undefined, secret: string | null | undefined): boolean {
  const want = (secret ?? "").trim();
  const got = (given ?? "").trim();
  if (!want || !got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** What one stale-settle pass met: filled in by settleStaleHolds (video, HeadSwap Pro) when asked. */
export interface StaleReport {
  /** Open reservations looked at. */
  seen: number;
  /** Charged or returned. */
  settled: number;
  /** The studio or gateway did not answer about it: left open. */
  unreachable: number;
  /** Settling it threw (the database, most likely): left open. */
  failed: number;
}

export function newStaleReport(): StaleReport {
  return { seen: 0, settled: 0, unreachable: 0, failed: 0 };
}

/**
 * A settle pass as a sweep step: the report when every reservation it met was settled or is still
 * being made; an error when one could not be asked about or failed, which holds the expiry sweep back.
 */
export async function settledOrThrow(pass: (report: StaleReport) => Promise<unknown>): Promise<StaleReport> {
  const report = newStaleReport();
  await pass(report);
  if (report.unreachable || report.failed) {
    throw new Error(`${report.unreachable} not answered, ${report.failed} failed, ${report.settled} settled of ${report.seen}`);
  }
  return report;
}

export interface SweepSteps {
  /** Video FaceSwap's open reservations with a job, oldest first: charge or return each as the studio says. */
  settleVideo: () => Promise<unknown>;
  /** HeadSwap Pro's, as its gateway says. */
  settleHeadswap: () => Promise<unknown>;
  /** SpotEdit's, as its worker says. */
  settleEdits: () => Promise<unknown>;
  /** Every service's reservations past their time, returned in full. */
  releaseExpired: () => Promise<unknown>;
}

export type StepOutcome = { ok: true; value: unknown } | { ok: false; why: "timeout" | "error"; message?: string };

export interface SweepResult {
  video: StepOutcome;
  headswap: StepOutcome;
  edits: StepOutcome;
  /** null when it was not run: some settle above did not finish (see `held_back`). */
  expired: StepOutcome | null;
  held_back?: string;
  ms: number;
}

/** `p` within `ms`, as an outcome; never throws. A step cut off keeps running in the background: every step is safe to repeat. */
async function within(p: () => Promise<unknown>, ms: number): Promise<StepOutcome> {
  if (!(ms > 0)) return { ok: false, why: "timeout" };                // no time left: not started at all
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<StepOutcome>((resolve) => {
    timer = setTimeout(() => resolve({ ok: false, why: "timeout" }), Math.max(0, ms));
  });
  try {
    return await Promise.race([
      Promise.resolve()
        .then(p)
        .then(
          (value): StepOutcome => ({ ok: true, value }),
          (err: unknown): StepOutcome => ({ ok: false, why: "error", message: err instanceof Error ? err.message : String(err) })
        ),
      timeout,
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * The settles, then the expiry sweep, in `budgetMs`.
 *
 * The expiry sweep returns the credits of every reservation past its time and cannot tell a made
 * video from one that never ran, so it runs only after all three settles finished: a settle cut off
 * by the budget (a studio or a gateway that does not answer) may have left made work unsettled, and
 * the sweep would then give it away. It is not lost: the next run, or the next paid video, does it.
 */
export async function runSweep(steps: SweepSteps, budgetMs: number, now: () => number = Date.now): Promise<SweepResult> {
  const t0 = now();
  const left = () => budgetMs - (now() - t0);
  const video = await within(steps.settleVideo, left());
  const headswap = await within(steps.settleHeadswap, left());
  const edits = await within(steps.settleEdits, left());
  const unfinished = (
    [
      ["video", video],
      ["headswap", headswap],
      ["edits", edits],
    ] as const
  ).filter(([, o]) => !o.ok);
  if (unfinished.length) {
    return {
      video,
      headswap,
      edits,
      expired: null,
      held_back: "not run: " + unfinished.map(([name, o]) => `${name} ${(o as { why: string }).why}`).join(", "),
      ms: now() - t0,
    };
  }
  const expired = await within(steps.releaseExpired, left());
  return { video, headswap, edits, expired, ms: now() - t0 };
}
