import Link from "next/link";
import { ArrowRight, MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACESTUDIO_V_LAUNCH } from "@/lib/facestudio-v";
import { NeoSaleBadge } from "./neo-sale-badge";

const MEDIA = "/facestudio-v/media/cmp";

/**
 * The Neo launch on the homepages (app/page.tsx in English, app/[locale]/page.tsx in the others): the new model, and the message that we
 * read the feedback on video quality and keep working on it. Words: messages/pages/<locale>.json video.neo; links to the Neo page.
 */
export function NeoAnnouncement({ c, pageHref }: { c: Record<string, string>; pageHref: string }) {
  return (
    <section id="neo-launch" className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">NEW MODEL</span>
            {c.announceKicker}
          </p>
          <NeoSaleBadge text={c.saleBadge} />
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl" style={{ textWrap: "balance" }}>
            {c.announceTitle}
          </h2>
          <p className="mb-5 max-w-prose text-sm leading-relaxed text-foreground/85 sm:text-base">{c.announceBody}</p>
          <div className="mb-6 flex gap-3 rounded-2xl border border-border/60 bg-background/70 p-4">
            <MessageSquareHeart className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{c.feedbackTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.feedbackBody}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-full bg-foreground text-background">
              <Link href={pageHref}>
                {c.announceCta} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={FACESTUDIO_V_LAUNCH}>{c.announceTry}</Link>
            </Button>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3">
          {["neo_home_bar_mustache", "neo_home_dance"].map((name) => (
            <div key={name} className="relative overflow-hidden rounded-2xl bg-black">
              <video src={`${MEDIA}/${name}.mp4`} poster={`${MEDIA}/${name}.jpg`} muted loop autoPlay playsInline preload="metadata" className="block h-auto w-full" />
              <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{c.before}</span>
              <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-black">{c.after}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
