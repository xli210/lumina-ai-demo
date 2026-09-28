import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CircleCheck, TriangleAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { getLicenseSummary } from "@/lib/licenses-server";
import {
  reconcileStripe,
  type ReconciledPayment,
  type StripeReconcileResult,
  type StripeReconciliation,
} from "@/lib/stripe-reconcile";
import {
  compedValueCents,
  daysLeft,
  enrichProducts,
  estimatedRevenueCents,
  fmtCount,
  fmtMoney,
  fmtShare,
  freeLicenseCount,
  orphanedProducts,
  paidShare,
  trialConversion,
  type EnrichedProductRow,
  type LicenseSummary,
} from "@/lib/license-analytics";

/**
 * /admin/licenses — which licenses are actually sales.
 *
 * The licenses tab on /admin lists rows; it cannot tell you which ones were
 * bought. This page splits them by origin, joins each product to its
 * catalogue price, and says plainly when the paid count is zero — because a
 * dashboard that renders an empty revenue table without comment reads like a
 * loading bug rather than a finding.
 *
 * Admin is enforced three times over: middleware on the /admin prefix, the
 * role check below, and `is_admin()` inside the RPC.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "License analytics — admin",
  robots: { index: false, follow: false, nocache: true },
};

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

function Pill({
  tone,
  children,
}: {
  tone: "paid" | "trial" | "expired" | "free" | "comped" | "warn";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    trial: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    expired: "bg-muted text-muted-foreground",
    free: "bg-muted text-muted-foreground",
    comped: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    warn: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * The headline, driven by Stripe rather than by the licenses table.
 *
 * The distinction matters: an empty `stripe_payment_intent_id` column means
 * the webhook never wrote a license, which is consistent both with "nobody
 * bought anything" and with "people bought things and received nothing".
 * Only Stripe can tell those apart, so this never claims there were no sales
 * unless Stripe itself says so.
 */
