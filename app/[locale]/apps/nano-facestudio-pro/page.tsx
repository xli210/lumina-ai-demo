import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ToolLanding } from "../../tool-landing";
import { hreflangAlternates, isAppLocale, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { pageCopy } from "@/lib/i18n/page-copy";

// Nano FaceStudio Pro in the other languages, shorter than the English page (app/apps/nano-facestudio-pro/page.tsx). Prices stay on the English pages.

const BASE = "https://nanopocket.ai";
const PATH = "/apps/nano-facestudio-pro";
const NAME = "Nano FaceStudio Pro";
const IMG = "/images/nano-facestudio";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES[PATH].includes(l);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslated(locale)) return {};
  const c = (await pageCopy(locale)).pro;
  const path = `/${locale}${PATH}`;
  return {
    title: { absolute: c.title },
    description: c.description,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, PATH, TRANSLATED_PAGES[PATH]) },
    openGraph: { type: "website", url: `${BASE}${path}`, title: c.title, description: c.description, locale: locale.replace("-", "_") },
  };
}

export default async function LocalizedFaceStudioProPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  const c = (await pageCopy(locale)).pro;

  return (
    <ToolLanding
      locale={locale}
      name={NAME}
      copy={c}
      launchHref="/download#nano-facestudio-pro"
      englishHref={PATH}
      wideExamples
      examples={[
        { key: "protect", before: `${IMG}/face-swap-protect-before.png`, after: `${IMG}/face-swap-protect-after.png`, width: 1920, height: 1028 },
        { key: "expression", before: `${IMG}/expression-sliders-1.png`, after: `${IMG}/expression-sliders-2.png`, width: 1920, height: 1028 },
        { key: "mask", before: `${IMG}/mask-edit-1.png`, after: `${IMG}/mask-edit-3.png`, width: 1918, height: 1028 },
      ]}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: NAME,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Windows 10/11",
          inLanguage: locale,
          url: `${BASE}/${locale}${PATH}`,
          description: c.description,
          publisher: { "@id": `${BASE}#organization` },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: locale,
          mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
      ]}
    />
  );
}
