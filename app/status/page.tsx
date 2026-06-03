import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Activity, ExternalLink, FileCheck2 } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMOS, demoUrl, type DemoId } from "@/lib/demos";

export const metadata: Metadata = {
  title: "NanoPocket Demo Status — Live Uptime for Free Online Face Swap",
  description:
    "Live uptime status for the three free online face-swap demos: Image FaceSwap Pro 2.0, Video FaceSwap Pro, and NanoFace Vivid. Updated every 5 minutes from an independent GitHub Actions runner.",
  alternates: { canonical: "/status" },
  openGraph: {
    type: "website",
    url: "https://nanopocket.ai/status",
    title: "NanoPocket Demo Status",
    description:
      "Live up/down status for the three free online face-swap demos, updated every 5 minutes.",
  },
};

// Refresh every 60s — checker runs every 5 min, so this is plenty fresh.
export const revalidate = 60;

interface DemoSnapshot {
  id: DemoId;
  name: string;
  url: string;
  status: "up" | "down" | "unknown";
  httpStatus: number | null;
  latencyMs: number | null;
  checkedAt: string | null;
  error: string | null;
  uptime24h: number | null;
  uptime7d: number | null;
  recent: { status: "up" | "down"; checked_at: string }[];
}

async function loadAll(): Promise<DemoSnapshot[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return DEMOS.map((d) => ({
      id: d.id,
      name: d.name,
      url: demoUrl(d),
      status: "unknown" as const,
      httpStatus: null,
      latencyMs: null,
      checkedAt: null,
      error: null,
      uptime24h: null,
      uptime7d: null,
      recent: [],
    }));
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  return Promise.all(
    DEMOS.map(async (d) => {
      const [{ data: latestRows }, { data: rows24h }, { data: rows7d }, { data: recentRows }] =
        await Promise.all([
          supabase
            .from("demo_health_checks")
            .select("status, http_status, latency_ms, error, checked_at")
            .eq("demo_id", d.id)
            .order("checked_at", { ascending: false })
            .limit(1),
          supabase
            .from("demo_health_checks")
            .select("status")
            .eq("demo_id", d.id)
            .gte("checked_at", since24h),
          supabase
            .from("demo_health_checks")
            .select("status")
            .eq("demo_id", d.id)
            .gte("checked_at", since7d),
          supabase
            .from("demo_health_checks")
            .select("status, checked_at")
            .eq("demo_id", d.id)
            .order("checked_at", { ascending: false })
            .limit(60),
        ]);

      const latest = latestRows?.[0];
      const up24 = (rows24h ?? []).filter((r) => r.status === "up").length;
      const all24 = rows24h?.length ?? 0;
      const up7 = (rows7d ?? []).filter((r) => r.status === "up").length;
      const all7 = rows7d?.length ?? 0;

      return {
        id: d.id,
        name: d.name,
        url: demoUrl(d),
        status: (latest?.status as DemoSnapshot["status"]) ?? "unknown",
        httpStatus: latest?.http_status ?? null,
        latencyMs: latest?.latency_ms ?? null,
        checkedAt: latest?.checked_at ?? null,
        error: latest?.error ?? null,
        uptime24h: all24 > 0 ? up24 / all24 : null,
        uptime7d: all7 > 0 ? up7 / all7 : null,
        recent: ((recentRows ?? []) as DemoSnapshot["recent"]).reverse(),
      };
    }),
  );
}

function fmtPct(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(2)}%`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min ago`;
}

