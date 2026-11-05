import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { Button } from "@/components/ui/button";
import { hreflangAlternates, isAppLocale, translatedOrEnglish, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { fillCopy, pageCopy, type VideoPageCopy } from "@/lib/i18n/page-copy";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACESTUDIO_V_ENGINE_VERSION, FACESTUDIO_V_LAUNCH, FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";
import { VIDEO_EXAMPLES_PATH, isoDuration, videoExample, videoExamplePath } from "@/lib/video-examples";
import ZhVideoFaceSwapPage, { metadata as zhMetadata } from "./zh-page";
import { New25Section } from "./new25-section";

// Video FaceSwap Online in the other languages. The English page is static HTML (public/facestudio-v/index.html); Chinese
// has its own page (./zh-page.tsx), which also carries the price and refund detail the others link to instead.

const BASE = "https://nanopocket.ai";
const LAST_VERIFIED = "2026-11-01";

const PAIRS = ["dance", "pitch", "group_sleeves", "smoke", "sun"];
const PRECISION = ["angle", "hand"];
const CLIPS = ["profile-turn", "hand-glasses", "arm-across", "head-back-hands", "profile-back"];

const VALUES = { grant: SIGNUP_GRANT_CREDITS, version: FACESTUDIO_V_ENGINE_VERSION, name: FACESTUDIO_V_NAME, date: LAST_VERIFIED };

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES[FACESTUDIO_V_PAGE].includes(l);

async function copyFor(locale: AppLocale): Promise<VideoPageCopy> {
  return fillCopy((await pageCopy(locale)).video as VideoPageCopy, VALUES);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "zh-CN") return zhMetadata;
  if (!isTranslated(locale)) return {};
  const c = await copyFor(locale);
  const path = `/${locale}${FACESTUDIO_V_PAGE}`;
  return {
    title: { absolute: `${c.title} | NanoPocket` },
    description: c.description,
    keywords: c.keywords,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, FACESTUDIO_V_PAGE, TRANSLATED_PAGES[FACESTUDIO_V_PAGE]) },
    openGraph: {
      type: "website",
      url: `${BASE}${path}`,
      title: c.title,
      description: c.description,
      locale: locale.replace("-", "_"),
      images: [{ url: `${BASE}/facestudio-v/media/xc/profile_turn_poster.jpg` }],
    },
  };
}

