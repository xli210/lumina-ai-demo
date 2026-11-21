import Link from "next/link";
import { ArrowRight, MessageSquareHeart } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import { FACESTUDIO_V_LAUNCH, FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { NeoSection } from "../[locale]/facestudio-v/neo-section";

/**
 * The Neo launch page, /neo in English (./page.tsx) and /<locale>/neo (app/[locale]/neo/page.tsx): the new model behind Best quality,
 * the message that we read the feedback on video quality and keep working on it, then the Neo section (clips, likeness, photo tips).
 * Words: messages/pages/<locale>.json video.neo.
 */
export function NeoPage({ c, videoHref }: { c: Record<string, string>; videoHref: string }) {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="px-6 pt-28 pb-8 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">NEW MODEL</span>
            {c.announceKicker}
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ textWrap: "balance" }}>
            {c.announceTitle}
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-foreground/85 sm:text-lg">{c.announceBody}</p>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background">
              <Link href={FACESTUDIO_V_LAUNCH}>
                {c.announceTry} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href={videoHref}>{FACESTUDIO_V_NAME}</Link>
            </Button>
          </div>
          <div className="flex max-w-3xl gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <MessageSquareHeart className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">{c.feedbackTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.feedbackBody}</p>
            </div>
          </div>
        </div>
      </section>
      <NeoSection c={{ ...c, feedbackTitle: "" }} />
      <Footer />
    </main>
  );
}
