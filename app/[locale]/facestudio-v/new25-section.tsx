import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACESTUDIO_V_LAUNCH } from "@/lib/facestudio-v";

const MEDIA = "/facestudio-v/media/cmp";

/**
 * The 2.5 section of the translated video pages (the English page has its own, public/facestudio-v/index.html). Credit
 * prices are left to the pricing page, as on the rest of these pages.
 */
export function New25Section({
  c,
  original,
  pricingHref,
  pricingLabel,
}: {
  c: Record<string, string>;
  original: string;
  pricingHref: string;
  pricingLabel: string;
}) {
  const clips = [
    ["hd2_orig", original],
    ["hd2_best", "Headswap Best"],
    ["hd2_fast", "Headswap Fast"],
  ];
  return (
    <section id="new25" className="px-6 pb-14">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-sm font-medium text-primary">{c.navNew}</p>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          {c.h2} <span className="text-muted-foreground">{c.h2sub}</span>
        </h2>
        <p className="mb-1 text-sm leading-relaxed text-muted-foreground">{c.lead}</p>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{c.quality}</p>
        <ul className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-3">
          {clips.map(([name, label]) => (
            <li key={name} className="relative overflow-hidden rounded-2xl bg-black">
              <video
                src={`${MEDIA}/${name}.mp4`}
                poster={`${MEDIA}/${name}.jpg`}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                className="aspect-[832/704] w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{label}</span>
            </li>
          ))}
        </ul>
        <p className="mb-1 text-sm text-foreground">
          {c.speedRow}: Headswap Best 81–95 s, Headswap Fast 42–60 s
        </p>
        <p className="mb-1 text-xs text-muted-foreground">{c.speedNote}</p>
        <p className="mb-5 text-xs text-muted-foreground">{c.limit}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild className="rounded-full bg-foreground text-background">
            <Link href={FACESTUDIO_V_LAUNCH}>
              {c.ctaFast} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Link href={pricingHref} className="text-sm text-primary underline-offset-4 hover:underline">
            {pricingLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
