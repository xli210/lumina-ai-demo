import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";
import { SKIN_TEST_COPY, type SkinTestLocale } from "./copy";

/**
 * A skin-texture test of NanoPocket's diffusion models against tools anyone can run without an account,
 * made on 2026-11-25. Every number here was measured on the downloaded outputs (scripts and full files in
 * exports-private/quality-test-2026-11-25/, not public). Only HeadSwap Pro and the video models other than
 * Fast are diffusion models (owner, 2026-11-25), so only those are tested. Do not add a tool or a figure
 * that was not run and measured the same way; re-run the whole test before changing a number.
 *
 * One layout for English (./page.tsx, /data/face-swap-skin-test) and Portuguese (app/[locale]/data/face-swap-skin-test,
 * /pt-BR/data/face-swap-skin-test); the words are in ./copy.tsx.
 */

export const SKIN_TEST_PATH = "/data/face-swap-skin-test";
const BASE = "https://nanopocket.ai";
const TESTED = "2026-11-25";
const MEDIA = "/quality-test/2026-11";

const pathFor = (locale: SkinTestLocale) => (locale === "en" ? SKIN_TEST_PATH : `/${locale}${SKIN_TEST_PATH}`);

export function skinTestMetadata(locale: SkinTestLocale): Metadata {
  const c = SKIN_TEST_COPY[locale];
  const path = pathFor(locale);
  return {
    title: { absolute: `${c.title} | NanoPocket` },
    description: c.description,
    keywords: c.keywords,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, SKIN_TEST_PATH, TRANSLATED_PAGES[SKIN_TEST_PATH]) },
    openGraph: {
      type: "article",
      url: `${BASE}${path}`,
      title: c.title,
      description: c.description,
      locale: locale.replace("-", "_"),
      images: [{ url: `${MEDIA}/p2_headswap_pro.webp`, width: 600, height: 533, alt: c.ogAlt }],
    },
  };
}

const PHOTO_TOOLS = ["headswap_pro", "facefusion_hyperswap1b", "roop_inswapper128_gfpgan", "magichour_free"];

/** Skin detail: std of the Laplacian on left cheek, right cheek, forehead, every image resampled to 2080 px wide. */
const PHOTO_PAIRS: {
  n: number;
  target: [number, number, number];
  scores: Record<string, [number, number, number]>;
}[] = [
  {
    n: 1,
    target: [32.0, 29.9, 29.8],
    scores: {
      headswap_pro: [21.8, 20.9, 20.3],
      facefusion_hyperswap1b: [10.0, 9.3, 9.8],
      roop_inswapper128_gfpgan: [3.0, 3.1, 5.6],
      magichour_free: [1.4, 1.3, 1.2],
    },
  },
  {
    n: 2,
    target: [15.6, 11.7, 16.1],
    scores: {
      headswap_pro: [17.7, 16.3, 28.9],
      facefusion_hyperswap1b: [5.1, 4.0, 5.9],
      roop_inswapper128_gfpgan: [2.5, 2.3, 4.6],
    },
  },
  {
    n: 3,
    target: [24.2, 22.5, 28.5],
    scores: {
      headswap_pro: [25.3, 24.1, 21.5],
      facefusion_hyperswap1b: [7.9, 7.5, 9.9],
      roop_inswapper128_gfpgan: [5.1, 4.7, 7.8],
    },
  },
];

/** Averages over every 8th frame of a 4-second clip, face region resampled to 600 px wide. */
const VIDEO_CLIPS: {
  n: number;
  frames: number;
  original: [number, number, number];
  neo: [number, number, number];
  magichour: [number, number, number];
}[] = [
  { n: 1, frames: 7, original: [5.8, 2.7, 2.6], neo: [7.0, 4.3, 4.1], magichour: [1.8, 1.1, 1.0] },
  { n: 2, frames: 12, original: [2.8, 3.0, 2.3], neo: [2.9, 3.3, 1.9], magichour: [1.7, 1.5, 1.0] },
];

const avg = (v: [number, number, number]) => ((v[0] + v[1] + v[2]) / 3).toFixed(1);