export default async function StatusPage() {
  const data = await loadAll();
  const allUp = data.every((d) => d.status === "up");
  const anyDown = data.some((d) => d.status === "down");
  const headlineColor = anyDown
    ? "text-rose-500"
    : allUp
      ? "text-emerald-500"
      : "text-muted-foreground";
  const headline = anyDown
    ? "One or more demos are currently down"
    : allUp
      ? "All systems operational"
      : "Status pending — first check has not run yet";

  const generatedAt = new Date().toISOString();
  const statusJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://nanopocket.ai/status",
    url: "https://nanopocket.ai/status",
    name: "NanoPocket Demo Status",
    description:
      "Live uptime status for the three NanoPocket free online face-swap demos. Updated every 5 minutes by an independent GitHub Actions runner. Snapshot generated " +
      generatedAt +
      ".",
    dateModified: generatedAt,
    isPartOf: { "@id": "https://nanopocket.ai#website" },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: data.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: d.name,
          url: d.url,
          serviceType: "Online face swap demo",
          provider: { "@id": "https://nanopocket.ai#organization" },
          additionalProperty: [
            { "@type": "PropertyValue", name: "currentStatus", value: d.status },
            {
              "@type": "PropertyValue",
              name: "uptime24h",
              value: d.uptime24h == null ? "unknown" : (d.uptime24h * 100).toFixed(2) + "%",
            },
            {
              "@type": "PropertyValue",
              name: "uptime7d",
              value: d.uptime7d == null ? "unknown" : (d.uptime7d * 100).toFixed(2) + "%",
            },
          ],
        },
      })),
    },
  };

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(statusJsonLd) }}
      />

      <Navbar />

      <section className="px-6 pt-28 pb-8 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Live status — independent monitor
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            <span className={headlineColor}>{headline}</span>
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each of the three free online face-swap demos at{" "}
            <Link href="/face-swap" className="text-foreground underline-offset-2 hover:underline">
              /face-swap
            </Link>{" "}
            is pinged from an independent GitHub Actions runner every 5 minutes.
            Results are written to a Supabase table and the page below reads
            from that table directly. Snapshots refresh every 60 seconds.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              Snapshot{" "}
              <time dateTime={generatedAt} className="text-foreground">
                {new Date(generatedAt).toUTCString()}
              </time>
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl space-y-4">
          {data.map((d) => {
            const dotClass =
              d.status === "up"
                ? "bg-emerald-500"
                : d.status === "down"
                  ? "bg-rose-500"
                  : "bg-muted-foreground/60";
            const labelClass =
              d.status === "up"
                ? "text-emerald-500"
                : d.status === "down"
                  ? "text-rose-500"
                  : "text-muted-foreground";
            const label =
              d.status === "up"
                ? "Operational"
                : d.status === "down"
                  ? "Down"
                  : "Pending first check";

            return (
              <article
                key={d.id}
                className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground sm:text-xl">
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotClass}`} />
                      {d.name}
                    </h2>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {d.url}
                        <ExternalLink className="ml-1 inline h-3 w-3" />
                      </a>
                    </p>
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-[0.18em] ${labelClass}`}>
                    {label}
                  </span>
                </header>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      Last check
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{timeAgo(d.checkedAt)}</div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      HTTP
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {d.httpStatus ?? "—"}
                      {d.latencyMs != null ? (
                        <span className="ml-1 text-xs text-muted-foreground">{d.latencyMs} ms</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      Uptime 24h
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {fmtPct(d.uptime24h)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      Uptime 7d
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {fmtPct(d.uptime7d)}
                    </div>
                  </div>
                </div>

                {d.recent.length > 0 ? (
                  <div className="mt-5">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      Last {d.recent.length} checks (oldest → newest)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.recent.map((r) => (
                        <span
                          key={r.checked_at}
                          title={`${r.status === "up" ? "OK" : "Down"} · ${new Date(r.checked_at).toLocaleString()}`}
                          className={`inline-block h-4 w-1.5 rounded-sm ${
                            r.status === "up" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {d.status === "down" && d.error ? (
                  <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-500">
                    Last error: {d.error}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/60 p-6 sm:p-8">
          <h2 className="mb-3 text-lg font-bold tracking-tight text-foreground sm:text-xl">
            How this status page is generated
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              An independent GitHub Actions workflow runs every 5 minutes from
              GitHub's hosted runners — not from the same servers that host
              the demos.
            </li>
            <li>
              Each demo is fetched with a 10s timeout. A 2xx, 3xx, or 401
              response counts as "up" (the tunnel and the app are both
              reachable). Anything else, or a network error, counts as "down".
            </li>
            <li>
              Every result is written to the <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">demo_health_checks</code>{" "}
              Supabase table. This page reads the latest row per demo, the
              uptime aggregates over 24h and 7d, and the last 60 checks for
              the strip chart.
            </li>
            <li>
              On any status transition (up→down or down→up), a webhook
              notifies our internal Discord channel. Recovery alerts are
              posted as well, so you can see when a tunnel comes back.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/face-swap" className="text-sm font-semibold text-foreground underline-offset-2 hover:underline">
              Back to /face-swap <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
            <Link href="/verify" className="text-sm text-muted-foreground hover:text-foreground">
              See the full verify hub <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
