import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { modeOf, vendorOf, SERVICE_LABELS } from "@/lib/reliability";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Result feedback", robots: { index: false, follow: false } };

/**
 * /admin/result-feedback — what people answered to "How was this result?" (public/result-feedback.js),
 * per product, mode and (for video) the GPU that made it, with free and paying accounts apart.
 */

const REASON_LABELS: Record<string, string> = {
  face: "Doesn't look like the person",
  unnatural: "Looks fake or unnatural",
  artifacts: "Glitches, blur or seams",
  flicker: "Flickers or jumps",
  wrong_area: "Didn't do what I asked",
  watermark: "The watermark",
  too_short: "Too short",
  too_slow: "Took too long",
  price: "Costs too many credits",
  just_trying: "Just trying it out",
  nothing: "Nothing, it's great",
};

const WINDOWS: Record<string, { label: string; days: number }> = {
  "7d": { label: "Last 7 days", days: 7 },
  "30d": { label: "Last 30 days", days: 30 },
  "90d": { label: "Last 90 days", days: 90 },
};

type Row = {
  service: string;
  rating: "good" | "bad";
  reasons: string[];
  note: string | null;
  paid: boolean;
  estimate: Record<string, unknown> | null;
  detail: Record<string, unknown> | null;
  job_ref: string;
  created_at: string;
};

type Group = {
  key: string;
  service: string;
  mode: string;
  vendor: string;
  answers: number;
  good: number;
  free: number;
  freeGood: number;
  paid: number;
  paidGood: number;
  reasons: Record<string, number>;
};

function pct(n: number, d: number): string {
  return d === 0 ? "-" : `${Math.round((100 * n) / d)}%`;
}

function tone(n: number, d: number): string {
  if (d < 5) return "text-foreground";
  const r = n / d;
  return r >= 0.8 ? "text-emerald-500" : r >= 0.6 ? "text-amber-500" : "text-red-500";
}

export default async function ResultFeedbackPage({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin/result-feedback");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/account");

  const { w } = await searchParams;
  const win = w && WINDOWS[w] ? w : "30d";
  const since = new Date(Date.now() - WINDOWS[win].days * 86400_000).toISOString();

  let rows: Row[] = [];
  let failure: string | null = null;
  const LIMIT = 5000;
  try {
    const { data, error } = await createAdminClient()
      .from("result_feedback")
      .select("service, rating, reasons, note, paid, estimate, detail, job_ref, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    if (error) throw new Error(error.message);
    rows = (data ?? []) as Row[];
  } catch (err: unknown) {
    failure = err instanceof Error ? err.message : "Unknown error";
  }

  const groups = new Map<string, Group>();
  for (const r of rows) {
    const h = { service: r.service, estimate: r.estimate };
    const mode = modeOf(h);
    const vendor = vendorOf(h);
    const key = `${r.service}|${mode}|${vendor}`;
    let g = groups.get(key);
    if (!g) {
      g = { key, service: r.service, mode, vendor, answers: 0, good: 0, free: 0, freeGood: 0, paid: 0, paidGood: 0, reasons: {} };
      groups.set(key, g);
    }
    const good = r.rating === "good";
    g.answers++;
    if (good) g.good++;
    if (r.paid) {
      g.paid++;
      if (good) g.paidGood++;
    } else {
      g.free++;
      if (good) g.freeGood++;
    }
    for (const reason of r.reasons ?? []) g.reasons[reason] = (g.reasons[reason] ?? 0) + 1;
  }
  const sorted = [...groups.values()].sort((a, b) => a.service.localeCompare(b.service) || b.answers - a.answers);
  const notes = rows.filter((r) => r.note).slice(0, 100);
  const total = rows.length;
  const totalGood = rows.filter((r) => r.rating === "good").length;

  const th = "px-3 py-2 text-left font-semibold text-foreground";
  const td = "px-3 py-2 align-top";
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin Console
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-foreground">Result feedback</h1>
        <p className="mt-1 text-muted-foreground">
          Answers to &ldquo;How was this result?&rdquo; under every finished result, by product, mode and GPU. Each answer belongs to one job.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(WINDOWS).map(([k, v]) => (
            <Link
              key={k}
              href={`/admin/result-feedback?w=${k}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                k === win ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {v.label}
            </Link>
          ))}
        </div>

        {failure !== null ? (
          <div className="glass mt-8 flex items-start gap-3 rounded-2xl p-6">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Could not load the answers</p>
              <p className="mt-1 text-sm text-muted-foreground">{failure}</p>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              {total} answers, {pct(totalGood, total)} good{total >= LIMIT ? ` (only the latest ${LIMIT} are counted)` : ""}.
            </p>
            <div className="glass mt-4 overflow-x-auto rounded-2xl">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className={th}>Product</th>
                    <th className={th}>Mode</th>
                    <th className={th}>GPU</th>
                    <th className={th}>Answers</th>
                    <th className={th}>Good</th>
                    <th className={th}>Free: good</th>
                    <th className={th}>Paid: good</th>
                    <th className={th}>Reasons given</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 ? (
                    <tr>
                      <td className={`${td} text-muted-foreground`} colSpan={8}>
                        No answers yet.
                      </td>
                    </tr>
                  ) : (
                    sorted.map((g) => (
                      <tr key={g.key} className="border-b border-border/50 last:border-0">
                        <td className={td}>{SERVICE_LABELS[g.service] ?? g.service}</td>
                        <td className={td}>{g.mode}</td>
                        <td className={`${td} text-muted-foreground`}>{g.vendor}</td>
                        <td className={`${td} tabular-nums`}>{g.answers}</td>
                        <td className={`${td} tabular-nums font-semibold ${tone(g.good, g.answers)}`}>{pct(g.good, g.answers)}</td>
                        <td className={`${td} tabular-nums text-muted-foreground`}>
                          {pct(g.freeGood, g.free)} <span className="text-xs">of {g.free}</span>
                        </td>
                        <td className={`${td} tabular-nums text-muted-foreground`}>
                          {pct(g.paidGood, g.paid)} <span className="text-xs">of {g.paid}</span>
                        </td>
                        <td className={`${td} text-xs text-muted-foreground`}>
                          {Object.entries(g.reasons)
                            .sort((a, b) => b[1] - a[1])
                            .map(([k, n]) => `${REASON_LABELS[k] ?? k} ${n}`)
                            .join(" · ") || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h2 className="mt-10 text-xl font-semibold text-foreground">Notes</h2>
            <p className="mt-1 text-sm text-muted-foreground">What people wrote, newest first (up to 100).</p>
            <div className="mt-4 space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                notes.map((r) => (
                  <div key={`${r.service}-${r.job_ref}`} className="glass rounded-xl p-4 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT ·{" "}
                      {SERVICE_LABELS[r.service] ?? r.service} · {modeOf(r)} ·{" "}
                      {r.rating === "good" ? "Good" : "Not good"} · {r.paid ? "paid" : "free"} · job {r.job_ref}
                      {r.reasons?.length ? ` · ${r.reasons.map((k) => REASON_LABELS[k] ?? k).join(", ")}` : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground">{r.note}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
