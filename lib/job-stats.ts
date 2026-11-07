import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { FACE_STUDIO_NAME } from "@/lib/face-studio-facts";
import { FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { IMAGEEDIT_NAME } from "@/lib/imageedit";

/**
 * Public, aggregate job figures for /data/face-swap-stats, read from the credit holds every paid job
 * goes through: a hold is opened when a job starts, captured when it delivers, released when it
 * fails, and expires when nothing came back. Only counts and durations leave this file: no account,
 * no file, no prompt. The team's admin accounts are left out.
 *
 * The duration is from the hold to the capture, so it includes any queue. It is what a person waits,
 * not GPU time.
 */

export const JOB_STATS_WINDOW_DAYS = 30;
/** A tool with fewer jobs in the window than this is not reported: its percentages would mislead. */
export const JOB_STATS_MIN_JOBS = 50;

const SERVICES: ReadonlyArray<{ service: string; name: string; href: string; kind: string }> = [
  { service: "facestudio-v", name: FACESTUDIO_V_NAME, href: "/facestudio-v", kind: "Video face swap and head swap" },
  { service: "headswap-pro", name: HEADSWAP_PRO_NAME, href: "/headswap-pro", kind: "Photo head swap" },
  { service: "facestudio", name: FACE_STUDIO_NAME, href: "/face-studio", kind: "Photo face swap" },
  { service: "imageedit", name: IMAGEEDIT_NAME, href: "/image-edit", kind: "Photo editing" },
];

export interface ServiceStats {
  service: string;
  name: string;
  href: string;
  kind: string;
  started: number;
  delivered: number;
  /** Delivered as a share of jobs that have ended (still-open jobs are left out), 0 to 1. */
  deliveredShare: number | null;
  people: number;
  medianSeconds: number | null;
  p90Seconds: number | null;
}

export interface JobStats {
  from: string;
  to: string;
  services: ServiceStats[];
  totalDelivered: number;
  totalPeople: number;
}

interface HoldRow {
  service: string;
  status: string;
  user_id: string;
  created_at: string;
  settled_at: string | null;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return Math.round(sorted[index]);
}

export async function getJobStats(): Promise<JobStats> {
  const admin = createAdminClient();
  const to = new Date();
  const from = new Date(to.getTime() - JOB_STATS_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const { data: admins, error: adminError } = await admin.from("profiles").select("id").eq("role", "admin");
  if (adminError) throw new Error(`Failed to read admin accounts: ${adminError.message}`);
  const excluded = new Set((admins ?? []).map((a) => a.id as string));

  // Paged: PostgREST returns at most 1,000 rows per request.
  const rows: HoldRow[] = [];
  const page = 1000;
  for (let offset = 0; offset < 100_000; offset += page) {
    const { data, error } = await admin
      .from("credit_holds")
      .select("service, status, user_id, created_at, settled_at")
      .gte("created_at", from.toISOString())
      .order("created_at", { ascending: true })
      .range(offset, offset + page - 1);
    if (error) throw new Error(`Failed to read jobs: ${error.message}`);
    rows.push(...((data ?? []) as HoldRow[]));
    if (!data || data.length < page) break;
  }

  const kept = rows.filter((r) => !excluded.has(r.user_id));
  const services = SERVICES.map((s) => {
    const mine = kept.filter((r) => r.service === s.service);
    const delivered = mine.filter((r) => r.status === "captured");
    const ended = mine.filter((r) => r.status !== "open");
    const seconds = delivered
      .filter((r) => r.settled_at)
      .map((r) => (Date.parse(r.settled_at as string) - Date.parse(r.created_at)) / 1000)
      .filter((x) => x >= 0)
      .sort((a, b) => a - b);
    return {
      ...s,
      started: mine.length,
      delivered: delivered.length,
      deliveredShare: ended.length > 0 ? delivered.length / ended.length : null,
      people: new Set(mine.map((r) => r.user_id)).size,
      medianSeconds: percentile(seconds, 0.5),
      p90Seconds: percentile(seconds, 0.9),
    };
  }).filter((s) => s.started >= JOB_STATS_MIN_JOBS);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    services,
    totalDelivered: services.reduce((sum, s) => sum + s.delivered, 0),
    totalPeople: new Set(kept.filter((r) => services.some((s) => s.service === r.service)).map((r) => r.user_id)).size,
  };
}
