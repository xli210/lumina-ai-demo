import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { getGrowthWeeks, type GrowthWeek } from "@/lib/growth-server";

/**
 * /admin/growth — one row per week from a new account to repeat money, so it is plain which step
 * moves revenue: sign-ups, first tool use, free credits running low, first payment, repeat
 * payments, and the week's revenue. Figures come from public.growth_admin_weekly
 * (scripts/029_create_growth_weekly.sql).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Weekly growth — admin",
  robots: { index: false, follow: false, nocache: true },
};

const WEEKS = 16;
const GOAL_PER_MONTH = 10_000;
const WEEKS_PER_MONTH = 52 / 12;

function money(n: number, cents = true): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

function pct(num: number, den: number): string {
  if (den <= 0) return "-";
  const r = (num / den) * 100;
  return `${r < 10 ? r.toFixed(1) : Math.round(r)}%`;
}

function weekLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
}

/** Days from the week's Monday (Pacific) to now; only used to tell a finished week from the current one. */
function ageDays(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  // Monday 00:00 Pacific is 07:00 or 08:00 UTC; 08:00 errs on the side of calling a week unfinished.
  return (Date.now() - Date.UTC(y, m - 1, d, 8)) / 86_400_000;
}

function sum(rows: GrowthWeek[], k: keyof Omit<GrowthWeek, "week">): number {
  return rows.reduce((a, r) => a + r[k], 0);
}

