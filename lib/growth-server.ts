import "server-only";

import { createClient } from "@/lib/supabase/server";

/** One week (Monday start, Pacific time) from public.growth_admin_weekly, scripts/029_create_growth_weekly.sql. */
export interface GrowthWeek {
  /** Monday, YYYY-MM-DD, Pacific time. */
  week: string;
  signups: number;
  granted: number;
  new_tool_users: number;
  active_tool_users: number;
  returning_tool_users: number;
  credits_used: number;
  ran_low: number;
  payments: number;
  buyers: number;
  first_buyers: number;
  repeat_payments: number;
  repeat_buyers: number;
  revenue: number;
  revenue_credits: number;
  revenue_licences: number;
  revenue_auto: number;
  revenue_repeat: number;
  cohort_paid: number;
  cohort_paid_14d: number;
}

/**
 * Runs as the signed-in person, like the credit analytics: the function re-checks is_admin(),
 * so a non-admin gets 42501 rather than the figures.
 */
export async function getGrowthWeeks(weeks = 12): Promise<GrowthWeek[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("growth_admin_weekly", { p_weeks: weeks });
  if (error) throw new Error(`growth_admin_weekly failed: ${error.message}`);
  return ((data ?? []) as GrowthWeek[]).map((w) => {
    const out = { ...w };
    for (const k of Object.keys(out) as (keyof GrowthWeek)[]) {
      if (k !== "week") (out[k] as number) = Number(out[k]) || 0;
    }
    return out;
  });
}
