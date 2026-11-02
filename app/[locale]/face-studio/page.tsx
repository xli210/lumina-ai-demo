import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ToolLanding } from "../tool-landing";
import { hreflangAlternates, isAppLocale, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { fillCopy, pageCopy } from "@/lib/i18n/page-copy";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_STUDIO_FULL_NAME, FACE_STUDIO_URL, FACE_SWAP_CREDITS, SIGNUP_FREE_SWAPS } from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES } from "@/lib/facestudio";
import { FACE_STUDIO_OG, SHOWCASE } from "@/lib/face-studio-showcase";

// Nano FaceStudio Online in the other languages. The English page is app/face-studio/page.tsx; numbers come from the same
// constants it quotes, so a change there reaches every language.

const BASE = "https://nanopocket.ai";

const VALUES = { grant: SIGNUP_GRANT_CREDITS, swaps: SIGNUP_FREE_SWAPS, face: FACE_SWAP_CREDITS, max: FACESTUDIO_MAX_FACES };

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES[FACE_STUDIO_URL].includes(l);

async function copyFor(locale: AppLocale) {
  return fillCopy((await pageCopy(locale)).faceStudio, VALUES);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslated(locale)) return {};
  const c = await copyFor(locale);
  const path = `/${locale}${FACE_STUDIO_URL}`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, FACE_STUDIO_URL, TRANSLATED_PAGES[FACE_STUDIO_URL]) },
    openGraph: {
      type: "website",
      url: `${BASE}${path}`,
      title: c.title,
      description: c.description,
      locale: locale.replace("-", "_"),
      images: [{ url: `${BASE}${FACE_STUDIO_OG.src}` }],
    },
  };
}

export default async function LocalizedFaceStudioPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  const c = await copyFor(locale);

  return (
    <ToolLanding
      locale={locale}
      name={FACE_STUDIO_FULL_NAME}
      copy={c}
      launchHref="/face-studio/launch"
      englishHref={FACE_STUDIO_URL}
      examples={(["hero", "group"] as const).map((key) => ({
        key,
        before: SHOWCASE[key].before.src,
        after: SHOWCASE[key].after.src,
        width: SHOWCASE[key].after.width,
        height: SHOWCASE[key].after.height,
      }))}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: FACE_STUDIO_FULL_NAME,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          inLanguage: locale,
          url: `${BASE}/${locale}${FACE_STUDIO_URL}`,
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
