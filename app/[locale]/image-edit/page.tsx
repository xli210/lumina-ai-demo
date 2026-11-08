import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ToolLanding } from "../tool-landing";
import { hreflangAlternates, isAppLocale, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { fillCopy, pageCopy } from "@/lib/i18n/page-copy";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { SPOTEDIT_EXAMPLES, SPOTEDIT_HERO } from "@/lib/image-edit-examples";
import { IMAGEEDIT_NAME, IMAGEEDIT_PRICE_RANGE } from "@/lib/imageedit";

// SpotEdit in the other languages. The English page is app/image-edit/page.tsx.

const BASE = "https://nanopocket.ai";
const PATH = "/image-edit";
const EXAMPLES = [SPOTEDIT_HERO, ...SPOTEDIT_EXAMPLES.filter((e) => ["group", "photobomber", "suit"].includes(e.id))];

const VALUES = { grant: SIGNUP_GRANT_CREDITS, edit: IMAGEEDIT_PRICE_RANGE };

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES[PATH].includes(l);

async function copyFor(locale: AppLocale) {
  return fillCopy((await pageCopy(locale)).imageEdit, VALUES);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslated(locale)) return {};
  const c = await copyFor(locale);
  const path = `/${locale}${PATH}`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, PATH, TRANSLATED_PAGES[PATH]) },
    openGraph: { type: "website", url: `${BASE}${path}`, title: c.title, description: c.description, locale: locale.replace("-", "_") },
  };
}

export default async function LocalizedImageEditPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  const c = await copyFor(locale);

  return (
    <ToolLanding
      locale={locale}
      name={IMAGEEDIT_NAME}
      copy={c}
      launchHref="/image-edit/launch"
      englishHref={PATH}
      examples={EXAMPLES.map((e) => ({
        key: e.id,
        before: e.before,
        after: e.after,
        width: e.width,
        height: e.height,
      }))}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: IMAGEEDIT_NAME,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
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
