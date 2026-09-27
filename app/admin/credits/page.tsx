import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import {
  getCreditDaily,
  getCreditSummary,
  getCreditTopUsers,
} from "@/lib/credits-server";
import {
  fmtCredits,
  fmtPercent,
  fmtUsd,
  freeRenderShare,
  givenAwayCredits,
  liabilityRatio,
  payingConversion,
  revenuePerPayingUser,
  revenueUsd,
  unbilledRenderShare,
  type CreditDailyRow,
  type CreditSummary,
  type CreditTopUser,
} from "@/lib/credit-analytics";

/**
 * /admin/credits — where the credits went.
 *
 * Reads the aggregation RPCs from migration 012 rather than pulling the
 * ledger, so it stays fast as the ledger grows and the definition of
 * "revenue" lives in one place.
 *
 * Admin is enforced three times over: middleware on the /admin prefix, the
 * role check below, and `is_admin()` inside each RPC. The third is the one
 * that matters — it means this page cannot leak by being linked wrongly.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Credit analytics — admin",
  robots: { index: false, follow: false, nocache: true },
};

const WINDOW_DAYS = 30;

function Metric({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** A bar per day, scaled to the largest value in the window. */
function DailyBars({ rows }: { rows: CreditDailyRow[] }) {
  const peak = Math.max(1, ...rows.map((r) => Math.max(r.purchased, r.spent)));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Credits purchased
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
          Credits spent
        </span>
      </div>

      <div className="flex h-40 items-end gap-[3px]">
        {rows.map((r) => (
          <div
            key={r.day}
            className="group relative flex h-full flex-1 items-end gap-[1px]"
            title={`${r.day} — purchased ${fmtCredits(r.purchased)}, spent ${fmtCredits(r.spent)}, ${r.renders} renders`}
          >
            <div
              className="flex-1 rounded-t-sm bg-emerald-500/70"
              style={{ height: `${(r.purchased / peak) * 100}%` }}
            />
            <div
              className="flex-1 rounded-t-sm bg-primary/70"
              style={{ height: `${(r.spent / peak) * 100}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{rows[0]?.day ?? ""}</span>
        <span>peak {fmtCredits(peak)} credits/day</span>
        <span>{rows[rows.length - 1]?.day ?? ""}</span>
      </div>
    </div>
  );
}

function Breakdown({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing recorded yet.
      </p>
    );
  }
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-5 py-3 font-semibold text-foreground ${i > 0 ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-5 py-3 ${
                    ci === 0
                      ? "text-foreground"
                      : "text-right tabular-nums text-muted-foreground"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopUsers({ users }: { users: CreditTopUser[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No credit accounts yet.</p>;
  }

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-semibold text-foreground">Account</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">Spent</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">Purchased</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">Renders</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">Balance</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">Last activity</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <span className="text-foreground">
                  {u.display_name || (
                    <span className="text-muted-foreground italic">
                      deleted account
                    </span>
                  )}
                </span>
                {u.role === "admin" && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    admin
                  </span>
                )}
                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                  {u.user_id.slice(0, 8)}
                </span>
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-foreground">
                {fmtCredits(u.lifetime_spent)}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                {u.lifetime_purchased > 0
                  ? `${fmtCredits(u.lifetime_purchased)} · ${fmtUsd(u.lifetime_purchased)}`
                  : "—"}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                {u.renders}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                {fmtCredits(u.balance)}
                {u.held > 0 && (
                  <span className="text-xs"> (+{fmtCredits(u.held)} held)</span>
                )}
              </td>
              <td className="px-5 py-3 text-right text-muted-foreground">
                {u.last_activity
                  ? new Date(u.last_activity).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dashboard({
  summary,
  daily,
  users,
}: {
  summary: CreditSummary;
  daily: CreditDailyRow[];
  users: CreditTopUser[];
}) {
  const all = summary.all_time;
  const win = summary.window;

  return (
    <div className="flex flex-col gap-12">
      <Section
        title="Money"
        note="Revenue counts purchased credits only. Bonus credits were given away, so counting them would overstate takings by the bonus rate."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Revenue, all time"
            value={fmtUsd(all.purchased)}
            sub={`${fmtCredits(all.purchased)} credits sold`}
            accent
          />
          <Metric
            label={`Revenue, last ${summary.window_days}d`}
            value={fmtUsd(win.purchased)}
            sub={`${summary.users.purchased_in_window} accounts bought`}
          />
          <Metric
            label="Per paying account"
            value={`$${revenuePerPayingUser(all, summary.users).toFixed(2)}`}
            sub={`${summary.users.ever_purchased} have ever paid`}
          />
          <Metric
            label="Paid conversion"
            value={fmtPercent(payingConversion(summary.users))}
            sub={`of ${fmtCredits(summary.users.with_account)} accounts`}
          />
        </div>
      </Section>

      <Section
        title="Consumption"
        note="One render is one spend entry. Credits spent is what the GPU actually delivered."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Credits spent, all time"
            value={fmtCredits(all.spent)}
            sub={fmtUsd(all.spent) + " of delivered value"}
          />
          <Metric
            label="Renders, all time"
            value={fmtCredits(all.renders)}
            sub={`${fmtCredits(win.renders)} in the last ${summary.window_days}d`}
          />
          <Metric
            label="Active accounts"
            value={fmtCredits(summary.users.spent_in_window)}
            sub={`spent something in ${summary.window_days}d · ${summary.users.ever_spent} ever`}
          />
          <Metric
            label="Free-funded renders"
            value={fmtPercent(freeRenderShare(summary.renders_by_funding))}
            sub={`${fmtCredits(summary.renders_by_funding.by_never_paying_user)} by accounts that never paid`}
          />
        </div>
      </Section>

      <Section
        title={`Purchased vs spent, last ${summary.window_days} days`}
        note="Credits per UTC day. Empty days are shown as gaps rather than skipped, so a quiet week looks quiet."
      >
        <DailyBars rows={daily} />
      </Section>

      <Section
        title="The free tier's cost"
        note="Credits handed out for nothing: the daily allowance, welcome grants, and pack bonuses. Expressed in the same unit as revenue, which is the comparison worth having."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Given away, all time"
            value={fmtCredits(givenAwayCredits(all))}
            sub={`${fmtUsd(givenAwayCredits(all))} at list price`}
          />
          <Metric
            label="Daily allowance"
            value={fmtCredits(all.promo)}
            sub="promo grants"
          />
          <Metric
            label="Welcome grants"
            value={fmtCredits(all.signup_grant)}
            sub="one per new account"
          />
          <Metric
            label="Pack bonuses"
            value={fmtCredits(all.bonus)}
            sub="free credits bundled with purchases"
          />
        </div>
      </Section>

      <Section
        title="Outstanding liability"
        note="Unspent credits are a delivery obligation: cash already taken against GPU time not yet spent. A ratio above 1 is normal while the free allowance dominates — that is the free tier appearing as a liability."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Credits outstanding"
            value={fmtCredits(summary.outstanding.balance)}
            sub={`across ${fmtCredits(summary.outstanding.accounts)} accounts`}
          />
          <Metric
            label="Currently reserved"
            value={fmtCredits(summary.outstanding.held)}
            sub="held by renders in flight"
          />
          <Metric
            label="Liability / revenue"
            value={
              all.purchased > 0
                ? liabilityRatio(summary.outstanding, all).toFixed(2) + "×"
                : "—"
            }
            sub="outstanding credits per credit sold"
          />
          <Metric
            label="Reversed by refund"
            value={fmtCredits(all.reversed)}
            sub="clawed back after a Stripe refund or dispute"
          />
        </div>
      </Section>

      <Section
        title="Render outcomes"
        note="Released means the render failed; expired means the client abandoned it. Both are refunded in full, so neither costs the user anything — but both cost us GPU time, which makes a rising share the earliest signal the pipeline is degrading."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Charged"
            value={fmtCredits(summary.holds.captured)}
            sub="reservations settled with a charge"
          />
          <Metric
            label="Refunded, failed"
            value={fmtCredits(summary.holds.released)}
          />
          <Metric
            label="Refunded, abandoned"
            value={fmtCredits(summary.holds.expired)}
            sub="swept after the reservation TTL"
          />
          <Metric
            label="Unbilled share"
            value={fmtPercent(unbilledRenderShare(summary.holds))}
            sub={`${summary.holds.open} still open`}
          />
        </div>
      </Section>

      <div className="grid gap-10 lg:grid-cols-2">
        <Section title="By service">
          <Breakdown
            headers={["Service", "Renders", "Credits", "Value"]}
            rows={summary.by_service.map((s) => [
              s.service,
              fmtCredits(s.renders),
              fmtCredits(s.credits),
              fmtUsd(s.credits),
            ])}
          />
        </Section>

        <Section title="By mode">
          <Breakdown
            headers={["Mode", "Jobs", "Credits reserved"]}
            rows={summary.by_mode.map((m) => [
              m.mode,
              fmtCredits(m.jobs),
              fmtCredits(m.credits_reserved),
            ])}
          />
        </Section>
      </div>

      <Section
        title="Pack mix"
        note="Which credit packs actually sell. Orders, not revenue, is what tells you whether the tier ladder is shaped right."
      >
        <Breakdown
          headers={["Pack", "Orders", "Credits", "Revenue"]}
          rows={summary.by_pack.map((p) => [
            p.pack_id,
            fmtCredits(p.orders),
            fmtCredits(p.credits),
            fmtUsd(p.credits),
          ])}
        />
      </Section>

      <Section
        title="Top accounts by lifetime spend"
        note="Accounts with no display name were deleted; their ledger rows survive on purpose, because the money moved."
      >
        <TopUsers users={users} />
      </Section>

      <p className="text-xs text-muted-foreground">
        Generated {new Date(summary.generated_at).toLocaleString("en-US")}. All
        figures in credits unless marked; 1 credit = $0.01.
      </p>
    </div>
  );
}

export default async function AdminCreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/credits");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/account");
  }

  let summary: CreditSummary | null = null;
  let daily: CreditDailyRow[] = [];
  let users: CreditTopUser[] = [];
  let failure: string | null = null;

  try {
    [summary, daily, users] = await Promise.all([
      getCreditSummary(WINDOW_DAYS),
      getCreditDaily(WINDOW_DAYS),
      getCreditTopUsers(),
    ]);
  } catch (err: unknown) {
    failure = err instanceof Error ? err.message : "Unknown error";
    console.error("[admin/credits] analytics failed:", failure);
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin Console
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-foreground">
            Credit analytics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Who bought credits, who spent them, and what the free tier costs.
          </p>
        </div>

        {failure !== null || summary === null ? (
          <div className="glass flex items-start gap-3 rounded-2xl p-6">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">
                Could not load analytics
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {failure ?? "No data returned."}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                If this mentions a missing function, run{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  scripts/012_create_credit_analytics.sql
                </code>{" "}
                in the Supabase SQL editor.
              </p>
            </div>
          </div>
        ) : (
          <Dashboard summary={summary} daily={daily} users={users} />
        )}
      </div>
      <Footer />
    </main>
  );
}