function articleJsonLd(locale: SkinTestLocale) {
  const c = SKIN_TEST_COPY[locale];
  const url = `${BASE}${pathFor(locale)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: c.title,
    description: c.description,
    url,
    inLanguage: locale,
    datePublished: TESTED,
    dateModified: TESTED,
    author: { "@id": "https://nanopocket.ai#organization" },
    publisher: { "@id": "https://nanopocket.ai#organization" },
    image: `${BASE}${MEDIA}/p2_headswap_pro.webp`,
    about: ["AI face swap", "AI head swap", "skin texture", "image quality"],
  };
}

function Figure({ src, caption, full, fullLabel }: { src: string; caption: string; full?: string; fullLabel?: string }) {
  return (
    <figure className="min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} loading="lazy" className="w-full rounded-lg border border-border" />
      <figcaption className="mt-1 text-xs leading-snug text-muted-foreground">
        {caption}
        {full && (
          <>
            {" · "}
            <a href={full} className="text-primary hover:underline">{fullLabel}</a>
          </>
        )}
      </figcaption>
    </figure>
  );
}

export function SkinTestPage({ locale }: { locale: SkinTestLocale }) {
  const c = SKIN_TEST_COPY[locale];
  const tools = PHOTO_TOOLS.map((key) => ({ key, ...c.tools[key] }));
  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(locale)) }} />
      <Navbar />
      <article lang={locale} className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        <p className="text-sm text-muted-foreground">{c.byline(TESTED)}</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{c.title}</h1>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 text-foreground">
          <h2 className="text-lg font-semibold">{c.shortAnswerH}</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{c.shortAnswer}</p>
        </section>

        <section id="setup" className="mt-10 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">{c.setupH}</h2>
          <p>{c.setupPhotos}</p>
          <ul className="list-disc space-y-1 pl-5">
            {tools.map((t) => (
              <li key={t.key}>
                <strong className="text-foreground">{t.name}</strong>: {t.detail}
              </li>
            ))}
          </ul>
          <p>{c.setupVideo}</p>
          <p>{c.setupHeadVsFace}</p>
        </section>

        <section id="photo" className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">{c.photoH}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.photoIntro}</p>
          {PHOTO_PAIRS.map((pair) => {
            const pairTools = tools.filter((t) => pair.scores[t.key]);
            return (
              <div key={pair.n} className="mt-8">
                <h3 className="font-semibold text-foreground">{c.pairLabels[pair.n - 1]}</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <Figure src={`${MEDIA}/p${pair.n}_target.webp`} caption={c.photoBefore} fullLabel={c.fullSize} full={`${MEDIA}/p${pair.n}_target_full.webp`} />
                  <Figure src={`${MEDIA}/p${pair.n}_reference.webp`} caption={c.newFace} fullLabel={c.fullSize} full={`${MEDIA}/p${pair.n}_reference_full.webp`} />
                  {pairTools.map((t) => (
                    <Figure key={t.key} src={`${MEDIA}/p${pair.n}_${t.key}.webp`} caption={t.name} fullLabel={c.fullSize} full={`${MEDIA}/p${pair.n}_${t.key}_full.webp`} />
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{c.closeup}</p>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <Figure src={`${MEDIA}/p${pair.n}_target_zoom.webp`} caption={c.photoBefore} />
                  {pairTools.map((t) => (
                    <Figure key={t.key} src={`${MEDIA}/p${pair.n}_${t.key}_zoom.webp`} caption={t.name} />
                  ))}
                </div>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="px-4 py-2 font-medium">{c.thSkin}</th>
                        <th className="px-4 py-2 text-right font-medium">{c.thLeft}</th>
                        <th className="px-4 py-2 text-right font-medium">{c.thRight}</th>
                        <th className="px-4 py-2 text-right font-medium">{c.thForehead}</th>
                        <th className="px-4 py-2 text-right font-medium">{c.thAverage}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[{ name: c.photoBeforeRow, v: pair.target }, ...pairTools.map((t) => ({ name: t.name, v: pair.scores[t.key] }))].map((row) => (
                        <tr key={row.name} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-2 text-foreground">{row.name}</td>
                          {row.v.map((x, i) => (
                            <td key={i} className="px-4 py-2 text-right tabular-nums text-foreground">{x.toFixed(1)}</td>
                          ))}
                          <td className="px-4 py-2 text-right font-medium tabular-nums text-foreground">{avg(row.v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>

        <section id="video" className="mt-14">
          <h2 className="text-xl font-semibold text-foreground">{c.videoH}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.videoIntro}</p>
          {VIDEO_CLIPS.map((clip) => (
            <div key={clip.n} className="mt-8">
              <h3 className="font-semibold text-foreground">{c.clipLabels[clip.n - 1]}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(["original", "neo", "magichour_free"] as const).map((k) => ({ k, name: c.videoNames[k] })).map((v) => (
                  <figure key={v.k} className="min-w-0">
                    <video src={`${MEDIA}/v${clip.n}_${v.k}.mp4`} controls muted loop playsInline preload="metadata" className="w-full rounded-lg border border-border" />
                    <figcaption className="mt-1 text-xs text-muted-foreground">{v.name}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[3fr_1fr]">
                <Figure src={`${MEDIA}/v${clip.n}_frame48.webp`} caption={c.frameCaption} />
                <Figure src={`${MEDIA}/v${clip.n}_reference.webp`} caption={c.newFaceAi} />
              </div>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">{c.thSkinFrames(clip.frames)}</th>
                      <th className="px-4 py-2 text-right font-medium">{c.thLeft}</th>
                      <th className="px-4 py-2 text-right font-medium">{c.thRight}</th>
                      <th className="px-4 py-2 text-right font-medium">{c.thForehead}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: c.rowOriginal, v: clip.original },
                      { name: c.rowNeo, v: clip.neo },
                      { name: c.rowMagicHour, v: clip.magichour },
                    ].map((row) => (
                      <tr key={row.name} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-2 text-foreground">{row.name}</td>
                        {row.v.map((x, i) => (
                          <td key={i} className="px-4 py-2 text-right tabular-nums text-foreground">{x.toFixed(1)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        <section id="why" className="mt-14 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">{c.whyH}</h2>
          {c.why.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section id="limits" className="mt-12 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">{c.limitsH}</h2>
          {c.limits.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section className="mt-12 flex flex-wrap gap-3">
          <Link href={c.hrefHeadSwap} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {c.ctaHeadSwap}
          </Link>
          <Link href={c.hrefVideo} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            {c.ctaNeo}
          </Link>
          <Link href="/data/face-swap-stats" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            {c.ctaStats}
          </Link>
        </section>
      </article>
      <Footer />
    </main>
  );
}
