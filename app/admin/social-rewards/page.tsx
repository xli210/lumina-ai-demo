import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewSocialPost } from "@/app/actions/social-reward";
import { SOCIAL_PLATFORM_LABELS, SOCIAL_REWARD_CREDITS } from "@/lib/social-reward";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  user_id: string;
  url: string;
  platform: string;
  status: string;
  reject_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const REJECT_LABELS: Record<string, string> = {
  not_found: "Can't open it, or not public",
  disclosure: "No credits or AI disclosure",
  off_topic: "Not their own use of NanoPocket",
  rules: "Breaks the content rules",
};

export default async function SocialRewardsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/account");

  const { data, error } = await createAdminClient()
    .from("social_post_rewards")
    .select("id, user_id, url, platform, status, reject_reason, created_at, reviewed_at")
    .order("created_at", { ascending: false })
    .limit(300);
  const rows: PostRow[] = data ?? [];
  const pending = rows.filter((r) => r.status === "pending").reverse();
  const reviewed = rows.filter((r) => r.status !== "pending");

  const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Chicago" });
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Admin Console
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Post rewards</h1>
        <p className="mb-6 mt-1 text-muted-foreground">
          Open each post. Approve only if it is public, is the person&apos;s own use of NanoPocket, says they got credits and
          says the result is AI-generated. Approving adds {SOCIAL_REWARD_CREDITS} credits; an account can only be paid once.
        </p>

        {error && (
          <p className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Could not read posts ({error.code ?? "error"}). If this is new, run <code>scripts/021_create_social_post_rewards.sql</code> in Supabase first.
          </p>
        )}

        <h2 className="mb-3 text-lg font-semibold text-foreground">Waiting for review ({pending.length})</h2>
        {pending.length === 0 && !error ? (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Nothing to review.</div>
        ) : (
          <ul className="mb-8 space-y-4">
            {pending.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-2 text-xs text-muted-foreground">
                  {SOCIAL_PLATFORM_LABELS[r.platform] ?? r.platform} · {when(r.created_at)} CT · account {r.user_id}
                </div>
                <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {r.url}
                </a>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <form action={reviewSocialPost}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button type="submit" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      Approve, add {SOCIAL_REWARD_CREDITS} credits
                    </button>
                  </form>
                  <form action={reviewSocialPost} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <select name="reason" required defaultValue="" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground">
                      <option value="" disabled>Reject because…</option>
                      {Object.entries(REJECT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-3 text-lg font-semibold text-foreground">Reviewed ({reviewed.length})</h2>
        <ul className="space-y-2 text-sm">
          {reviewed.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <span className={r.status === "approved" ? "font-medium text-emerald-600 dark:text-emerald-400" : "font-medium text-muted-foreground"}>
                {r.status === "approved" ? "Approved" : `Rejected: ${REJECT_LABELS[r.reject_reason ?? ""] ?? "no reason"}`}
              </span>
              <span className="text-muted-foreground"> · {when(r.reviewed_at ?? r.created_at)} CT · </span>
              <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary hover:underline">{r.url}</a>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </main>
  );
}
