import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { unavailableReason } from "@/lib/headswap-pro-server";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { Compare, FilmFacade, Reveal, TeaserVideo, type CompareItem } from "./launch-client";
import { HS_COPY, HS_TRANSLATED, type HsLocale } from "./copy";

/**
 * The launch page for Nano HeadSwap Pro, laid out like a product keynote: a full-screen opening, a few big
 * statements, the launch film, side-by-side proof, then the plain facts and the price. One layout for every
 * language; the words are in ./copy.ts. English is /headswap-pro, the others /<locale>/headswap-pro.
 *
 * Weight is the design constraint, because the launch film is long: the film itself is a picture and a button
 * until someone presses play (YouTube is not contacted before that), the opening loop is a 700 KB silent clip that
 * starts only after the page is done loading and never on slow or data-saving connections, the compare images
 * are lazy-loaded WebP, and there is no animation library or web font.
 *
 * The tool itself is the static page at /headswap-pro/index.html (English only). Until the gateway is deployed and
 * HEADSWAP_PRO=1 is set, the button says "opening soon" instead of linking to a tool that cannot run.
 */

const BASE = "https://nanopocket.ai";
const PATH = "/headswap-pro";
const FILM_ID = "qy2w3wVwZq0";
const FILM_URL = `https://youtu.be/${FILM_ID}`;

const pathFor = (locale: HsLocale) => (locale === "en" ? PATH : `/${locale}${PATH}`);

export function headswapMetadata(locale: HsLocale): Metadata {
  const c = HS_COPY[locale];
  const url = `${BASE}${pathFor(locale)}`;
  const og = [{ url: "/headswap-pro/og.jpg", width: 1200, height: 630, alt: `${HEADSWAP_PRO_NAME}: ${c.tagline}` }];
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: pathFor(locale), languages: hreflangAlternates(BASE, PATH, HS_TRANSLATED) },
    openGraph: { images: og, type: "website", url, title: c.metaTitle, description: c.metaDescription, locale: locale.replace("-", "_") },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDescription, images: ["/headswap-pro/og.jpg"] },
  };
}

function YouTubeMark() {
  return (
    <svg width="20" height="14" viewBox="0 0 28 20" aria-hidden="true" className="shrink-0">
      <rect width="28" height="20" rx="5" fill="#ff0033" />
      <path d="M11 6l7 4-7 4z" fill="#fff" />
    </svg>
  );
}

function Cta({ open, label, soon, className = "" }: { open: boolean; label: string; soon: string; className?: string }) {
  return open ? (
    <a href="/headswap-pro/index.html" className={`inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-black transition hover:bg-white/90 ${className}`}>
      {label} <ArrowRight className="h-4 w-4" />
    </a>
  ) : (
    <span className={`inline-flex rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white/70 ${className}`}>{soon}</span>
  );
}