export default async function LocalizedVideoFaceSwapPage({ params }: PageProps) {
  const { locale } = await params;
  if (locale === "zh-CN") return <ZhVideoFaceSwapPage />;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  const c = await copyFor(locale);
  const pageUrl = `${BASE}/${locale}${FACESTUDIO_V_PAGE}`;
  const clips = CLIPS.map((slug) => ({ slug, ...c.clips[slug], v: videoExample(slug) })).filter((x) => x.v);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: FACESTUDIO_V_NAME,
      softwareVersion: FACESTUDIO_V_VERSION,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      inLanguage: locale,
      url: pageUrl,
      description: c.description,
      publisher: { "@id": `${BASE}#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    ...clips.slice(0, 1).map(({ title, body, v }) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: title,
      description: body,
      thumbnailUrl: [`${BASE}${v!.thumbnailUrl}`],
      contentUrl: `${BASE}${v!.contentUrl}`,
      uploadDate: v!.uploadDate,
      duration: isoDuration(v!.durationSeconds),
      inLanguage: locale,
    })),
  ];

  return (
    <main lang={locale} className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />

      <section className="px-6 pt-28 pb-12 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-medium tracking-widest text-primary">
            {FACESTUDIO_V_NAME} · {c.kicker}
          </p>
          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{c.h1}</h1>
          <p className="mb-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">{c.lead1}</p>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">{c.lead2}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background">
              <Link href={FACESTUDIO_V_LAUNCH}>
                {c.ctaOpen} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/blog/how-to-swap-a-face-in-a-video" hrefLang="en">{c.ctaGuide}</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{c.accountNote}</p>
        </div>
      </section>

      <New25Section c={c.v25} original={c.before} pricingHref={translatedOrEnglish("/pricing", locale)} pricingLabel={c.topupPricing} />

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">{c.newHeading}</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{c.newBody}</p>
          <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.features.map(({ tag, title, body }) => (
              <li key={tag} className="border-t border-border/60 pt-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">{tag}</p>
                <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PAIRS.map((slug) => (
              <li key={slug} className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                <div className="grid grid-cols-1 gap-1 bg-black sm:grid-cols-2">
                  {[["before", c.before], ["after", FACESTUDIO_V_ENGINE_VERSION]].map(([side, label]) => (
                    <figure key={side} className="relative m-0">
                      <video
                        src={`/facestudio-v/media/v2/${slug}_${side}.mp4`}
                        poster={`/facestudio-v/media/v2/${slug}_${side}.jpg`}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full bg-black object-cover"
                      />
                      <figcaption className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{label}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{c.pairs[slug]}</h3>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{c.pairsNote}</p>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">{c.precisionHeading}</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{c.precisionBody}</p>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRECISION.map((slug) => (
              <li key={slug}>
                <div className="grid grid-cols-1 gap-1 overflow-hidden rounded-2xl bg-black sm:grid-cols-2">
                  {[["before", c.beforeTwo], ["after", FACESTUDIO_V_ENGINE_VERSION]].map(([side, label]) => (
                    <figure key={side} className="relative m-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/facestudio-v/media/v2/prec_${slug}_${side}.jpg?v=2`} alt={`${label}: ${c.precision[slug].title}`} loading="lazy" className="aspect-square w-full object-cover" />
                      <figcaption className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{label}</figcaption>
                    </figure>
                  ))}
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{c.precision[slug].title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.precision[slug].look}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">{c.clipsHeading}</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {c.clipsBody}
            <Link href={VIDEO_EXAMPLES_PATH} hrefLang="en" className="ml-1 text-primary underline-offset-4 hover:underline">
              {c.clipsAll}
            </Link>
          </p>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {clips.map(({ slug, title, body, v }) => (
              <li key={slug} className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                <video src={v!.contentUrl} poster={v!.thumbnailUrl} controls playsInline muted preload="none" className="aspect-video w-full bg-black" />
                <div className="p-4">
                  <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <Link href={videoExamplePath(v!)} hrefLang="en" className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline">
                    {c.watchAlone}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{c.stepsHeading}</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {c.steps.map(({ title, body }, i) => (
              <li key={title} className="rounded-2xl border border-border/60 p-5">
                <p className="mb-1 text-xs font-medium text-primary">0{i + 1}</p>
                <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{c.compareHeading}</h2>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">{c.compareCols[0]}</th>
                  <th className="px-4 py-3">{c.compareCols[1]}</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {c.compareRows.map((r) => (
                  <tr key={r.label} className="border-t border-border/60">
                    <td className="px-4 py-3 font-medium text-foreground">{r.label}</td>
                    <td className="px-4 py-3">{r.face}</td>
                    <td className="px-4 py-3">{r.head}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-muted/30 p-6">
          <h2 className="mb-3 text-xl font-bold text-foreground">{c.topupHeading}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {c.topupPoints.map((t) => (
              <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button asChild className="rounded-full bg-foreground text-background">
              <Link href={FACESTUDIO_V_LAUNCH}>{c.ctaMake} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Link href={translatedOrEnglish("/pricing", locale)} className="text-sm text-primary underline-offset-4 hover:underline">{c.topupPricing}</Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{c.faqHeading}</h2>
          <div className="space-y-5">
            {c.faq.map((f) => (
              <div key={f.q}>
                <h3 className="mb-1 font-semibold text-foreground">{f.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link href={FACESTUDIO_V_PAGE} hrefLang="en" className="underline-offset-4 hover:underline">{c.english}</Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
