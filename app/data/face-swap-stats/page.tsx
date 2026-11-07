import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { JOB_STATS_MIN_JOBS, JOB_STATS_WINDOW_DAYS, getJobStats, type JobStats } from "@/lib/job-stats";

const PAGE_URL = "https://nanopocket.ai/data/face-swap-stats";
const TITLE = "AI Face Swap and Head Swap in Production: Live Job Statistics";
const DESCRIPTION = `How many face swap, head swap and video swap jobs NanoPocket delivered in the last ${JOB_STATS_WINDOW_DAYS} days, the share that finished, and how long people waited, computed from the jobs themselves.`;

// Rebuilt on request and kept by the CDN for a few minutes (middleware.ts lists /data/), so the
// figures are never older than the cache, and never typed in by hand.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "face swap statistics",
    "head swap success rate",
    "video face swap processing time",
    "how long does AI face swap take",
    "AI face swap failure rate",
  ],
  alternates: { canonical: "/data/face-swap-stats" },
  openGraph: { type: "article", url: PAGE_URL, title: TITLE, description: DESCRIPTION, images: ["/og-image.jpg"] },
};

function duration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 90) return `${seconds} s`;
  const minutes = seconds / 60;
  return `${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)} min`;
}

function percent(share: number | null): string {
  return share === null ? "—" : `${(share * 100).toFixed(1)}%`;
}

const day = (iso: string) => iso.slice(0, 10);

function datasetJsonLd(stats: JobStats) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": PAGE_URL,
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    creator: { "@id": "https://nanopocket.ai#organization" },
    isAccessibleForFree: true,
    temporalCoverage: `${day(stats.from)}/${day(stats.to)}`,
    dateModified: stats.to,
    measurementTechnique:
      "Counted from the credit reservation each paid job opens when it starts and settles when it ends; admin accounts excluded.",
    variableMeasured: stats.services.flatMap((s) => [
      { "@type": "PropertyValue", name: `${s.name}: jobs delivered`, value: s.delivered },
      { "@type": "PropertyValue", name: `${s.name}: share of ended jobs delivered`, value: s.deliveredShare === null ? null : Number((s.deliveredShare * 100).toFixed(1)), unitText: "percent" },
      { "@type": "PropertyValue", name: `${s.name}: median wait from start to result`, value: s.medianSeconds, unitCode: "SEC" },
    ]),
  };
}

export default async function FaceSwapStatsPage() {
  let stats: JobStats | null = null;
  try {
    stats = await getJobStats();
  } catch (err) {
    console.error("[data/face-swap-stats]", err instanceof Error ? err.message : err);
  }

  return (
    <main className="relative min-h-screen">
      {stats && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd(stats)) }}
        />
      )}
      <Navbar />
      <article className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{TITLE}</h1>
        {stats === null ? (
          <p className="mt-6 text-muted-foreground">The figures could not be read just now. Please try again later.</p>
        ) : (
          <>
            <p className="mt-4 text-muted-foreground">
              Jobs run on NanoPocket&apos;s online tools from {day(stats.from)} to {day(stats.to)} (UTC), the last{" "}
              {JOB_STATS_WINDOW_DAYS} days: <strong className="text-foreground">{stats.totalDelivered.toLocaleString("en-US")}</strong>{" "}
              results delivered for <strong className="text-foreground">{stats.totalPeople.toLocaleString("en-US")}</strong> people.
              The figures are computed from the jobs when this page is loaded.
            </p>

            <section id="by-tool" className="mt-10">
              <h2 className="mb-4 text-xl font-semibold text-foreground">By tool</h2>
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Tool</th>
                      <th className="px-4 py-3 text-right font-medium">Jobs started</th>
                      <th className="px-4 py-3 text-right font-medium">Delivered</th>
                      <th className="px-4 py-3 text-right font-medium">Finished</th>
                      <th className="px-4 py-3 text-right font-medium">Median wait</th>
                      <th className="px-4 py-3 text-right font-medium">90% within</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.services.map((s) => (
                      <tr key={s.service} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3">
                          <Link href={s.href} className="font-medium text-foreground hover:text-primary">{s.name}</Link>
                          <div className="text-xs text-muted-foreground">{s.kind}</div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{s.started.toLocaleString("en-US")}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{s.delivered.toLocaleString("en-US")}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{percent(s.deliveredShare)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{duration(s.medianSeconds)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{duration(s.p90Seconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="definitions" className="mt-10 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-xl font-semibold text-foreground">What the columns mean</h2>
              <p>
                <strong className="text-foreground">Jobs started</strong>: every paid job reserves its credits before it starts.
                One job is one photo, one set of photo variations, or one video.
              </p>
              <p>
                <strong className="text-foreground">Finished</strong>: the share of jobs that delivered a result, out of the jobs
                that have ended. A job that failed or returned nothing gave its credits back in full, so it cost nothing.
              </p>
              <p>
                <strong className="text-foreground">Median wait</strong> and <strong className="text-foreground">90% within</strong>:
                time from the start of a job to its result, for delivered jobs, including any queue. Video jobs depend on clip
                length and mode.
              </p>
              <p>
                A tool with fewer than {JOB_STATS_MIN_JOBS} jobs in the period is not listed. Accounts of the NanoPocket team are left out. Nothing about a person, a file or a prompt is used, only counts and
                times. Free desktop apps run on the user&apos;s own computer and are not counted here.
              </p>
              <p>
                How the photo pipeline works and where it fails is in the{" "}
                <Link href="/docs/face-swap-pipeline" className="font-medium text-primary hover:underline">face swap pipeline reference</Link>;
                why head swap is built on diffusion is in{" "}
                <Link href="/blog/diffusion-head-swap-vs-gan-face-swap" className="font-medium text-primary hover:underline">Diffusion Head Swap vs GAN Face Swap</Link>.
              </p>
            </section>
          </>
        )}
      </article>
      <Footer />
    </main>
  );
}