function Card({ label, value, note, tone }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${tone ?? "text-foreground"}`}>{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function Num({ n, sub, dim }: { n: string | number; sub?: string; dim?: boolean }) {
  return (
    <td className={`whitespace-nowrap px-3 py-2.5 text-right tabular-nums ${dim ? "text-muted-foreground/60" : "text-foreground"}`}>
      {n}
      {sub !== undefined && <span className="ml-1 text-xs text-muted-foreground">{sub}</span>}
    </td>
  );
}

export default async function GrowthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin/growth");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/account");

  let weeks: GrowthWeek[] = [];
  let failure: string | null = null;
  try {
    weeks = await getGrowthWeeks(WEEKS);
  } catch (err: unknown) {
    failure = err instanceof Error ? err.message : "Unknown error";
    console.error("[admin/growth] failed:", failure);
  }

  const finished = weeks.filter((w) => ageDays(w.week) >= 7);
  const current = weeks.find((w) => ageDays(w.week) < 7) ?? null;
  const last = finished.at(-1) ?? null;
  const prev = finished.at(-2) ?? null;
  const last4 = finished.slice(-4);
  const prev4 = finished.slice(-8, -4);
  const runRate = (sum(last4, "revenue") / Math.max(last4.length, 1)) * WEEKS_PER_MONTH;
  const prevRunRate = (sum(prev4, "revenue") / Math.max(prev4.length, 1)) * WEEKS_PER_MONTH;
  // A cohort's 14-day figure is final once its last member has had 14 days: 21 days after its Monday.
  const mature = weeks.filter((w) => ageDays(w.week) >= 21).slice(-4);
  const conv14 = pct(sum(mature, "cohort_paid_14d"), sum(mature, "new_tool_users"));
  const repeatShare = pct(sum(last4, "revenue_repeat"), sum(last4, "revenue"));
  const weekChange = last && prev && prev.revenue > 0 ? (last.revenue - prev.revenue) / prev.revenue : null;

  const th = "px-3 py-3 text-right font-semibold text-foreground";
  const rows = [...weeks].reverse();
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin Console
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-foreground">Weekly growth</h1>
        <p className="mt-1 text-muted-foreground">
          Each week from new account to repeat payment, so it is plain which step moves revenue. Weeks start on Monday, Pacific time.
        </p>

        {failure !== null ? (
          <div className="glass mt-8 flex items-start gap-3 rounded-2xl p-6">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Could not load the figures</p>
              <p className="mt-1 text-sm text-muted-foreground">{failure}</p>
              <p className="mt-1 text-sm text-muted-foreground">If the function is missing, apply scripts/029_create_growth_weekly.sql.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card
                label={last ? `Revenue, week of ${weekLabel(last.week)}` : "Revenue, last full week"}
                value={last ? money(last.revenue) : "-"}
                note={
                  weekChange === null
                    ? "no earlier week to compare"
                    : `${weekChange >= 0 ? "+" : ""}${Math.round(weekChange * 100)}% on the week before (${money(prev!.revenue)})`
                }
                tone={weekChange === null ? undefined : weekChange >= 0 ? "text-emerald-500" : "text-rose-500"}
              />
              <Card
                label="Monthly run rate"
                value={money(runRate, false)}
                note={`last ${last4.length} full weeks; ${money(prevRunRate, false)} the 4 before. ${runRate > 0 ? `${(GOAL_PER_MONTH / runRate).toFixed(1)}x to reach ${money(GOAL_PER_MONTH, false)}` : ""}`}
              />
              <Card
                label="New tool users who paid within 14 days"
                value={conv14}
                note={`${sum(mature, "cohort_paid_14d")} of ${sum(mature, "new_tool_users")}, the last ${mature.length} weeks whose 14 days are over`}
              />
              <Card
                label="Revenue from repeat payments"
                value={repeatShare}
                note={`${money(sum(last4, "revenue_repeat"))} of ${money(sum(last4, "revenue"))}, last ${last4.length} full weeks`}
              />
            </div>

            {current && (
              <p className="mt-4 text-sm text-muted-foreground">
                This week so far (from {weekLabel(current.week)}): <span className="text-foreground">{money(current.revenue)}</span> from{" "}
                {current.payments} payments, {current.new_tool_users} new tool users, {current.first_buyers} first-time buyers.
              </p>
            )}

            <h2 className="mb-1 mt-10 text-xl font-bold text-foreground">By week</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Newest first; the top row is the week in progress. Percentages under a step are of the step before it.
            </p>
            <div className="glass overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[1180px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-3 py-3 font-semibold text-foreground">Week of</th>
                    <th className={th}>Sign-ups</th>
                    <th className={th}>Free credits</th>
                    <th className={th}>New tool users</th>
                    <th className={th}>Ran low</th>
                    <th className={th}>Paid ≤14 d</th>
                    <th className={th}>Active users</th>
                    <th className={th}>Came back</th>
                    <th className={th}>First buyers</th>
                    <th className={th}>Repeat pays</th>
                    <th className={th}>Revenue</th>
                    <th className={th}>Repeat $</th>
                    <th className={th}>Credits $</th>
                    <th className={th}>Licences $</th>
                    <th className={th}>Auto top-up $</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((w) => {
                    const age = ageDays(w.week);
                    const cohortOpen = age < 21;
                    return (
                      <tr key={w.week} className={`border-b border-border last:border-0 ${age < 7 ? "bg-muted/30" : ""}`}>
                        <td className="whitespace-nowrap px-3 py-2.5 text-foreground">
                          {weekLabel(w.week)}
                          {age < 7 && <span className="ml-1.5 text-xs text-muted-foreground">so far</span>}
                        </td>
                        <Num n={w.signups} />
                        <Num n={w.granted} sub={pct(w.granted, w.signups)} />
                        <Num n={w.new_tool_users} sub={pct(w.new_tool_users, w.granted)} />
                        <Num n={w.ran_low} />
                        <Num
                          n={w.cohort_paid_14d}
                          sub={`${pct(w.cohort_paid_14d, w.new_tool_users)}${cohortOpen ? "…" : ""}`}
                          dim={cohortOpen}
                        />
                        <Num n={w.active_tool_users} />
                        <Num n={w.returning_tool_users} sub={pct(w.returning_tool_users, w.active_tool_users)} />
                        <Num n={w.first_buyers} />
                        <Num n={w.repeat_payments} sub={w.repeat_buyers > 0 ? `${w.repeat_buyers} ppl` : undefined} />
                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">{money(w.revenue)}</td>
                        <Num n={money(w.revenue_repeat)} dim={w.revenue_repeat === 0} />
                        <Num n={money(w.revenue_credits)} dim={w.revenue_credits === 0} />
                        <Num n={money(w.revenue_licences)} dim={w.revenue_licences === 0} />
                        <Num n={money(w.revenue_auto)} dim={w.revenue_auto === 0} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-1.5 text-xs text-muted-foreground">
              <p>
                <span className="text-foreground">Sign-ups</span> are new accounts, including ones refused free credits (temporary mail, a second claim from one device).{" "}
                <span className="text-foreground">Free credits</span> are accounts that got the sign-up grant.{" "}
                <span className="text-foreground">New tool users</span> had their first delivered online render that week (desktop apps are not counted).
              </p>
              <p>
                <span className="text-foreground">Ran low</span>: accounts that had never paid and whose balance first fell to 20 credits or fewer that week.{" "}
                <span className="text-foreground">Paid ≤14 d</span>: of that week&apos;s new tool users, how many paid within 14 days of their first render; greyed with &ldquo;…&rdquo; until all of them have had 14 days.
              </p>
              <p>
                <span className="text-foreground">Active users</span> had a delivered render that week; <span className="text-foreground">came back</span> are those whose first render was in an earlier week.{" "}
                <span className="text-foreground">First buyers</span> paid for the first time; <span className="text-foreground">repeat pays</span> are payments from people who had paid before (credits, licences and auto top-ups alike).
              </p>
              <p>
                Revenue is what Stripe took (paid checkouts, video studio included, and auto top-ups) before Stripe&apos;s fees, with refunds not subtracted. Admin accounts and the owner&apos;s test accounts and purchases are left out. Generated{" "}
                {new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} Pacific.
              </p>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
