import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { FreeTierBlock } from "./free-tier-block";
import {
  BEST_FREE_COPY,
  BEST_FREE_MODIFIED,
  BEST_FREE_PATH,
  NANOPOCKET_ROW,
  RIVALS,
  type SiteRow,
} from "@/lib/best-free-face-swap-copy";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";

/** /best-free-face-swap and /pt-BR/best-free-face-swap. Copy and every figure are in lib/best-free-face-swap-copy.ts. */

const BASE = "https://nanopocket.ai";
type Lang = "en" | "pt-BR";

const pageUrl = (lang: Lang) => `${BASE}${lang === "en" ? "" : `/${lang}`}${BEST_FREE_PATH}`;

export function bestFreeMetadata(lang: Lang): Metadata {
  const c = BEST_FREE_COPY[lang];
  return {
    title: { absolute: c.title },
    description: c.description,
    keywords:
      lang === "en"
        ? ["best free face swap", "free face swap online", "face swap no watermark", "free video face swap", "magic hour alternative", "remaker alternative", "pixnova alternative", "vidnoz alternative"]
        : ["trocar rosto online grátis", "melhor site troca de rosto", "troca de rosto grátis", "face swap grátis", "trocar rosto em vídeo grátis", "troca de rosto sem marca d'água"],
    alternates: {
      canonical: pageUrl(lang),
      languages: hreflangAlternates(BASE, BEST_FREE_PATH, TRANSLATED_PAGES[BEST_FREE_PATH]),
    },
    openGraph: {
      type: "article",
      url: pageUrl(lang),
      title: c.title,
      description: c.description,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: c.h1 }],
      locale: lang.replace("-", "_"),
    },
    other: { "article:modified_time": BEST_FREE_MODIFIED },
  };
}

const h2 = "mb-4 mt-12 text-2xl font-bold tracking-tight text-foreground";
const listItem = "ml-5 text-sm leading-relaxed text-muted-foreground";
const cell = "px-4 py-3 text-muted-foreground";

function Row({ r, lang, ours }: { r: SiteRow; lang: Lang; ours?: boolean }) {
  return (
    <tr className={`border-b border-border/50 align-top last:border-0 ${ours ? "bg-primary/5" : ""}`}>
      <th scope="row" className="px-4 py-3 text-left font-medium">
        {ours ? (
          <Link href={lang === "en" ? r.url : `/${lang}${r.url}`} className="text-primary hover:underline">{r.name}</Link>
        ) : (
          <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="text-foreground hover:underline">{r.name}</a>
        )}
      </th>
      <td className={cell}>{r.free[lang]}</td>
      <td className={cell}>{r.signUp[lang]}</td>
      <td className={cell}>{r.watermark[lang]}</td>
      <td className={cell}>{r.quality[lang]}</td>
      <td className={cell}>{r.faces[lang]}</td>
      <td className={cell}>{r.paid[lang]}</td>
    </tr>
  );
}

export function BestFreeFaceSwapPage({ lang }: { lang: Lang }) {
  const c = BEST_FREE_COPY[lang];
  const url = pageUrl(lang);
  const sites = [NANOPOCKET_ROW, ...RIVALS];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: c.h1,
      description: c.description,
      url,
      inLanguage: lang,
      dateModified: BEST_FREE_MODIFIED,
      author: { "@id": `${BASE}#organization` },
      publisher: { "@id": `${BASE}#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: c.tableHeading,
      inLanguage: lang,
      itemListElement: sites.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: s.url.startsWith("/") ? `${BASE}${lang === "en" ? "" : `/${lang}`}${s.url}` : s.url,
        description: `${c.head.free}: ${s.free[lang]}. ${c.head.signUp}: ${s.signUp[lang]}. ${c.head.watermark}: ${s.watermark[lang]}.`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <article className="px-6 pb-8 pt-28">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{c.h1}</h1>
          <p className="text-base leading-relaxed text-muted-foreground">{c.answer}</p>
          <Link
            href="/auth/sign-up"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {c.cta}
          </Link>

          <h2 className={h2}>{c.tableHeading}</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[56rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  {Object.values(c.head).map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row r={NANOPOCKET_ROW} lang={lang} ours />
                {RIVALS.map((r) => (
                  <Row key={r.name} r={r} lang={lang} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.tableNote}</p>

          <h2 className={h2}>{c.pickHeading}</h2>
          <ul className="space-y-2">
            {c.picks.map((p) => (
              <li key={p.term} className={`${listItem} list-disc`}>
                <strong className="text-foreground">{p.term}</strong>: {p.text}
              </li>
            ))}
          </ul>

          <h2 className={h2}>{c.honestHeading}</h2>
          <ul className="space-y-2">
            {c.honest.map((s) => (
              <li key={s} className={`${listItem} list-disc`}>{s}</li>
            ))}
          </ul>
        </div>
      </article>

      <FreeTierBlock lang={lang} compareLink={false} />

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className={h2}>{c.faqHeading}</h2>
          <div className="space-y-5">
            {c.faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-semibold text-foreground">{f.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>

          <h2 className={h2}>{c.sourcesHeading}</h2>
          <p className="mb-3 text-sm text-muted-foreground">{c.sourcesNote}</p>
          <ul className="space-y-1">
            {RIVALS.flatMap((r) => r.sources).map((s) => (
              <li key={s} className={`${listItem} list-disc break-all`}>
                <a href={s} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">{s}</a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">{c.consent}</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
