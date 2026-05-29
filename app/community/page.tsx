import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  MessageCircle,
  Newspaper,
  Star,
  Users,
} from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/community";
const LAST_REVIEWED = "2026-05-29";
const DISCORD_GUILD_ID = "1486178755968765976";
const DISCORD_INVITE = "https://discord.gg/bNfPjfUDAn";

export const metadata: Metadata = {
  title: "Community & Coverage — NanoPocket",
  description:
    "Real-time Discord member count, honest coverage status (no major-outlet review yet), reviewer / journalist contact, and aggregate user feedback signals for NanoPocket.",
  keywords: [
    "NanoPocket community",
    "NanoPocket Discord",
    "NanoPocket reviews",
    "NanoPocket press",
    "NanoPocket user reports",
    "NanoPocket coverage",
  ],
  alternates: { canonical: "/community" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "NanoPocket — Community & Independent Coverage",
    description:
      "Live Discord widget, honest independent-coverage status, reviewer track.",
  },
};

interface DiscordWidget {
  members: number | null;
  presenceCount: number | null;
  source: "live" | "fallback";
}

async function fetchDiscordStats(): Promise<DiscordWidget> {
  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`,
      { next: { revalidate: 600 } },
    );
    if (!res.ok) return { members: null, presenceCount: null, source: "fallback" };
    const data = (await res.json()) as {
      presence_count?: number;
      members?: unknown[];
    };
    return {
      members: Array.isArray(data.members) ? data.members.length : null,
      presenceCount: typeof data.presence_count === "number" ? data.presence_count : null,
      source: "live",
    };
  } catch {
    return { members: null, presenceCount: null, source: "fallback" };
  }
}

interface CoverageRow {
  outlet: string;
  type: "Press" | "Benchmark" | "Tutorial" | "Forum";
  url?: string;
  status: "none" | "in-progress" | "published";
  note: string;
}

const COVERAGE: CoverageRow[] = [
  {
    outlet: "The Verge / Engadget / Tom's Hardware / PCMag / Wirecutter",
    type: "Press",
    status: "none",
    note: "No review published as of 2026-05-29. We have not been contacted by these outlets.",
  },
  {
    outlet: "Hacker News (front page submission)",
    type: "Forum",
    status: "none",
    note: "Not yet submitted. Anyone is welcome to post — we will not flag or astroturf.",
  },
  {
    outlet: "Reddit r/StableDiffusion / r/MachineLearning",
    type: "Forum",
    status: "none",
    note: "No moderator-flaired post yet.",
  },
  {
    outlet: "Product Hunt launch",
    type: "Press",
    status: "none",
    note: "Not yet launched on Product Hunt.",
  },
  {
    outlet: "Independent academic benchmark",
    type: "Benchmark",
    status: "none",
    note:
      "NanoPocket is not yet named as a system in a peer-reviewed VBench / GenEval / DAVIS-VSR evaluation.",
  },
  {
    outlet: "VirusTotal scan permalinks",
    type: "Benchmark",
    status: "in-progress",
    note: "Will be published per release on /verify within 24h of upload.",
  },
];

const communityJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "NanoPocket — Community & Independent Coverage",
  url: PAGE_URL,
  inLanguage: "en",
  isAccessibleForFree: true,
  dateModified: LAST_REVIEWED,
  publisher: {
    "@type": "Organization",
    "@id": "https://nanopocket.ai#organization",
    name: "NanoPocket",
    url: "https://nanopocket.ai",
  },
  mainEntityOfPage: PAGE_URL,
};

export default async function CommunityPage() {
  const widget = await fetchDiscordStats();

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(communityJsonLd) }}
      />

      <Navbar />

      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/trust"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trust
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-500">
            <Users className="h-3.5 w-3.5" />
            Community &amp; coverage
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Community signals &amp; honest coverage status
          </h1>
          <p className="mb-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            This page surfaces only signals we don&apos;t fully control: live Discord member
            counts pulled directly from Discord&apos;s API, and an explicit, dated list of which
            third-party coverage exists today and which doesn&apos;t.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" />
            Last reviewed{" "}
            <time dateTime={LAST_REVIEWED} className="text-foreground">
              {LAST_REVIEWED}
            </time>
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-5xl px-6 pb-24">
        {/* Discord live */}
        <section id="discord" className="mb-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <MessageCircle className="h-5 w-5 text-indigo-500" />
            Live Discord stats
          </h2>
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            These numbers are fetched server-side from Discord&apos;s public widget API on every
            page render (cache: 10 minutes). We can&apos;t fake them — Discord controls the
            endpoint.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              label="Online right now"
              value={widget.presenceCount ?? "—"}
              hint={widget.source === "live" ? "discord widget API" : "widget unavailable"}
            />
            <Stat
              label="Sample of members"
              value={widget.members ?? "—"}
              hint="up to 100 returned by the widget; full count is private"
            />
            <Stat
              label="Public invite"
              value="open"
              hint="anyone can join; no application required"
              link={DISCORD_INVITE}
            />
          </div>

          <div className="mt-5 rounded-xl border border-border/60 bg-muted/20 p-5 text-xs text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">How to verify these numbers yourself:</strong>{" "}
              fetch{" "}
              <code className="rounded bg-background/80 px-1 py-0.5">
                https://discord.com/api/guilds/{DISCORD_GUILD_ID}/widget.json
              </code>{" "}
              — that endpoint is what this page calls. If our number disagrees with
              Discord&apos;s, please email{" "}
              <a
                href="mailto:tech@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                tech@nanopocket.ai
              </a>
              .
            </p>
            <p>
              The widget API caps the returned member sample at 100; that&apos;s a Discord
              limitation, not our choice. We deliberately don&apos;t inflate the &ldquo;sample of
              members&rdquo; into a marketing &ldquo;NN,000+ members&rdquo; banner because we
              cannot prove the larger number from this endpoint.
            </p>
          </div>
        </section>

        {/* Coverage status */}
        <section id="coverage" className="mb-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Newspaper className="h-5 w-5 text-rose-500" />
            Independent coverage status (honest)
          </h2>
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            We list every realistic third-party coverage venue and its current status. Saying
            &ldquo;none yet&rdquo; out loud is more credible than implying coverage exists.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Outlet / venue</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {COVERAGE.map((c, i) => (
                  <tr
                    key={c.outlet}
                    className={`border-t border-border/40 ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 align-top text-sm font-semibold text-foreground">
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          {c.outlet} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        c.outlet
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-muted-foreground">{c.type}</td>
                    <td className="px-4 py-4 align-top text-xs">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                      {c.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reviewer track */}
        <section
          id="reviewer"
          className="mb-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6"
        >
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Star className="h-5 w-5 text-emerald-500" />
            For reviewers &amp; journalists
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&apos;d genuinely like a critical, third-party review. To remove every excuse:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              Free reviewer license keys for every paid app — no questions asked, no NDA. Email{" "}
              <a
                href="mailto:press@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                press@nanopocket.ai
              </a>
              .
            </li>
            <li>
              Raw demo footage, sample inputs, sample outputs, and the test hardware specs we use
              internally — provided on request.
            </li>
            <li>
              On-the-record interviews with the engineering team. We will not request copy
              approval and we will not pull a license over a negative review.
            </li>
            <li>
              For security researchers, the same applies: see the{" "}
              <Link
                href="/security"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                Security &amp; Vulnerability Disclosure
              </Link>{" "}
              policy.
            </li>
          </ul>
        </section>

        {/* User reports */}
        <section id="user-reports" className="mb-2">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Users className="h-5 w-5 text-fuchsia-500" />
            User reports &amp; feedback signals
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Live like / dislike feedback aggregated from the Image FaceSwap Pro 2.0 demo is
            visible (to admins) in the internal{" "}
            <Link
              href="/admin/feedback"
              className="text-fuchsia-500 underline-offset-4 hover:underline"
            >
              feedback dashboard
            </Link>
            . We do not currently publish the rolling tally as a public banner because the sample
            is small (early rollout) and a public number would mislead more than inform.
          </p>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-2 inline-flex items-center gap-1.5 font-semibold text-amber-500">
              <CircleAlert className="h-3.5 w-3.5" />
              Why we don&apos;t show a &ldquo;★ 4.8 / 5&rdquo; banner
            </p>
            <p>
              Aggregate review scores are cheap to fake and almost universally are. We will publish
              an aggregate rating only when there is a credible third-party host for it (e.g.
              Trustpilot, G2, Mac App Store, Microsoft Store). Until then, real reports live on
              Discord, where every message is timestamped and attributable.
            </p>
          </div>
        </section>
      </article>

      <Footer />
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  link,
}: {
  label: string;
  value: string | number;
  hint: string;
  link?: string;
}) {
  const inner = (
    <>
      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-2xl border border-border/60 bg-background/60 p-5 transition-colors hover:border-indigo-500/50"
      >
        {inner}
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-500">
          Join Discord <ExternalLink className="h-3 w-3" />
        </p>
      </a>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-5">{inner}</div>
  );
}

function StatusBadge({ status }: { status: "none" | "in-progress" | "published" }) {
  const map = {
    none: {
      label: "None yet",
      className: "border-rose-500/40 bg-rose-500/10 text-rose-500",
    },
    "in-progress": {
      label: "In progress",
      className: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    },
    published: {
      label: "Published",
      className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    },
  } as const;
  const { label, className } = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] ${className}`}
    >
      {label}
    </span>
  );
}
