import { createAdminClient } from "@/lib/supabase/admin";
import type { DemoId } from "@/lib/demos";

interface BadgeProps {
  demoId: DemoId;
  /** Visual size — "sm" for inline next to text, "md" for cards. */
  size?: "sm" | "md";
  /** If true, hide the badge entirely when status is "unknown". */
  hideWhenUnknown?: boolean;
}

interface LatestRow {
  status: "up" | "down";
  checked_at: string;
}

async function fetchLatest(demoId: DemoId): Promise<LatestRow | null> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }
  const { data } = await supabase
    .from("demo_health_checks")
    .select("status, checked_at")
    .eq("demo_id", demoId)
    .order("checked_at", { ascending: false })
    .limit(1);
  return (data?.[0] as LatestRow) ?? null;
}

function timeAgo(iso: string): string {
  const d = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.round(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export async function DemoStatusBadge({
  demoId,
  size = "sm",
  hideWhenUnknown = false,
}: BadgeProps) {
  const latest = await fetchLatest(demoId);

  const status: "up" | "down" | "unknown" = latest?.status ?? "unknown";

  if (status === "unknown" && hideWhenUnknown) return null;

  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  if (status === "up") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 ${padding} ${textSize} font-mono uppercase tracking-[0.16em] text-emerald-500`}
        title={latest?.checked_at ? `Last checked ${timeAgo(latest.checked_at)}` : undefined}
      >
        <span className={`relative flex ${dotSize}`}>
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60`} />
          <span className={`relative inline-flex rounded-full ${dotSize} bg-emerald-500`} />
        </span>
        Live
      </span>
    );
  }

  if (status === "down") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 ${padding} ${textSize} font-mono uppercase tracking-[0.16em] text-rose-500`}
        title={latest?.checked_at ? `Last checked ${timeAgo(latest.checked_at)}` : undefined}
      >
        <span className={`relative inline-flex rounded-full ${dotSize} bg-rose-500`} />
        Down — see /status
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 ${padding} ${textSize} font-mono uppercase tracking-[0.16em] text-muted-foreground`}
    >
      <span className={`relative inline-flex rounded-full ${dotSize} bg-muted-foreground/60`} />
      Status pending
    </span>
  );
}
