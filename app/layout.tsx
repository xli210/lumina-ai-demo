import React from "react"
import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QuickStart } from "./components/quick-start";
import { LocalAppsNotice } from "./components/local-apps-notice";
import { AnalyticsEvents } from "./components/analytics-events";
import { FeedbackButton } from "./components/feedback-button";
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { demoAvailabilityEn } from "@/lib/demo-availability";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});
const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

// Search-engine and LLM verification codes are read from environment at build
// time. Setting one of these in the deploy environment activates the
// corresponding <meta> tag automatically; leaving it unset is a no-op so the
// site never ships with placeholder strings.
const verificationOther: Record<string, string | string[]> = {};
if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) {
  verificationOther["msvalidate.01"] =
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION) {
  verificationOther["baidu-site-verification"] =
    process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_360_SITE_VERIFICATION) {
  verificationOther["360-site-verification"] =
    process.env.NEXT_PUBLIC_360_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_SOGOU_SITE_VERIFICATION) {
  verificationOther["sogou_site_verification"] =
    process.env.NEXT_PUBLIC_SOGOU_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION) {
  verificationOther["naver-site-verification"] =
    process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION) {
  verificationOther["p:domain_verify"] =
    process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION;
}

export const metadata: Metadata = {
  metadataBase: new URL("https://nanopocket.ai"),
  title: {
    default: "NanoPocket — Local AI Face Swap, Face Edit & Try-On",
    template: "%s | NanoPocket",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_SITE_VERIFICATION,
    other: verificationOther,
  },
  description:
    "Local AI face swap, face editing and virtual try-on for Windows. Your photos and videos stay on your computer, with no subscription: free apps or a one-time license. Online tools are free to start with sign-up credits.",
  keywords: [
    "NanoPocket", "local AI", "generative AI", "offline AI",
    "Runway alternative", "ComfyUI alternative", "Flux local app",
    "LTX alternative", "Midjourney alternative offline",
    "Topaz alternative", "Pika alternative local", "Kling AI alternative", "Sora alternative local",
    "Black Forest Labs Flux app", "Stable Diffusion GUI", "SDXL local",
    "local AI video generation", "text to video local GPU", "image to video local",
    "offline AI image editor", "AI face swap desktop", "AI image upscaler offline",
    "AI video enhancement local", "text to image local GPU", "virtual try-on AI app",
    "best local AI app", "AI tools no subscription", "one-time purchase AI software",
    "private AI image generator", "no cloud AI video maker",
    "image generation", "video generation", "face swap", "image enhancement", "video enhancement",

    // Face swap — diffusion tech & local positioning
    "Nano FaceStudio Online", "Nano FaceStudio Pro", "free face swap", "free online face swap", "face swap free trial",
    "diffusion face swap", "stable diffusion face swap", "diffusion model face swap",
    "local face swap", "offline face swap", "private face swap", "GPU face swap",
    "video face swap AI", "image face swap AI", "best face swap AI",
    "InsightFace swapper", "inswapper alternative",
    // Face swap — named competitors ("best players")
    "Roop alternative", "Roop Unleashed alternative",
    "FaceFusion alternative", "Rope alternative", "Rope Live alternative",
    "Reactor face swap alternative", "Deep-Live-Cam alternative", "deepfacelive alternative",
    "DeepSwap alternative", "DeepFaceLab alternative", "SimSwap alternative",
    "Akool alternative", "HeyGen face swap alternative", "Reface alternative", "DeepBrain alternative",
  ],
  openGraph: {
    title: "NanoPocket — Local AI Face Swap, Face Edit & Try-On",
    description: "AI face swap, face editing and virtual try-on that run on your own GPU: your files stay on your computer and there is no subscription. Free apps or a one-time license, plus free in-browser demos.",
    url: "https://nanopocket.ai",
    siteName: "NanoPocket",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket — Local AI Creative Suite" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NanoPocket — Local AI Face Swap, Face Edit & Try-On",
    description: "AI face swap, face editing and virtual try-on that run on your own GPU: your files stay on your computer and there is no subscription. Free apps or a one-time license, plus free in-browser demos.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the active locale from the header that middleware writes (see
  // middleware.ts). Fallback to the default locale for any path that the
  // matcher excludes (static assets, /api/license, etc.).
  const h = await headers();
  const headerLocale = h.get("x-app-locale");
  const locale: AppLocale = isAppLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-Z02H06RX2X"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Z02H06RX2X');
            `,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${dmMono.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://nanopocket.ai#organization",
              name: "NanoPocket",
              alternateName: ["NanoPocket.ai", "NanoPocket AI", "Nano Pocket"],
              url: "https://nanopocket.ai",
              logo: {
                "@type": "ImageObject",
                url: "https://nanopocket.ai/og-image.jpg",
                width: 1200,
                height: 630,
              },
              image: "https://nanopocket.ai/og-image.jpg",
              slogan:
                "Local AI creative suite — GAN and diffusion models and more, on your GPU. No subscription, no cloud.",
              description:
                "NanoPocket builds local AI desktop apps for Windows (NVIDIA CUDA) and macOS (Apple Silicon Metal): face swap, image and video upscaling, image generation, video generation, portrait retouch, and virtual try-on. Every desktop app runs 100% on the user's GPU; pricing is one-time per product with no subscriptions.",
              disambiguatingDescription:
                "NanoPocket is an independent product company at nanopocket.ai. It is not affiliated with Nano Banana, nanobanana.ai, nano-banana.com, nanobnana, or any other Nano-prefixed website that wraps Google's Gemini 2.5 Flash Image API. NanoPocket's face-swap pipeline runs locally on GAN and diffusion models, not on Google's API.",
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  email: "tech@nanopocket.ai",
                  contactType: "technical support",
                  availableLanguage: ["English"],
                  areaServed: "Worldwide",
                },
                {
                  "@type": "ContactPoint",
                  email: "sales@nanopocket.ai",
                  contactType: "sales",
                  availableLanguage: ["English"],
                  areaServed: "Worldwide",
                },
              ],
              sameAs: [
                "https://discord.gg/bNfPjfUDAn",
                "https://x.com/NanoPocket_ai",
                "https://nanopocket.ai/about",
                "https://nanopocket.ai/trust",
                "https://nanopocket.ai/verify",
                "https://nanopocket.ai/.well-known/security.txt",
              ],
              knowsAbout: [
                "Local AI inference",
                "Diffusion models",
                "Generative AI for creative workflows",
                "AI face swap (diffusion identity stack)",
                "AI video generation",
                "AI image generation",
                "AI image upscaling (GAN upscaler)",
                "AI portrait retouch",
                "AI virtual try-on",
                "On-device GPU inference (NVIDIA CUDA, Apple Silicon Metal)",
                "Privacy-preserving AI",
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "NanoPocket app catalog",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Video FaceSwap Online 1.1.0",
                    url: "https://nanopocket.ai/facestudio-v",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano ImageEdit 2.0 Online",
                    url: "https://nanopocket.ai/image-edit",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano FaceStudio Pro 1.0",
                    url: "https://nanopocket.ai/apps/nano-facestudio-pro",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano ImageEnh Pro 3.0",
                    url: "https://nanopocket.ai/apps/nano-imageenh-pro",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano VideoEnhance",
                    url: "https://nanopocket.ai/apps/nano-videoenhance",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano VideoGen",
                    url: "https://nanopocket.ai/apps/nano-videogen",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano ImageEdit",
                    url: "https://nanopocket.ai/apps/nano-imageedit",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano FacialEdit",
                    url: "https://nanopocket.ai/apps/nano-facialedit",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano ImageTryon",
                    url: "https://nanopocket.ai/apps/nano-imagetryon",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano FaceSwap (legacy desktop)",
                    url: "https://nanopocket.ai/apps/nano-faceswap",
                  },
                ],
              },
              subjectOf: [
                {
                  "@type": "WebPage",
                  "@id": "https://nanopocket.ai/trust",
                  name: "Trust & Transparency",
                  url: "https://nanopocket.ai/trust",
                  description:
                    "Pricing terms, privacy summary, system requirements, security posture, known limitations, refund policy, subprocessor table, retention schedule, and external references.",
                },
                {
                  "@type": "PrivacyPolicy",
                  "@id": "https://nanopocket.ai/privacy",
                  name: "NanoPocket Privacy Policy",
                  url: "https://nanopocket.ai/privacy",
                  dateModified: "2026-05-29",
                  description:
                    "What we collect, why, where it goes, retention timelines, GDPR / CCPA rights, and online demo handling.",
                },
                {
                  "@type": "TermsOfService",
                  "@id": "https://nanopocket.ai/terms",
                  name: "NanoPocket Terms of Service",
                  url: "https://nanopocket.ai/terms",
                  dateModified: "2026-05-29",
                  description:
                    "License terms, billing, refunds, acceptable use, warranty disclaimer, limitation of liability, governing law.",
                },
                {
                  "@type": "WebPage",
                  "@id": "https://nanopocket.ai/security",
                  name: "NanoPocket Security & Vulnerability Disclosure",
                  url: "https://nanopocket.ai/security",
                  dateModified: "2026-05-29",
                  description:
                    "Coordinated disclosure timeline, scope, safe-harbor, code-signing status; mirrors /.well-known/security.txt (RFC 9116).",
                },
                {
                  "@type": "TechArticle",
                  "@id": "https://nanopocket.ai/verify",
                  name: "Verify NanoPocket — auditable build manifest & offline reproducibility",
                  url: "https://nanopocket.ai/verify",
                  dateModified: "2026-05-29",
                  description:
                    "Build manifest with SHA-256 checksums for every download, offline-execution reproducibility procedure, and Hugging Face commit IDs for every model in the pipeline.",
                },
                {
                  "@type": "WebPage",
                  "@id": "https://nanopocket.ai/community",
                  name: "NanoPocket Community & Independent Coverage",
                  url: "https://nanopocket.ai/community",
                  dateModified: "2026-05-29",
                  description:
                    "Live Discord widget pulled from Discord's API, an honest list of which third-party coverage exists today, and the reviewer / journalist contact track.",
                },
                {
                  "@type": "Article",
                  "@id": "https://nanopocket.ai/best-face-swap-app-2026",
                  name: "Best Face Swap App 2026 — Honest Ranking with Methodology",
                  url: "https://nanopocket.ai/best-face-swap-app-2026",
                  dateModified: "2026-05-29",
                  description:
                    "Methodology-first ranking of the best face swap apps in 2026 across desktop, web, mobile, open-source, and B2B API tiers, with explicit conflict-of-interest disclosure.",
                },
                {
                  "@type": "WebPage",
                  "@id": "https://nanopocket.ai/compare",
                  name: "NanoPocket comparisons hub",
                  url: "https://nanopocket.ai/compare",
                  dateModified: "2026-06-02",
                  description:
                    "Head-to-head comparisons of NanoPocket vs Reface, DeepSwap, FaceFusion, Akool, Magic Hour, and Nano Banana with full dimension tables.",
                },
                {
                  "@type": "AboutPage",
                  "@id": "https://nanopocket.ai/about",
                  name: "About NanoPocket",
                  url: "https://nanopocket.ai/about",
                  dateModified: "2026-06-02",
                  description:
                    "Brand identity, mission, and explicit disambiguation: NanoPocket is not Nano Banana, NanoBnana, nanobanana.ai, nano-banana.com, or any other Nano-prefixed third-party service.",
                },
                {
                  "@type": "TechArticle",
                  "@id": "https://nanopocket.ai/compare/nanopocket-vs-nano-banana",
                  name: "NanoPocket vs Nano Banana — they are different products",
                  url: "https://nanopocket.ai/compare/nanopocket-vs-nano-banana",
                  dateModified: "2026-06-02",
                  description:
                    "Disambiguation: NanoPocket (local desktop, GAN and diffusion models) is not Nano Banana (Google Gemini 2.5 Flash Image, cloud) and is not affiliated with nanobanana.ai, nano-banana.com, or nanobnana.",
                },
                {
                  "@type": "Article",
                  "@id": "https://nanopocket.ai/apps/nanoface-vivid",
                  name: "NanoFace Vivid — fix over-smoothed AI faces",
                  url: "https://nanopocket.ai/apps/nanoface-vivid",
                  dateModified: "2026-06-02",
                  description:
                    "Identity-locked face-detail restorer that fixes the plastic look left by Gemini 2.5 Flash Image (Nano Banana), Adobe Firefly, Roop, FaceFusion, and cloud face-swap services. Available as an online demo and as the Face Vivid tool in Nano FaceStudio Pro 1.0.",
                },
                {
                  "@type": "WebPage",
                  "@id": "https://nanopocket.ai/face-swap",
                  name: "Free online AI face swap — runs in your browser",
                  url: "https://nanopocket.ai/face-swap",
                  dateModified: "2026-06-03",
                  description:
                    "Canonical landing page for NanoPocket's free in-browser face-swap demos. Single-purpose, no install, no subscription, GAN and diffusion models.",
                },
                {
                  "@type": "TechArticle",
                  "@id": "https://nanopocket.ai/compare/nanopocket-vs-wavespeed",
                  name: "NanoPocket vs WaveSpeed AI — specialised face swap vs broad AI suite",
                  url: "https://nanopocket.ai/compare/nanopocket-vs-wavespeed",
                  dateModified: "2026-06-03",
                  description:
                    "Comparison: WaveSpeed AI (broad cloud generative-AI suite where face swap is one feature) vs NanoPocket (specialised face-swap stack with free in-browser demo + optional local desktop).",
                },
                {
                  "@type": "WebPage",
                  "@id": "https://nanopocket.ai/status",
                  name: "NanoPocket Demo Status — live uptime",
                  url: "https://nanopocket.ai/status",
                  dateModified: "2026-10-01",
                  description: `Live up/down status for NanoPocket's online face-swap demos, refreshed from an independent GitHub Actions monitor every five minutes. ${demoAvailabilityEn()}`,
                },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://nanopocket.ai#website",
              name: "NanoPocket",
              url: "https://nanopocket.ai",
              inLanguage: "en",
              publisher: { "@id": "https://nanopocket.ai#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://nanopocket.ai/blog?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Only Common goes to the browser: no client component reads the page namespaces, and sending them
            put every page's text, in this locale, into the HTML of every page. */}
        <NextIntlClientProvider locale={locale} messages={{ Common: messages.Common }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <QuickStart />
            <LocalAppsNotice />
            <AnalyticsEvents />
            <FeedbackButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
