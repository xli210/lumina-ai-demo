import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { getHolds } from "@/lib/reliability-server";
import {
  REASON_LABELS,
  WINDOWS,
  classify,
  decided,
  errorRate,
  fmtRate,
  modeOf,
  parseWindow,
  releaseReason,
  successRate,
  summarise,
  SERVICE_LABELS,
  type Group,
  type HoldRow,
  type Tally,
  type WindowKey,
} from "@/lib/reliability";

/**
 * /admin/reliability — how each hosted service is doing, by mode.
 *
 * Built from the credit holds: every render reserves credits and then captures them (it
 * was delivered) or releases them (it was not), so the table already records the service,
 * the mode and the outcome of every attempt.
 *
 * Success rate = delivered / (delivered + our failures). Renders the person cancelled or
 * walked away from, and ones nobody settled, are shown but left out of the rate: they say
 * nothing about whether the service works.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Service reliability — admin",
  robots: { index: false, follow: false, nocache: true },
};

function rateTone(r: number | null): string {
  if (r === null) return "text-muted-foreground";
  if (r >= 0.97) return "text-emerald-500";
  if (r >= 0.9) return "text-amber-500";
  return "text-rose-500";
}

function Cell({ n, dim }: { n: number; dim?: boolean }) {
  return <td className={`px-4 py-3 text-right tabular-nums ${dim && n === 0 ? "text-muted-foreground/50" : "text-foreground"}`}>{n}</td>;
}

function Row({ g }: { g: Group }) {
  const t = g.tally;
  const sr = successRate(t);
  const er = errorRate(t);
  const total = g.mode === null;
  return (
    <tr className={`border-b border-border last:border-0 ${total ? "bg-muted/30" : ""}`}>
      <td className="px-4 py-3">
        {total ? (
          <span className="font-semibold text-foreground">{g.label}</span>
        ) : (
          <span className="pl-4 text-muted-foreground">↳ {g.mode}</span>
        )}
      </td>
      <Cell n={t.total} />
      <Cell n={t.success} />
      <Cell n={t.system_failure} dim />
      <Cell n={t.cancelled} dim />
      <Cell n={t.expired} dim />
      <Cell n={t.in_flight} dim />
      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${rateTone(sr)}`}>{fmtRate(sr)}</td>
      <td className={`px-4 py-3 text-right tabular-nums ${er !== null && er > 0.03 ? "text-rose-500" : "text-muted-foreground"}`}>{fmtRate(er)}</td>
    </tr>
  );
}

function Failures({ rows }: { rows: HoldRow[] }) {
  const failed = rows.filter((h) => classify(h) === "system_failure").slice(0, 10);
  if (failed.length === 0) {
    return <p className="text-sm text-muted-foreground">No failed renders in this window.</p>;
  }
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 font-semibold text-foreground">When (UTC)</th>
            <th className="px-4 py-3 font-semibold text-foreground">Service</th>
            <th className="px-4 py-3 font-semibold text-foreground">Mode</th>
            <th className="px-4 py-3 font-semibold text-foreground">Why</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">Credits returned</th>
            <th className="px-4 py-3 font-semibold text-foreground">Account</th>
          </tr>
        </thead>
        <tbody>
          {failed.map((h) => {
            const r = releaseReason(h);
            return (
              <tr key={h.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                  {new Date(h.created_at).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                </td>
                <td className="px-4 py-3 text-foreground">{SERVICE_LABELS[h.service] ?? h.service}</td>
                <td className="px-4 py-3 text-muted-foreground">{modeOf(h)}</td>
                <td className="px-4 py-3 text-foreground">
                  {REASON_LABELS[r] ?? r}
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">{r}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{h.amount}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{h.user_id.slice(0, 8)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Reasons({ groups }: { groups: Group[] }) {
  const totals: Tally["reasons"] = {};
  for (const g of groups) {
    if (g.mode !== null) continue;
    for (const [k, v] of Object.entries(g.tally.reasons)) totals[k] = (totals[k] ?? 0) + v;
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {entries.map(([k, v]) => (
        <li key={k} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
          {REASON_LABELS[k] ?? k} <span className="font-semibold tabular-nums">× {v}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ReliabilityPage({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin/reliability");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/account");

  const { w } = await searchParams;
  const win: WindowKey = parseWindow(w);

  let rows: HoldRow[] = [];
  let truncated = false;
  let failure: string | null = null;
  try {
    ({ rows, truncated } = await getHolds(win));
  } catch (err: unknown) {
    failure = err instanceof Error ? err.message : "Unknown error";
    console.error("[admin/reliability] failed:", failure);
  }

  const groups = summarise(rows);
  const overall = groups.filter((g) => g.mode === null);
  const sum = overall.reduce(
    (a, g) => ({ total: a.total + g.tally.total, success: a.success + g.tally.success, fail: a.fail + g.tally.system_failure }),
    { total: 0, success: 0, fail: 0 }
  );
  const overallRate = sum.success + sum.fail === 0 ? null : sum.success / (sum.success + sum.fail);

  const th = "px-4 py-3 text-right font-semibold text-foreground";
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin Console
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-foreground">Service reliability</h1>
        <p className="mt-1 text-muted-foreground">How many renders each service and mode ran, and how many were delivered.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(WINDOWS) as WindowKey[]).map((k) => (
            <Link
              key={k}
              href={`/admin/reliability?w=${k}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                k === win ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {WINDOWS[k].label}
            </Link>
          ))}
        </div>

        {failure !== null ? (
          <div className="glass mt-8 flex items-start gap-3 rounded-2xl p-6">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Could not load the renders</p>
              <p className="mt-1 text-sm text-muted-foreground">{failure}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="glass rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">Renders, {WINDOWS[win].label.toLowerCase()}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{sum.total}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">attempts that reserved credits</p>
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">Success rate</p>
                <p className={`mt-1 text-2xl font-bold tabular-nums ${rateTone(overallRate)}`}>{fmtRate(overallRate)}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{sum.success} delivered of {sum.success + sum.fail} that finished</p>
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">Failed on our side</p>
                <p className={`mt-1 text-2xl font-bold tabular-nums ${sum.fail > 0 ? "text-rose-500" : "text-foreground"}`}>{sum.fail}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">credits were returned automatically</p>
              </div>
            </div>

            <h2 className="mb-1 mt-10 text-xl font-bold text-foreground">By service and mode</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Success rate is delivered ÷ (delivered + failed on our side). Cancelled and expired renders are listed but left out of the rate.
            </p>
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No renders in this window.</p>
            ) : (
              <div className="glass overflow-x-auto rounded-2xl">
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 font-semibold text-foreground">Service / mode</th>
                      <th className={th}>Renders</th>
                      <th className={th}>Delivered</th>
                      <th className={th}>Failed</th>
                      <th className={th}>Cancelled</th>
                      <th className={th}>Expired</th>
                      <th className={th}>Running</th>
                      <th className={th}>Success</th>
                      <th className={th}>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => (
                      <Row key={`${g.service}-${g.mode ?? "total"}`} g={g} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {truncated && (
              <p className="mt-2 text-xs text-amber-500">This window holds more than 20,000 renders; the oldest are left out.</p>
            )}

            <h2 className="mb-3 mt-10 text-xl font-bold text-foreground">Why renders failed</h2>
            <Reasons groups={groups} />
            {overall.every((g) => decided(g.tally) === g.tally.success) && <p className="text-sm text-muted-foreground">No failures to explain.</p>}

            <h2 className="mb-3 mt-10 text-xl font-bold text-foreground">Latest failures</h2>
            <Failures rows={rows} />

            <p className="mt-10 text-xs text-muted-foreground">
              Read from the credit holds, so it covers renders that were paid for in credits. Video FaceSwap Online records its mode only on renders started after this was added; earlier ones show as &ldquo;Mode not recorded&rdquo;. An
              &ldquo;expired&rdquo; render was never settled by the page, so it may have finished or failed; it is not counted either way. Generated {new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC.
            </p>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
