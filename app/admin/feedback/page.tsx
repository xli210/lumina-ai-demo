import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

export const dynamic = "force-dynamic";

interface FeedbackRow {
  id: string;
  user_id: string;
  demo_id: string;
  vote: "like" | "dislike";
  comment: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
}

const DEMO_LABELS: Record<string, string> = {
  "image-faceswap-pro": "Image FaceSwap Pro",
  "video-faceswap-pro": "Video FaceSwap Pro",
};

function labelFor(demoId: string): string {
  return DEMO_LABELS[demoId] ?? demoId;
}

export default async function FeedbackAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    redirect("/account");
  }

  const admin = createAdminClient();
  const { data: rowsRaw } = await admin
    .from("demo_feedback")
    .select("id, user_id, demo_id, vote, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows: FeedbackRow[] = rowsRaw ?? [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profilesRaw } =
    userIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds)
      : { data: [] as ProfileRow[] };
  const nameById = new Map<string, string | null>(
    (profilesRaw ?? []).map((p) => [p.id, p.display_name])
  );

  const stats: Record<string, { like: number; dislike: number }> = {};
  for (const r of rows) {
    if (!stats[r.demo_id]) {
      stats[r.demo_id] = { like: 0, dislike: 0 };
    }
    stats[r.demo_id][r.vote] += 1;
  }
  const statsEntries = Object.entries(stats).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const totalVotes = rows.length;
  const totalLikes = rows.filter((r) => r.vote === "like").length;
  const totalDislikes = totalVotes - totalLikes;
  const overallPositivePct =
    totalVotes > 0 ? Math.round((totalLikes / totalVotes) * 100) : 0;

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin Console
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Demo Feedback</h1>
          <p className="mt-1 text-muted-foreground">
            Survey results from the online FaceSwap Pro demos.
          </p>
        </div>

        {/* Overall summary */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <SummaryCard label="Total votes" value={totalVotes} />
          <SummaryCard
            label="Likes"
            value={totalLikes}
            tone="emerald"
            icon={<ThumbsUp className="h-3.5 w-3.5" />}
          />
          <SummaryCard
            label="Dislikes"
            value={totalDislikes}
            tone="rose"
            icon={<ThumbsDown className="h-3.5 w-3.5" />}
          />
          <SummaryCard
            label="Positive"
            value={`${overallPositivePct}%`}
          />
        </div>

        {/* Per-demo stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {statsEntries.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground md:col-span-2">
              No feedback submitted yet.
            </div>
          ) : (
            statsEntries.map(([demoId, s]) => {
              const total = s.like + s.dislike;
              const pct = total > 0 ? Math.round((s.like / total) * 100) : 0;
              return (
                <div
                  key={demoId}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    {labelFor(demoId)}
                  </p>
                  <p className="mb-3 font-mono text-[11px] text-muted-foreground">
                    {demoId}
                  </p>
                  <div className="mb-3 flex items-center gap-4 text-sm">
                    <span className="inline-flex items-center gap-1 text-emerald-500">
                      <ThumbsUp className="h-4 w-4" /> {s.like}
                    </span>
                    <span className="inline-flex items-center gap-1 text-rose-500">
                      <ThumbsDown className="h-4 w-4" /> {s.dislike}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {total} total · {pct}% positive
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Raw table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              All votes ({rows.length})
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Newest first. Showing up to 500 rows.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Demo</th>
                  <th className="px-4 py-3 font-medium">Vote</th>
                  <th className="px-4 py-3 font-medium">Comment</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No feedback yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const displayName = nameById.get(r.user_id);
                    const fallback = `${r.user_id.slice(0, 8)}…`;
                    return (
                      <tr
                        key={r.id}
                        className="border-t border-border/60 hover:bg-muted/30 transition-colors"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">
                              {displayName || fallback}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {r.user_id.slice(0, 8)}…
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground">
                            {labelFor(r.demo_id)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.vote === "like" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-500/20">
                              <ThumbsUp className="h-3 w-3" /> Like
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 ring-1 ring-rose-500/20">
                              <ThumbsDown className="h-3 w-3" /> Dislike
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.comment ? (
                            <div className="flex items-start gap-1.5 text-xs text-foreground">
                              <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="line-clamp-2">{r.comment}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone?: "emerald" | "rose";
  icon?: React.ReactNode;
}) {
  const valueColor =
    tone === "emerald"
      ? "text-emerald-500"
      : tone === "rose"
        ? "text-rose-500"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 inline-flex items-center gap-1.5 text-2xl font-bold ${valueColor}`}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}
