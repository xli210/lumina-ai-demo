import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

export const dynamic = "force-dynamic";

interface MessageRow {
  id: string;
  kind: string;
  message: string;
  name: string | null;
  email: string | null;
  other_contact: string | null;
  page: string | null;
  user_id: string | null;
  created_at: string;
}

const KIND_LABELS: Record<string, string> = {
  feature: "Feature request",
  improvement: "Improvement",
  bug: "Bug",
  question: "Question",
  business: "Business",
  other: "Other",
};

export default async function MessagesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/account");

  const { kind } = await searchParams;
  const admin = createAdminClient();
  let q = admin
    .from("contact_messages")
    .select("id, kind, message, name, email, other_contact, page, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (kind && KIND_LABELS[kind]) q = q.eq("kind", kind);
  const { data, error } = await q;
  const rows: MessageRow[] = data ?? [];

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.kind] = (counts[r.kind] ?? 0) + 1;

  const chip = "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:bg-muted transition-colors";
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Admin Console
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="mb-6 mt-1 text-muted-foreground">What visitors sent through the contact form, newest first.</p>

        {error && (
          <p className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Could not read messages ({error.code ?? "error"}). If this is new, run <code>scripts/017_create_contact_messages.sql</code> in Supabase first.
          </p>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/messages" className={chip}>All ({rows.length})</Link>
          {Object.entries(KIND_LABELS).map(([k, label]) => (
            <Link key={k} href={`/admin/messages?kind=${k}`} className={chip}>
              {label}{!kind && counts[k] ? ` (${counts[k]})` : ""}
            </Link>
          ))}
        </div>

        {rows.length === 0 && !error ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No messages yet.</div>
        ) : (
          <ul className="space-y-4">
            {rows.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{KIND_LABELS[r.kind] ?? r.kind}</span>
                  <time dateTime={r.created_at}>{new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })} CT</time>
                  {r.user_id && <span>signed-in user</span>}
                  {r.page && <span>from {r.page}</span>}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{r.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {r.name && <span>{r.name}</span>}
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
                      <Mail className="h-3.5 w-3.5" />
                      {r.email}
                    </a>
                  )}
                  {r.other_contact && <span>{r.other_contact}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </main>
  );
}
