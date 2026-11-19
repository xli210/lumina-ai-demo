import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACESTUDIO_V_LAUNCH } from "@/lib/facestudio-v";

const MEDIA = "/facestudio-v/media/cmp";

/**
 * "Small faces, sharp results" on the translated video pages, right under the hero (the English page has its own,
 * public/facestudio-v/index.html #small). The point is small or distant faces; Sharper face is how to get the sharpest.
 */
export function SmallFacesSection({ c }: { c: Record<string, string> }) {
  const clips = [
    ["sf_now", c.before],
    ["sf_sharp", c.after],
  ];
  const rows = [
    [c.rowSmall, "1.4–2.1×"],
    [c.rowLarge, c.valLarge],
    [c.rowFlicker, c.valFlicker],
    [c.rowTime, c.valTime],
    [c.rowCredits, c.valCredits],
  ];
  return (
    <section id="small" className="px-6 pb-14">
      <div className="mx-auto max-w-5xl rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-8">
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">NEW</span>
          {c.navNew}
        </p>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {c.h2} <span className="text-muted-foreground">{c.h2sub}</span>
        </h2>
        <p className="mb-2 max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base">{c.lead}</p>
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">{c.quality}</p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <ul className="grid grid-cols-2 gap-2">
            {clips.map(([name, label], i) => (
              <li key={name} className="relative overflow-hidden rounded-2xl bg-black">
                <video
                  src={`${MEDIA}/${name}.mp4`}
                  poster={`${MEDIA}/${name}.jpg`}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="aspect-square w-full object-cover"
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    i === 1 ? "bg-white/90 text-black" : "bg-black/70 text-white"
                  }`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <table className="w-full text-sm tabular-nums">
              <tbody>
                {rows.map(([label, value], i) => (
                  <tr key={label} className="border-t border-border/60 first:border-t-0">
                    <th scope="row" className="py-2 pr-2 text-left font-normal text-muted-foreground">
                      {label}
                    </th>
                    <td className={`py-2 text-right ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.note}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.suggest}</p>
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
