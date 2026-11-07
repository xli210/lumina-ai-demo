import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

export const dynamic = "force-dynamic";

interface DailyRow {
  day: string;
  agent: string;
  kind: "answer" | "index";
  fetches: number;
}

interface PageRow {
  path: string;
  answer_fetches: number;
  index_fetches: number;
  answer_agents: string | null;
  last_fetched_at: string;
}

/**
 * Which pages AI assistants open while answering people, and which their search indexers read
 * (recorded by the middleware, lib/ai-agents.ts, into scripts/024's table). It is how a change made
 * for AI answers is judged: a page that starts being opened for answers is a page being cited.
 */
export default async function AiCitationsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/account");

  const admin = createAdminClient();
  const [daily, pages] = await Promise.all([
    admin.from("ai_fetches_daily").select("day, agent, kind, fetches").order("day", { ascending: false }).limit(2000),
    admin
      .from("ai_fetches_pages_7d")
      .select("path, answer_fetches, index_fetches, answer_agents, last_fetched_at")
      .order("answer_fetches", { ascending: false })
      .order("index_fetches", { ascending: false })
      .limit(60),
  ]);
  const error = daily.error ?? pages.error;
  const dailyRows: DailyRow[] = daily.data ?? [];
  const pageRows: PageRow[] = pages.data ?? [];

  // One row per day, one column per assistant, answers only; indexing as a single total.
  const agents = [...new Set(dailyRows.filter((r) => r.kind === "answer").map((r) => r.agent))].sort();
  const days = [...new Set(dailyRows.map((r) => r.day))].sort().reverse().slice(0, 14);
  const cell = (day: string, agent: string) =>
    dailyRows.find((r) => r.day === day && r.agent === agent && r.kind === "answer")?.fetches ?? 0;
  const indexed = (day: string) =>
    dailyRows.filter((r) => r.day === day && r.kind === "index").reduce((sum, r) => sum + r.fetches, 0);

  const when = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Admin Console
        </Link>
        <h1 className="text-3xl font-bold text-foreground">AI citations</h1>
        <p className="mb-6 mt-1 text-muted-foreground">
          &ldquo;Answer&rdquo; fetches are an assistant opening one of our pages while answering someone (ChatGPT-User,
          Claude-User, Perplexity-User and similar): the closest sign that a page is being cited. &ldquo;Index&rdquo;
          fetches are their search crawlers, which decide what can be cited later. Days are Pacific time. A fetch is
          not a visit: a person may still not click through.
        </p>

        {error && (
          <p className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Could not read AI fetches ({error.code ?? "error"}). If this is new, run <code>scripts/024_create_ai_fetches.sql</code> in Supabase first.
          </p>
        )}

        <h2 className="mb-3 text-lg font-semibold text-foreground">Answer fetches by day</h2>
        {days.length === 0 ? (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Nothing recorded yet.</div>
        ) : (
          <div className="mb-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Day</th>
                  {agents.map((a) => (
                    <th key={a} className="px-4 py-2 text-right font-medium">{a}</th>
                  ))}
                  <th className="px-4 py-2 text-right font-medium">Index (all)</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2 text-foreground">{d}</td>
                    {agents.map((a) => (
                      <td key={a} className="px-4 py-2 text-right tabular-nums text-foreground">{cell(d, a)}</td>
                    ))}
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{indexed(d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="mb-3 text-lg font-semibold text-foreground">Pages, last 7 days</h2>
        {pageRows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Nothing recorded yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Path</th>
                  <th className="px-4 py-2 text-right font-medium">Answer</th>
                  <th className="px-4 py-2 font-medium">By</th>
                  <th className="px-4 py-2 text-right font-medium">Index</th>
                  <th className="px-4 py-2 font-medium">Last</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.path} className="border-b border-border/50 last:border-0">
                    <td className="max-w-[18rem] truncate px-4 py-2 text-foreground" title={r.path}>{r.path}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-foreground">{r.answer_fetches}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.answer_agents ?? "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{r.index_fetches}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">{when(r.last_fetched_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
