import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { FreeTierBlock } from "./free-tier-block";
import { HEAD_SWAP_COPY, HEAD_SWAP_MODIFIED, HEAD_SWAP_PATH } from "@/lib/head-swap-copy";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";

/** /head-swap and /pt-BR/head-swap: the same page in two languages. Copy is in lib/head-swap-copy.ts. */

const BASE = "https://nanopocket.ai";
type Lang = "en" | "pt-BR";

const pageUrl = (lang: Lang) => `${BASE}${lang === "en" ? "" : `/${lang}`}${HEAD_SWAP_PATH}`;

export function headSwapMetadata(lang: Lang): Metadata {
  const c = HEAD_SWAP_COPY[lang];
  return {
    title: c.title,
    description: c.description,
    keywords:
      lang === "en"
        ? ["ai head swap", "head swap online", "head swap with hair", "whole head swap", "video head swap", "photo head swap", "free head swap"]
        : ["troca de cabeça ia", "trocar cabeça online", "troca de cabeça com cabelo", "troca de cabeça em vídeo", "trocar cabeça em foto"],
    alternates: {
      canonical: pageUrl(lang),
      languages: hreflangAlternates(BASE, HEAD_SWAP_PATH, TRANSLATED_PAGES[HEAD_SWAP_PATH]),
    },
    openGraph: {
      type: "article",
      url: pageUrl(lang),
      title: c.title,
      description: c.description,
      images: [{ url: "/facestudio-v/media/cmp/hd2_best.jpg", alt: c.h1 }],
      locale: lang.replace("-", "_"),
    },
    other: { "article:modified_time": HEAD_SWAP_MODIFIED },
  };
}

const h2 = "mb-4 mt-12 text-2xl font-bold tracking-tight text-foreground";
const listItem = "ml-5 text-sm leading-relaxed text-muted-foreground";

export function HeadSwapPage({ lang }: { lang: Lang }) {
  const c = HEAD_SWAP_COPY[lang];
  const url = pageUrl(lang);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: c.h1,
      description: c.description,
      url,
      inLanguage: lang,
      dateModified: HEAD_SWAP_MODIFIED,
      author: { "@id": `${BASE}#organization` },
      publisher: { "@id": `${BASE}#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: c.howHeading,
      inLanguage: lang,
      step: c.steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
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
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{c.h1}</h1>
          <p className="text-base leading-relaxed text-muted-foreground">{c.answer}</p>
          <Link
            href="/auth/sign-up"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {c.cta}
          </Link>

          <h2 className={h2}>{c.toolsHeading}</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{c.toolHead.tool}</th>
                  <th className="px-4 py-3 font-medium">{c.toolHead.bestFor}</th>
                  <th className="px-4 py-3 font-medium">{c.toolHead.price}</th>
                  <th className="px-4 py-3 font-medium">{c.toolHead.output}</th>
                </tr>
              </thead>
              <tbody>
                {c.tools.map((t) => (
                  <tr key={t.name} className="border-b border-border/50 align-top last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      <Link href={t.href} className="text-primary hover:underline">{t.name}</Link>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">{t.kind}</span>
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{t.bestFor}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.price}</td>
                    <td className="px-4 py-3 text-foreground">{t.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className={h2}>{c.vsHeading}</h2>
          <ul className="space-y-2">
            {c.vs.map((v) => (
              <li key={v.term} className={`${listItem} list-disc`}>
                <strong className="text-foreground">{v.term}</strong>: {v.text}
              </li>
            ))}
          </ul>

          <h2 className={h2}>{c.howHeading}</h2>
          <ol className="space-y-2">
            {c.steps.map((s) => (
              <li key={s} className={`${listItem} list-decimal`}>{s}</li>
            ))}
          </ol>

          <h2 className={h2}>{c.tipsHeading}</h2>
          <ul className="space-y-2">
            {c.tips.map((s) => (
              <li key={s} className={`${listItem} list-disc`}>{s}</li>
            ))}
          </ul>

          <h2 className={h2}>{c.diffusionHeading}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{c.diffusion}</p>
        </div>
      </article>

      <FreeTierBlock lang={lang} />

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className={h2}>{c.faqHeading}</h2>
          <div className="space-y-5">
            {c.faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-semibold text-foreground">{f.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              {c.more}{" "}
              <Link href="/video-head-swap" className="font-medium text-primary hover:underline">/video-head-swap</Link>
              {" · "}
              <Link href="/blog/diffusion-head-swap-vs-gan-face-swap" className="font-medium text-primary hover:underline">Diffusion Head Swap vs GAN Face Swap</Link>
            </p>
            <p className="mt-3">{c.consent}</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
