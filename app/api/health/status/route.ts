import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMOS } from "@/lib/demos";

export const runtime = "nodejs";
// Cache the response at the edge for 60s — the writer runs every 5 min,
// so anything fresher than 60s is wasted.
export const revalidate = 60;

interface DemoSnapshot {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "unknown";
  httpStatus: number | null;
  latencyMs: number | null;
  checkedAt: string | null;
  error: string | null;
  uptime24h: number | null;
}

async function loadSnapshot(): Promise<DemoSnapshot[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    // Env not configured (e.g. local dev without Supabase). Return unknowns.
    return DEMOS.map((d) => ({
      id: d.id,
      name: d.name,
      url: `${d.origin}${d.landingPath}`,
      status: "unknown",
      httpStatus: null,
      latencyMs: null,
      checkedAt: null,
      error: null,
      uptime24h: null,
    }));
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const snapshots = await Promise.all(
    DEMOS.map(async (d) => {
      const url = `${d.origin}${d.landingPath}`;

      const { data: latestRows } = await supabase
        .from("demo_health_checks")
        .select("status, http_status, latency_ms, error, checked_at")
        .eq("demo_id", d.id)
        .order("checked_at", { ascending: false })
        .limit(1);
      const latest = latestRows?.[0];

      const { data: upRows } = await supabase
        .from("demo_health_checks")
        .select("status", { count: "exact" })
        .eq("demo_id", d.id)
        .eq("status", "up")
        .gte("checked_at", since);
      const upCount = (upRows as unknown as { length?: number })?.length ?? 0;

      const { data: allRows } = await supabase
        .from("demo_health_checks")
        .select("status", { count: "exact" })
        .eq("demo_id", d.id)
        .gte("checked_at", since);
      const allCount = (allRows as unknown as { length?: number })?.length ?? 0;

      const uptime24h = allCount > 0 ? upCount / allCount : null;

      return {
        id: d.id,
        name: d.name,
        url,
        status: (latest?.status as DemoSnapshot["status"]) ?? "unknown",
        httpStatus: latest?.http_status ?? null,
        latencyMs: latest?.latency_ms ?? null,
        checkedAt: latest?.checked_at ?? null,
        error: latest?.error ?? null,
        uptime24h,
      } satisfies DemoSnapshot;
    }),
  );

  return snapshots;
}

export async function GET() {
  const snapshot = await loadSnapshot();
  return NextResponse.json(
    { demos: snapshot, generatedAt: new Date().toISOString() },
    {
      headers: {
        "cache-control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
