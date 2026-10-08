import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Cpu,
  Download,
  ScanFace,
  Wrench,
} from "lucide-react";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import {
  DEMOS,
  isUnderMaintenance,
  liveDemos,
  type DemoEntry,
  type DemoId,
} from "@/lib/demos";
import { FREE_ALLOWANCE_SHORT } from "@/lib/face-studio-facts";

/**
 * /demos/unavailable?id=<demo>
 *
 * Where /api/demos/open sends someone whose demo is knowingly offline.
 *
 * The point of this page is not the apology. Someone arrived here having
 * already decided to try something, and the worst outcome is that they
 * leave with nothing — so the page leads with what still works and only
 * then explains what broke. Unindexed: it should only ever be reached by
 * the redirect.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "This demo is temporarily offline — NanoPocket",
  description:
    "This online demo is being moved onto new infrastructure. Nano FaceStudio Online is live in the meantime, and the desktop apps run everything locally.",
  robots: { index: false, follow: false, nocache: true },
};

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

function findDemo(raw: string | undefined): DemoEntry | null {
  if (!raw) return null;
  return DEMOS.find((d) => d.id === (raw as DemoId)) ?? null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DemoUnavailablePage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const demo = findDemo(id);

  // No id, or an id that is actually working — there is nothing honest to
  // say on this page, so do not render an apology for a non-problem.
  if (!demo || !isUnderMaintenance(demo)) {
    notFound();
  }

  const maintenance = demo.maintenance!;
  const alternatives = liveDemos();

  return (
    <main className="relative min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">
          <Wrench className="h-3.5 w-3.5" />
          Temporarily offline
        </div>

        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {demo.name} is being rebuilt
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          {maintenance.note}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Offline since {formatDate(maintenance.since)}.
          {maintenance.eta ? ` ${maintenance.eta}.` : ""} Nothing you did
          caused this, and you have not used any of your daily quota.
        </p>

        {/* What still works, first — the reason this page exists. */}
        {alternatives.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">
              What you can use right now
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {alternatives.map((alt) => (
                <Link
                  key={alt.id}
                  href={alt.internal ? alt.landingPath : `/api/demos/open?id=${alt.id}`}
                  className="glass group flex items-center justify-between gap-4 rounded-2xl p-5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-primary/10 p-2">
                      <ScanFace className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{alt.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {alt.id === "image"
                          ? `Photo face swap on our own GPUs — up to six faces at once, full resolution, no watermark. ${FREE_ALLOWANCE_SHORT}.`
                          : "Live now."}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Or skip the queue entirely
          </h2>
          <p className="mt-2 text-muted-foreground">
            The desktop apps run the same models on your own GPU. Nothing is
            uploaded, there is no daily limit, and they are unaffected by any
            of this.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/download">
                <Download className="mr-1.5 h-4 w-4" />
                See the desktop apps
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={demo.productHref}>
                <Cpu className="mr-1.5 h-4 w-4" />
                About {demo.name}
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-sm text-muted-foreground">
            Live status for every demo is at{" "}
            <Link href="/status" className="text-primary hover:underline">
              /status
            </Link>
            . If something here is wrong, tell us at{" "}
            <Link href="/contact" className="text-primary hover:underline">
              /contact
            </Link>{" "}
            — we would rather hear it than not.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
