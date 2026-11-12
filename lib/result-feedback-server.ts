import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasEverPurchased } from "@/lib/credits-server";
import { FACESTUDIO_SERVICE } from "@/lib/facestudio";
import { FACESTUDIO_V_SERVICE } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_SERVICE } from "@/lib/headswap-pro";
import { IMAGEEDIT_SERVICE } from "@/lib/imageedit";

/**
 * "How was this result?" under every finished result (public/result-feedback.js), stored per job in
 * public.result_feedback (scripts/026). A rating is only taken for a job this account reserved credits for,
 * so it always names one product, mode and job, and nobody can fill the table with someone else's jobs.
 */

export const FEEDBACK_SERVICES: readonly string[] = [FACESTUDIO_SERVICE, HEADSWAP_PRO_SERVICE, IMAGEEDIT_SERVICE, FACESTUDIO_V_SERVICE];

/** The reason codes the widget offers. Anything else is dropped, so the table stays countable. */
export const FEEDBACK_REASONS: readonly string[] = [
  "face", // doesn't look like the person
  "unnatural", // looks fake or unnatural
  "artifacts", // glitches, blur or seams
  "flicker", // video: flickers or jumps
  "wrong_area", // edit: changed the wrong part / not what was asked
  "watermark",
  "too_short", // video: the free length
  "too_slow",
  "price",
  "just_trying",
  "nothing", // good: nothing to change
];

export type FeedbackInput = {
  service?: unknown;
  job?: unknown;
  rating?: unknown;
  reasons?: unknown;
  note?: unknown;
  detail?: unknown;
};

export type FeedbackResult = { ok: true } | { ok: false; status: number; error: string };

function cleanDetail(raw: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>).slice(0, 16)) {
    if (!/^[a-z_]{1,32}$/.test(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 80);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
  }
  return out;
}

function modeOf(service: string, estimate: Record<string, unknown>): string {
  const m = estimate.mode ?? estimate.tool ?? estimate.model;
  return typeof m === "string" && m ? m.slice(0, 40) : service;
}

export async function saveResultFeedback(userId: string, input: FeedbackInput): Promise<FeedbackResult> {
  const service = typeof input.service === "string" ? input.service : "";
  const job = typeof input.job === "string" ? input.job : "";
  const rating = input.rating === "good" || input.rating === "bad" ? input.rating : null;
  if (!FEEDBACK_SERVICES.includes(service)) return { ok: false, status: 400, error: "Unknown service." };
  if (!/^[A-Za-z0-9_-]{6,100}$/.test(job)) return { ok: false, status: 400, error: "job is required." };
  if (!rating) return { ok: false, status: 400, error: "rating must be good or bad." };

  const reasons = Array.isArray(input.reasons)
    ? [...new Set(input.reasons.filter((r): r is string => typeof r === "string" && FEEDBACK_REASONS.includes(r)))]
    : [];
  const note = typeof input.note === "string" && input.note.trim() ? input.note.trim().slice(0, 1000) : null;

  const supabase = createAdminClient();
  const { data: hold, error } = await supabase
    .from("credit_holds")
    .select("id, estimate")
    .eq("user_id", userId)
    .eq("service", service)
    .eq("job_ref", job)
    .maybeSingle();
  if (error) throw new Error(`Failed to read hold: ${error.message}`);
  if (!hold) return { ok: false, status: 404, error: "That job is not yours or does not exist." };

  const estimate = (hold.estimate && typeof hold.estimate === "object" ? hold.estimate : {}) as Record<string, unknown>;
  let paid = false;
  try {
    paid = await hasEverPurchased(userId);
  } catch {
    /* recorded as free; the rating matters more than this flag */
  }

  const { error: upsertError } = await supabase.from("result_feedback").upsert(
    {
      hold_id: hold.id,
      user_id: userId,
      service,
      mode: modeOf(service, estimate),
      job_ref: job,
      rating,
      reasons,
      note,
      paid,
      estimate,
      detail: cleanDetail(input.detail),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "hold_id" }
  );
  if (upsertError) throw new Error(`Failed to save feedback: ${upsertError.message}`);
  return { ok: true };
}