function Reconciliation({ recon }: { recon: StripeReconcileResult }) {
  if (!recon.configured) {
    return (
      <div className="glass flex items-start gap-3 rounded-2xl p-6">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="space-y-2 text-sm">
          <p className="text-base font-semibold text-foreground">
            Payments could not be read from Stripe
          </p>
          <p className="text-muted-foreground">{recon.reason}</p>
          <p className="text-muted-foreground">
            Everything below is counted from the licenses table alone. That
            table only records a payment if the Stripe webhook succeeded, so
            a zero here is <em>not</em> evidence that nothing was sold.
          </p>
        </div>
      </div>
    );
  }

  const paid = recon.succeeded.length;
  const missing = recon.undelivered.length;

  if (paid === 0) {
    return (
      <div className="glass flex items-start gap-3 rounded-2xl p-6">
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="space-y-2 text-sm">
          <p className="text-base font-semibold text-foreground">
            No succeeded payments in Stripe
          </p>
          <p className="text-muted-foreground">
            Checked the {recon.mode} account. Nothing has been collected, so
            the empty paid column below is accurate rather than a delivery
            failure.
          </p>
        </div>
      </div>
    );
  }

  if (missing === 0) {
    return (
      <div className="glass flex items-start gap-3 rounded-2xl border border-emerald-500/30 p-6">
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        <div className="space-y-2 text-sm">
          <p className="text-base font-semibold text-foreground">
            All {fmtCount(paid)} Stripe payments have a license
          </p>
          <p className="text-muted-foreground">
            {fmtMoney(recon.gross_amount)} collected in the {recon.mode}{" "}
            account, every payment matched to a license key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass flex items-start gap-3 rounded-2xl border border-red-500/40 p-6">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div className="space-y-3 text-sm">
        <p className="text-base font-semibold text-foreground">
          {fmtCount(missing)} paid customer{missing === 1 ? "" : "s"} never
          received a license
        </p>
        <p className="text-muted-foreground">
          Stripe collected {fmtCount(paid)} payment
          {paid === 1 ? "" : "s"} totalling {fmtMoney(recon.gross_amount)} in
          the {recon.mode} account, but only {fmtCount(paid - missing)} produced
          a license row. The webhook writes{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            stripe_payment_intent_id
          </code>{" "}
          and is the only thing that does, so a missing one means the delivery
          never reached the app.
        </p>
        {recon.events_recorded === 0 && (
          <p className="text-muted-foreground">
            The{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              stripe_events
            </code>{" "}
            table has no rows at all, which means this app has not processed a
            single webhook delivery. That points at the endpoint itself rather
            than at individual failures.
          </p>
        )}
        <p className="text-muted-foreground">
          Each of these is recoverable: in Stripe, open Developers → Webhooks →
          the endpoint, find the failed{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            checkout.session.completed
          </code>{" "}
          deliveries and resend them. The handler is idempotent, so resending
          is safe.
        </p>
      </div>
    </div>
  );
}

/** Stripe payments that produced nothing. The most urgent table on the page. */
function UndeliveredTable({ rows }: { rows: ReconciledPayment[] }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl border border-red-500/30">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-semibold text-foreground">Customer</th>
            <th className="px-5 py-3 font-semibold text-foreground">Product</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Paid
            </th>
            <th className="px-5 py-3 font-semibold text-foreground">
              Payment intent
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              When
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.payment_intent_id}
              className="border-b border-border last:border-0"
            >
              <td className="px-5 py-3 text-foreground">
                {p.email ?? (
                  <span className="italic text-muted-foreground">
                    no email on file
                  </span>
                )}
                {p.supabase_user_id && (
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                    {p.supabase_user_id.slice(0, 8)}
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-muted-foreground">
                {p.product_id ?? "—"}
              </td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums text-foreground">
                {fmtMoney(p.amount)}
              </td>
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                {p.payment_intent_id}
              </td>
              <td className="px-5 py-3 text-right text-muted-foreground">
                {new Date(p.created).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WebhookHealth({ recon }: { recon: StripeReconciliation }) {
  if (recon.webhooks.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 text-sm">
        <p className="text-foreground">No webhook endpoint is registered.</p>
        <p className="mt-1 text-muted-foreground">
          Either the key cannot list endpoints, or Stripe has nowhere to
          deliver <code className="text-xs">checkout.session.completed</code> —
          in which case no purchase can ever produce a license.
        </p>
      </div>
    );
  }

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-semibold text-foreground">Endpoint</th>
            <th className="px-5 py-3 font-semibold text-foreground">Status</th>
            <th className="px-5 py-3 font-semibold text-foreground">
              Listens for checkout
            </th>
          </tr>
        </thead>
        <tbody>
          {recon.webhooks.map((w) => (
            <tr key={w.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                {w.url}
              </td>
              <td className="px-5 py-3">
                {w.status === "enabled" ? (
                  <Pill tone="paid">enabled</Pill>
                ) : (
                  <Pill tone="warn">{w.status}</Pill>
                )}
              </td>
              <td className="px-5 py-3">
                {w.listens_for_checkout ? (
                  <Pill tone="paid">yes</Pill>
                ) : (
                  <Pill tone="warn">no — licenses cannot be issued</Pill>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductTable({ rows }: { rows: EnrichedProductRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No licenses issued.</p>;
  }

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-semibold text-foreground">Product</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Paid
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Revenue
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Trial, active
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Trial, expired
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Comped
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Free claims
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.product_id}
              className="border-b border-border last:border-0"
            >
              <td className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-foreground">{r.name}</span>
                  {r.orphaned && <Pill tone="warn">not in catalogue</Pill>}
                  {r.priceInCents === 0 && !r.orphaned && (
                    <Pill tone="free">free</Pill>
                  )}
                </div>
                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                  {r.product_id}
                  {r.priceInCents > 0 && ` · ${fmtMoney(r.priceInCents)}`}
                </span>
              </td>
              <td className="px-5 py-3 text-right tabular-nums">
                {r.paid > 0 ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {fmtCount(r.paid)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                {r.estimated_revenue_cents > 0
                  ? fmtMoney(r.estimated_revenue_cents)
                  : "—"}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                {r.trial_active || "—"}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                {r.trial_expired || "—"}
              </td>
              <td className="px-5 py-3 text-right tabular-nums">
                {r.comped > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    {fmtCount(r.comped)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                {r.free_claims || "—"}
              </td>
              <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">
                {fmtCount(r.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaidTable({ summary }: { summary: LicenseSummary }) {
  if (summary.recent_paid.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No license in the table has a Stripe payment intent attached.
      </p>
    );
  }

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-semibold text-foreground">Buyer</th>
            <th className="px-5 py-3 font-semibold text-foreground">Product</th>
            <th className="px-5 py-3 font-semibold text-foreground">
              License key
            </th>
            <th className="px-5 py-3 font-semibold text-foreground">
              Payment intent
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Purchased
            </th>
          </tr>
        </thead>
        <tbody>
          {summary.recent_paid.map((p) => (
            <tr
              key={p.license_key}
              className="border-b border-border last:border-0"
            >
              <td className="px-5 py-3">
                <span className="text-foreground">
                  {p.display_name || (
                    <span className="italic text-muted-foreground">
                      deleted account
                    </span>
                  )}
                </span>
                {p.is_revoked && (
                  <span className="ml-2">
                    <Pill tone="warn">revoked</Pill>
                  </span>
                )}
                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                  {p.user_id.slice(0, 8)}
                </span>
              </td>
              <td className="px-5 py-3 text-muted-foreground">
                {p.product_id}
              </td>
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                {p.license_key}
              </td>
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                {p.stripe_payment_intent_id}
              </td>
              <td className="px-5 py-3 text-right text-muted-foreground">
                {new Date(p.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrialTable({ summary }: { summary: LicenseSummary }) {
  if (summary.trials_open.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No trials running.</p>
    );
  }

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-semibold text-foreground">Account</th>
            <th className="px-5 py-3 font-semibold text-foreground">Product</th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Days left
            </th>
            <th className="px-5 py-3 text-right font-semibold text-foreground">
              Expires
            </th>
          </tr>
        </thead>
        <tbody>
          {summary.trials_open.map((t) => {
            const left = daysLeft(t.trial_ends_at);
            return (
              <tr
                key={t.license_key}
                className="border-b border-border last:border-0"
              >
                <td className="px-5 py-3">
                  <span className="text-foreground">
                    {t.display_name || (
                      <span className="italic text-muted-foreground">
                        deleted account
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                    {t.user_id.slice(0, 8)}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {t.product_id}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  <span
                    className={
                      left <= 3
                        ? "font-semibold text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                    }
                  >
                    {left}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {new Date(t.trial_ends_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Licenses issued per month, with the paid portion overlaid. */
function MonthlyBars({ summary }: { summary: LicenseSummary }) {
  const rows = summary.monthly;
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing issued in the last 12 months.
      </p>
    );
  }
  const peak = Math.max(1, ...rows.map((r) => r.issued));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
          Issued
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Of which paid
        </span>
      </div>

      <div className="flex h-40 items-end gap-2">
        {rows.map((r) => (
          <div key={r.month} className="flex h-full flex-1 flex-col justify-end">
            <div
              className="relative w-full rounded-t-sm bg-primary/30"
              style={{ height: `${(r.issued / peak) * 100}%` }}
              title={`${r.month} — ${r.issued} issued, ${r.paid} paid`}
            >
              {r.paid > 0 && (
                <div
                  className="absolute bottom-0 w-full rounded-t-sm bg-emerald-500"
                  style={{ height: `${(r.paid / r.issued) * 100}%` }}
                />
              )}
            </div>
            <span className="mt-1.5 text-center text-[10px] text-muted-foreground">
              {r.month.slice(5)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Peak {fmtCount(peak)} licenses in one month.
      </p>
    </div>
  );
}

function Dashboard({
  summary,
  recon,
}: {
  summary: LicenseSummary;
  recon: StripeReconcileResult;
}) {
  const t = summary.totals;
  const products = enrichProducts(summary.by_product);
  const revenue = estimatedRevenueCents(products);
  const comped = compedValueCents(products);
  const conversion = trialConversion(products);
  const orphans = orphanedProducts(products);
  const stripe = recon.configured ? recon : null;

  return (
    <div className="flex flex-col gap-12">
      <Section
        title="Money collected"
        note="Taken from Stripe, which is the ledger of record. The licenses table only knows about a payment if the webhook succeeded, so it is the wrong place to count revenue."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Stripe payments"
            value={stripe ? fmtCount(stripe.succeeded.length) : "—"}
            sub={
              stripe
                ? `${fmtMoney(stripe.gross_amount)} collected · ${stripe.mode} mode`
                : "Stripe unreadable from this deployment"
            }
            accent
          />
          <Metric
            label="Delivered a license"
            value={
              stripe
                ? fmtCount(stripe.succeeded.length - stripe.undelivered.length)
                : fmtCount(t.paid)
            }
            sub={
              stripe && stripe.undelivered.length > 0
                ? `${fmtCount(stripe.undelivered.length)} customers still owed`
                : "every payment matched to a license"
            }
          />
          <Metric
            label="Webhook deliveries seen"
            value={
              stripe?.events_recorded === null || stripe === null
                ? "—"
                : fmtCount(stripe.events_recorded)
            }
            sub="rows in stripe_events — zero means none ever arrived"
          />
          <Metric
            label="Revenue at list price"
            value={fmtMoney(revenue)}
            sub="from licenses, for comparison — diverges if deliveries failed"
          />
        </div>
      </Section>

      {stripe && (
        <Section
          title="Webhook endpoints"
          note="A license is only created when Stripe delivers checkout.session.completed to this app. If nothing here is enabled and listening, every purchase silently produces nothing."
        >
          <WebhookHealth recon={stripe} />
        </Section>
      )}

      <Section
        title="Paid versus free, in the licenses table"
        note="A license counts as paid only if it carries a Stripe payment intent. Compare the paid count here against the Stripe figures above — a gap is undelivered software, not lost sales."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Paid licenses"
            value={fmtCount(t.paid)}
            sub={`${fmtShare(paidShare(t))} of ${fmtCount(t.licenses)} issued`}
          />
          <Metric
            label="Revenue at list price"
            value={fmtMoney(revenue)}
            sub="estimate — the table stores the payment intent, not the amount"
          />
          <Metric
            label="Paying customers"
            value={fmtCount(t.paying_holders)}
            sub={`of ${fmtCount(t.holders)} license holders`}
          />
          <Metric
            label="Free licenses"
            value={fmtCount(freeLicenseCount(t))}
            sub="claims, trials, and grants combined"
          />
        </div>
      </Section>

      <Section
        title="By product"
        note="Comped means a paid product handed out without payment — a test-grant or a manual comp. Free claims are the intended flow for products priced at zero, so they are counted separately."
      >
        <ProductTable rows={products} />
      </Section>

      {orphans.length > 0 && (
        <Section
          title="Unrecognised products"
          note="These product IDs exist in the licenses table but not in lib/products.ts. Their holders can still verify, but nothing on the site describes what they bought."
        >
          <div className="glass rounded-2xl p-5">
            <ul className="space-y-2 text-sm">
              {orphans.map((o) => (
                <li key={o.product_id} className="flex flex-wrap gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {o.product_id}
                  </code>
                  <span className="text-muted-foreground">
                    {fmtCount(o.total)} license
                    {o.total === 1 ? "" : "s"}
                    {o.last_issued_at &&
                      `, last issued ${new Date(o.last_issued_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <Section
        title="Trials"
        note="Conversion is measured over trials that have ended. An active trial has not decided yet, so counting it as a loss would make the rate drop every time someone new starts one."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Running now"
            value={fmtCount(t.trial_active)}
            sub="can still convert"
          />
          <Metric
            label="Ended without buying"
            value={fmtCount(t.trial_expired)}
          />
          <Metric
            label="Trial conversion"
            value={
              conversion.decided > 0 ? fmtShare(conversion.rate) : "—"
            }
            sub={`${fmtCount(conversion.converted)} of ${fmtCount(conversion.decided)} decided trials`}
          />
          <Metric
            label="Comped value"
            value={fmtMoney(comped)}
            sub="list price of paid products given away"
          />
        </div>
      </Section>

      <Section title="Trials running now">
        <TrialTable summary={summary} />
      </Section>

      <Section
        title="Purchases"
        note="Every license with a Stripe payment intent, newest first. Cross-check against Stripe Dashboard → Payments; Stripe is the ledger of record."
      >
        <PaidTable summary={summary} />
      </Section>

      <Section
        title="Licenses issued per month"
        note="The paid portion is overlaid in green, so the gap between the two bars is the giveaway rate."
      >
        <MonthlyBars summary={summary} />
      </Section>

      <Section
        title="Never activated"
        note="Issued but never bound to a machine. A paid one here is a refund risk; a trial one never really started, which makes it a weaker signal than the expiry count suggests."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Paid, unused"
            value={fmtCount(summary.never_activated.paid)}
            sub="someone paid and never ran it"
          />
          <Metric
            label="Trials, unused"
            value={fmtCount(summary.never_activated.trial)}
          />
          <Metric
            label="Grants, unused"
            value={fmtCount(summary.never_activated.granted)}
          />
          <Metric
            label="Total unused"
            value={fmtCount(summary.never_activated.total)}
            sub={`of ${fmtCount(t.licenses)} issued`}
          />
        </div>
      </Section>

      <p className="text-xs text-muted-foreground">
        Generated {new Date(summary.generated_at).toLocaleString("en-US")}.
        Revenue is estimated at today&rsquo;s catalogue price and will drift
        from Stripe if prices changed or coupons were used.
      </p>
    </div>
  );
}

export default async function AdminLicensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/licenses");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/account");
  }

  let summary: LicenseSummary | null = null;
  let failure: string | null = null;

  // Stripe is read alongside the RPC rather than after it: if the licenses
  // RPC is missing the page still has something useful to say, and vice
  // versa. reconcileStripe never throws — it reports its own unavailability.
  const [summaryResult, recon] = await Promise.all([
    getLicenseSummary().catch((err: unknown) => err as Error),
    reconcileStripe(),
  ]);

  if (summaryResult instanceof Error) {
    failure = summaryResult.message;
    console.error("[admin/licenses] analytics failed:", failure);
  } else {
    summary = summaryResult;
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin Console
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-foreground">
            License analytics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Which licenses were bought, which were given away, and which trials
            can still convert.
          </p>
        </div>

        {/*
          The reconciliation renders above the licenses breakdown and outside
          its failure branch, because the two have independent sources and
          very different urgency. A missing migration should not be able to
          hide the fact that someone paid and got nothing.
        */}
        <div className="flex flex-col gap-12">
          <Reconciliation recon={recon} />

          {recon.configured && recon.undelivered.length > 0 && (
            <Section
              title="Paid but never delivered"
              note="Money Stripe collected that produced no license. Resending the webhook delivery fixes each one; the handler is idempotent."
            >
              <UndeliveredTable rows={recon.undelivered} />
            </Section>
          )}

          {failure !== null || summary === null ? (
            <div className="glass flex items-start gap-3 rounded-2xl p-6">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-foreground">
                  Could not load the licenses breakdown
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {failure ?? "No data returned."}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  If this mentions a missing function, run{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    scripts/013_create_license_analytics.sql
                  </code>{" "}
                  in the Supabase SQL editor. The Stripe figures above do not
                  depend on it.
                </p>
              </div>
            </div>
          ) : (
            <Dashboard summary={summary} recon={recon} />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
