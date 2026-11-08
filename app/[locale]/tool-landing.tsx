import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import { translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";
import type { TitleBody, ToolPageCopy } from "@/lib/i18n/page-copy";

/**
 * The translated page of an online tool: what it does, real before/after results, three steps, and the way in. One layout
 * for /<locale>/face-studio and /<locale>/image-edit; the words are in messages/pages/<locale>.json and the pictures are
 * the same files the English pages show.
 */

export interface ToolExample {
  key: string;
  before: string;
  after: string;
  width: number;
  height: number;
}

export function ToolLanding({
  locale,
  name,
  copy,
  examples,
  launchHref,
  englishHref,
  jsonLd,
  wideExamples = false,
  nav,
}: {
  locale: AppLocale;
  name: string;
  copy: ToolPageCopy;
  examples: ToolExample[];
  launchHref: string;
  englishHref: string;
  jsonLd: object[];
  /** One pair per row, for whole-window screenshots whose detail is lost when small. */
  wideExamples?: boolean;
  /** Replaces the site's usual bar. */
  nav?: React.ReactNode;
}) {
  const items: TitleBody[] = copy.features ?? copy.tools ?? [];
  const itemsHeading = copy.featuresHeading ?? copy.toolsHeading ?? "";

  return (
    <main lang={locale} className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      {nav ?? <Navbar />}

      <section className="px-6 pt-28 pb-12 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-medium tracking-widest text-primary">
            {name} · {copy.kicker}
          </p>
          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{copy.h1}</h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">{copy.lead}</p>
          <Button asChild size="lg" className="rounded-full bg-foreground text-background">
            <Link href={launchHref}>
              {copy.cta} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">{copy.note}</p>
          {copy.promptNote && <p className="mt-1 text-xs text-muted-foreground">{copy.promptNote}</p>}
        </div>
      </section>

      {examples.length > 0 && <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{copy.examplesHeading}</h2>
          <ul className={`grid grid-cols-1 gap-6 ${wideExamples ? "" : "md:grid-cols-2"}`}>
            {examples.map((e) => (
              <li key={e.key} className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                <div className="grid grid-cols-2 gap-1 bg-black">
                  {([
                    [e.before, copy.beforeLabel],
                    [e.after, copy.afterLabel],
                  ] as const).map(([src, label]) => (
                    <figure key={label} className="relative m-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`${label}: ${copy.examples[e.key]}`} width={e.width} height={e.height} loading="lazy" className="h-auto w-full object-cover" />
                      <figcaption className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{label}</figcaption>
                    </figure>
                  ))}
                </div>
                <p className="p-4 text-sm leading-relaxed text-muted-foreground">{copy.examples[e.key]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>}

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{itemsHeading}</h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {items.map(({ title, body }) => (
              <li key={title} className="flex gap-3">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{copy.stepsHeading}</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {copy.steps.map(({ title, body }, i) => (
              <li key={title} className="rounded-2xl border border-border/60 p-5">
                <p className="mb-1 text-xs font-medium text-primary">0{i + 1}</p>
                <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
          <Button asChild className="mt-6 rounded-full bg-foreground text-background">
            <Link href={launchHref}>
              {copy.cta} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{copy.faqHeading}</h2>
          <div className="space-y-5">
            {copy.faq.map((f) => (
              <div key={f.q}>
                <h3 className="mb-1 font-semibold text-foreground">{f.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href={translatedOrEnglish("/pricing", locale)} className="text-primary underline-offset-4 hover:underline">
              {copy.pricingLink}
            </Link>
            <Link href={englishHref} hrefLang="en" className="text-muted-foreground underline-offset-4 hover:underline">
              {copy.english}
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
