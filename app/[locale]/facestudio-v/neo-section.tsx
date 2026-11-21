import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACESTUDIO_V_LAUNCH, FACESTUDIO_V_NEO_LIKENESS, FACESTUDIO_V_NEO_LIKENESS_ROWS } from "@/lib/facestudio-v";

const MEDIA = "/facestudio-v/media/cmp";

/**
 * "Neo", the new model behind Best quality, first under the hero of the translated video pages (the English page has its own,
 * public/facestudio-v/index.html #neo). The likeness figures come from lib/facestudio-v.ts; the words from messages/pages/<locale>.json
 * video.neo. Each clip is original | Neo side by side with the reference photo inset top right.
 */
export function NeoSection({ c }: { c: Record<string, string> }) {
  const wide = [
    ["neo_art_wig", c.cap1],
    ["neo_film_cry", c.cap2],
  ];
  const tall = [
    ["neo_vlog_glasses", c.cap3],
    ["neo_react_hands", c.cap4],
    ["neo_closeup_laugh", c.cap5],
    ["neo_stage_singer", c.cap6],
  ];
  const rowLabels = [c.row1, c.row2, c.row3, c.row4];
  const clip = ([name, cap]: string[]) => (
    <li key={name} className="min-w-0 overflow-hidden rounded-2xl bg-black">
      <div className="relative">
        <video src={`${MEDIA}/${name}.mp4`} poster={`${MEDIA}/${name}.jpg`} muted loop autoPlay playsInline preload="metadata" className="block h-auto w-full" />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{c.before}</span>
        <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-black">{c.after}</span>
      </div>
      <p className="px-3 py-2 text-xs leading-snug text-white/75">{cap}</p>
    </li>
  );
  return (
    <section id="neo" className="px-6 pb-14">
      <div className="mx-auto max-w-5xl rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-8">
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">NEW MODEL</span>
          {c.navNew}
        </p>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl" style={{ textWrap: "balance" }}>
          {c.h2} <span className="block text-muted-foreground">{c.h2sub}</span>
        </h2>
        <p className="mb-2 max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base">{c.lead}</p>
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{c.quality}</p>
        {c.feedbackTitle && (
          <div className="mb-6 max-w-3xl rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-sm font-semibold text-foreground">{c.feedbackTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.feedbackBody}</p>
          </div>
        )}
        <ul className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">{wide.map(clip)}</ul>
        <ul className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">{tall.map(clip)}</ul>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-border/60 bg-background/60 p-4">
            <h3 className="mb-2 text-base font-semibold text-foreground">{c.tableTitle}</h3>
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr>
                  <th />
                  <th scope="col" className="py-1 text-right font-normal text-muted-foreground">{c.colBefore}</th>
                  <th scope="col" className="py-1 text-right font-semibold text-foreground">Neo</th>
                </tr>
              </thead>
              <tbody>
                {FACESTUDIO_V_NEO_LIKENESS_ROWS.map((r, i) => (
                  <tr key={r.clip} className="border-t border-border/60">
                    <th scope="row" className="py-2 pr-2 text-left font-normal text-muted-foreground">{rowLabels[i]}</th>
                    <td className="py-2 text-right text-muted-foreground">{r.before}</td>
                    <td className="py-2 text-right font-semibold text-foreground">{r.neo}</td>
                  </tr>
                ))}
                <tr className="border-t border-border/60">
                  <th scope="row" className="py-2 pr-2 text-left font-semibold text-foreground">{c.avg}</th>
                  <td className="py-2 text-right font-semibold text-foreground">{FACESTUDIO_V_NEO_LIKENESS.before}</td>
                  <td className="py-2 text-right font-semibold text-foreground">{FACESTUDIO_V_NEO_LIKENESS.neo}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.note}</p>
          </div>
          <div className="min-w-0 rounded-2xl border border-border/60 bg-background/60 p-4">
            <h3 className="mb-2 text-base font-semibold text-foreground">{c.tipsTitle}</h3>
            <ul className="grid list-disc gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>{c.tip1}</li>
              <li>{c.tip2}</li>
              <li>{c.tip3}</li>
              <li>{c.tip4}</li>
            </ul>
          </div>
        </div>
        <div className="mt-6">
          <Button asChild className="rounded-full bg-foreground text-background">
            <Link href={FACESTUDIO_V_LAUNCH}>
              {c.cta} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
