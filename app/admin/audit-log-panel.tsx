"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * The record of every dangerous admin action (admin_audit_log, migration 016):
 * who, to whom, when, and from which address. Read-only; nothing in the
 * browser can add to it, change it or delete from it.
 */

interface AuditRow {
  id: number;
  at: string;
  actor_email: string | null;
  action: string;
  target_email: string | null;
  detail: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
}

const LABELS: Record<string, { text: string; tone: string }> = {
  grant_admin: { text: "Made admin", tone: "bg-purple-500/10 text-purple-400" },
  revoke_admin: { text: "Removed admin", tone: "bg-amber-500/10 text-amber-500" },
  ban: { text: "Banned", tone: "bg-red-500/10 text-red-400" },
  unban: { text: "Unbanned", tone: "bg-emerald-500/10 text-emerald-500" },
  revoke_license: { text: "Revoked license", tone: "bg-red-500/10 text-red-400" },
  restore_license: { text: "Restored license", tone: "bg-emerald-500/10 text-emerald-500" },
};

/** "iPhone", "Windows", "Mac"... enough to tell whose device it probably was. */
function deviceOf(ua: string | null): string {
  if (!ua) return "unknown device";
  if (/iPhone|iPad/i.test(ua)) return "iPhone/iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "other device";
}

export function AuditLogPanel() {
  const supabase = createClient();
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("admin_audit_log")
      .select("id, at, actor_email, action, target_email, detail, ip, user_agent")
      .order("at", { ascending: false })
      .limit(100);
    if (err) {
      setError(
        /does not exist|schema cache/i.test(err.message)
          ? "The audit log is not set up yet: run scripts/016_admin_guardrails.sql in the Supabase SQL editor."
          : err.message
      );
      setRows(null);
    } else {
      setRows((data ?? []) as AuditRow[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Every admin grant, ban and license revoke, newest first. This list cannot be edited.
        </p>
        <Button size="sm" variant="outline" className="gap-1.5 rounded-full bg-transparent text-xs" onClick={() => void load()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm text-amber-500">{error}</div>
      ) : rows && rows.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Nothing has been recorded yet.</div>
      ) : (
        rows?.map((r) => {
          const label = LABELS[r.action] ?? { text: r.action, tone: "bg-muted text-muted-foreground" };
          return (
            <div key={r.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${label.tone}`}>{label.text}</span>
                <span className="text-sm font-semibold text-foreground">{r.target_email ?? "(no account)"}</span>
                {typeof r.detail?.product_id === "string" && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{r.detail.product_id}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                by {r.actor_email ?? "unknown"} &middot; {new Date(r.at).toLocaleString()} &middot; {deviceOf(r.user_agent)}
                {r.ip ? ` · ${r.ip}` : ""}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