export function HeadSwapLaunchPage({ locale }: { locale: HsLocale }) {
  const c = HS_COPY[locale];
  const open = unavailableReason() === null;
  const usd = `$${(HEADSWAP_PRO_CREDITS_PER_IMAGE / 100).toFixed(2)}`;

  // Two of the four examples in the worker team's comparison. The other two use real film posters and are not shown (see docs/headswap-pro.md).
  const examples: CompareItem[] = [
    {
      id: "occlusion",
      ...c.examples.occlusion,
      ratio: "3 / 2",
      original: "/headswap-pro/compare/ex2_body.webp",
      earlier: "/headswap-pro/compare/ex2_v1.webp",
      pro: "/headswap-pro/compare/ex2_v2.webp",
      face: "/headswap-pro/compare/ex2_face.webp",
    },
    {
      id: "studio",
      ...c.examples.studio,
      ratio: "3 / 4",
      original: "/headswap-pro/compare/ex3_body.webp",
      earlier: "/headswap-pro/compare/ex3_v1.webp",
      pro: "/headswap-pro/compare/ex3_v2.webp",
      face: "/headswap-pro/compare/ex3_face.webp",
    },
  ];

  // The two group photos from the worker team's newer set. The earlier head swap took one face per photo, so there is no "earlier" result.
  const groupExamples: CompareItem[] = [
    {
      id: "five-friends",
      ...c.examples.fiveFriends,
      ratio: "3 / 2",
      original: "/headswap-pro/compare/grp1_body.webp",
      pro: "/headswap-pro/compare/grp1_pro.webp",
      face: "/headswap-pro/compare/grp_face.webp",
      facePosition: "50% 25%",
    },
    {
      id: "huddle",
      ...c.examples.huddle,
      ratio: "3 / 2",
      original: "/headswap-pro/compare/grp2_body.webp",
      pro: "/headswap-pro/compare/grp2_pro.webp",
      face: "/headswap-pro/compare/grp_face.webp",
      facePosition: "50% 25%",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: HEADSWAP_PRO_NAME,
      url: `${BASE}${pathFor(locale)}`,
      description: c.metaDescription,
      inLanguage: locale,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (web browser)",
      publisher: { "@type": "Organization", name: "NanoPocket", url: BASE },
      offers: {
        "@type": "Offer",
        price: (HEADSWAP_PRO_CREDITS_PER_IMAGE / 100).toFixed(2),
        priceCurrency: "USD",
        description: "Per image, paid in credits. New accounts get free credits.",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <main lang={locale} className="relative min-h-screen bg-black text-white">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />

      {/* 1. The opening */}
      <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden px-6 pb-16 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,160,255,0.22),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl pt-24">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.5em] text-white/65">{c.kicker}</p>
          <h1 className="text-balance text-6xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-8xl lg:text-9xl">
            Head<span className="text-white/45">Swap</span> Pro
          </h1>
          <p className="mt-8 text-2xl font-light tracking-[0.4em] text-white/90 sm:text-3xl">{c.tagline.toUpperCase()}</p>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">{c.heroLine}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Cta open={open} label={c.ctaOpen} soon={c.ctaSoon} />
            <a href={FILM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline">
              <YouTubeMark /> {c.watchFilm}
            </a>
          </div>
          <p className="mt-6 text-xs tracking-wide text-white/50">{c.heroNote}</p>
          {c.toolNote && <p className="mt-2 text-xs tracking-wide text-white/40">{c.toolNote}</p>}
        </div>
      </section>

      {/* 1b. The film's own pictures, clear, in a frame under the headline */}
      <section className="px-6 pb-24 sm:pb-32">
        <div className="relative mx-auto aspect-video max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-[0_30px_120px_-30px_rgba(120,160,255,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/headswap-pro/teaser-poster.webp" alt={c.teaserAlt} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <TeaserVideo src="/headswap-pro/teaser.mp4" poster="/headswap-pro/teaser-poster.webp" />
        </div>
      </section>

      {/* 2. The statements */}
      <section className="px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-4xl space-y-10 text-center sm:space-y-14">
          <Reveal>
            <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{c.statementA}<br /><span className="text-white/45">{c.statementB}</span></h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-white/65 sm:text-2xl">{c.statementBody}</p>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-sm uppercase tracking-[0.35em] text-white/45">{c.statementTags}</p>
          </Reveal>
        </div>
      </section>

      {/* 3. The film */}
      <section id="film" className="px-6 pb-28 sm:pb-40">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.5em] text-white/55">{c.filmKicker}</p>
            <FilmFacade id={FILM_ID} poster="/headswap-pro/film-poster.webp" title={c.filmTitle} badge={c.filmBadge} playLabel={c.playLabel} />
            <div className="mt-6 flex flex-col items-center gap-2">
              <a
                href={FILM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <YouTubeMark /> {c.watchOnYouTube}
              </a>
              <p className="text-xs text-white/50">{FILM_URL.replace("https://", "")} · {c.filmLength}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3b. Picking one head in a crowd, and steep angles */}
      <section className="border-t border-white/10 px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="mb-5 text-center text-[11px] font-medium uppercase tracking-[0.5em] text-white/55">{c.groupKicker}</p>
            <h2 className="text-balance text-center text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {c.groupTitleA} <span className="text-white/45">{c.groupTitleB}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">{c.groupIntro}</p>
          </Reveal>
          <div className="mt-16 space-y-24">
            {groupExamples.map((ex) => (
              <Reveal key={ex.id}>
                <Compare item={ex} labels={c.compare} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The proof */}
      <section className="border-t border-white/10 px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-balance text-center text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {c.proofTitleA} <span className="text-white/45">{c.proofTitleB}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">{c.proofIntro}</p>
          </Reveal>
          <div className="mt-16 space-y-24">
            {examples.map((ex) => (
              <Reveal key={ex.id}>
                <Compare item={ex} labels={c.compare} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. The facts */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2">
          {c.facts.map((f, i) => (
            <Reveal key={f.k} delay={i * 80}>
              <h3 className="text-base font-semibold uppercase tracking-widest text-white">{f.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{f.v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. How it works */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-sm font-medium uppercase tracking-[0.4em] text-white/60">{c.stepsHeading}</h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {c.steps.map((s, i) => (
              <li key={s.title} className="border-l border-white/20 pl-6">
                <p className="text-4xl font-extrabold text-white/25">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg font-semibold uppercase tracking-wide">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. The close */}
      <section className="border-t border-white/10 px-6 py-28 text-center sm:py-36">
        <Reveal>
          <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{c.tagline}</h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-white/60">{c.closeBody}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Cta open={open} label={c.ctaOpen} soon={c.ctaSoon} />
            <Link href={open ? "/credits" : "/contact"} className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
              {open ? c.packsLink : c.wantInLink}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 8. Questions */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-sm font-medium uppercase tracking-[0.4em] text-white/60">{c.faqHeading}</h2>
          <div className="space-y-7">
            {c.faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-semibold text-white">{f.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 text-center text-xs text-white/40">
            {c.footerMadeBy} {c.footerSee} <Link href="/face-studio" className="underline underline-offset-4">Nano FaceStudio Online</Link> {c.footerAnd}{" "}
            <Link href="/apps" className="underline underline-offset-4">{c.footerDesktop}</Link>{c.footerEnd}
          </p>
          <p className="mt-4 text-center text-xs text-white/40">
            {[
              { l: "en" as const, label: "English" },
              { l: "zh-CN" as const, label: "简体中文" },
              { l: "ja" as const, label: "日本語" },
            ].map(({ l, label }, i) => (
              <span key={l}>
                {i > 0 && " · "}
                {l === locale ? <span className="text-white/70">{label}</span> : <Link href={pathFor(l)} hrefLang={l} className="underline underline-offset-4 hover:text-white">{label}</Link>}
              </span>
            ))}
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
