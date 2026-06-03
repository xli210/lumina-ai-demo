import React from "react"
import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://nanopocket.ai"),
  title: {
    default: "NanoPocket — Free Online AI Face Swap + Local AI Creative Suite",
    template: "%s | NanoPocket",
  },
  description:
    "Free online AI face swap that runs in your browser — three diffusion-grade demos at /face-swap, no install, no subscription. Plus a full local AI creative suite (Flux.1, LTX-2.3) for users who want to run everything on their own GPU.",
  keywords: [
    "NanoPocket", "local AI", "generative AI", "offline AI",
    "Runway alternative", "ComfyUI alternative", "Flux local app", "Flux.1 local",
    "LTX alternative", "LTX-2.3 local", "Midjourney alternative offline",
    "Topaz alternative", "Pika alternative local", "Kling AI alternative", "Sora alternative local",
    "Black Forest Labs Flux app", "Stable Diffusion GUI", "SDXL local",
    "local AI video generation", "text to video local GPU", "image to video local",
    "offline AI image editor", "AI face swap desktop", "AI image upscaler offline",
    "AI video enhancement local", "text to image local GPU", "virtual try-on AI app",
    "best local AI app", "AI tools no subscription", "one-time purchase AI software",
    "private AI image generator", "no cloud AI video maker",
    "image generation", "video generation", "face swap", "image enhancement", "video enhancement",

    // Face swap — diffusion tech & local positioning
    "Nano FaceSwap Pro", "free face swap", "free online face swap", "face swap free trial",
    "diffusion face swap", "stable diffusion face swap", "diffusion model face swap",
    "local face swap", "offline face swap", "private face swap", "GPU face swap",
    "video face swap AI", "image face swap AI", "best face swap AI",
    "InstantID face swap", "PuLID face swap", "IP-Adapter FaceID", "PhotoMaker face swap",
    "InsightFace swapper", "inswapper alternative",
    // Face swap — named competitors ("best players")
    "Roop alternative", "Roop Unleashed alternative",
    "FaceFusion alternative", "Rope alternative", "Rope Live alternative",
    "Reactor face swap alternative", "Deep-Live-Cam alternative", "deepfacelive alternative",
    "DeepSwap alternative", "DeepFaceLab alternative", "SimSwap alternative",
    "Akool alternative", "HeyGen face swap alternative", "Reface alternative", "DeepBrain alternative",
  ],
  openGraph: {
    title: "NanoPocket — Free Online AI Face Swap + Local Creative Suite",
    description: "Free in-browser face swap (no install, no subscription) plus a fully-local AI suite for users who want to run everything on their own GPU. Powered by InstantID + PuLID + IP-Adapter FaceID, Flux.1, and LTX-2.3.",
    url: "https://nanopocket.ai",
    siteName: "NanoPocket",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket — Local AI Creative Suite" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NanoPocket — Free Online AI Face Swap + Local Creative Suite",
    description: "Free in-browser AI face swap (no install) plus a fully-local AI suite for users who want everything on their own GPU.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                "Local AI creative suite — Flux.1, LTX-2.3, InstantID and more, on your GPU. No subscription, no cloud.",
              description:
                "NanoPocket builds local AI desktop apps for Windows (NVIDIA CUDA) and macOS (Apple Silicon Metal): face swap, image and video upscaling, image generation, video generation, portrait retouch, and virtual try-on. Every desktop app runs 100% on the user's GPU; pricing is one-time per product with no subscriptions.",
              disambiguatingDescription:
                "NanoPocket is an independent product company at nanopocket.ai. It is not affiliated with Nano Banana, nanobanana.ai, nano-banana.com, nanobnana, or any other Nano-prefixed website that wraps Google's Gemini 2.5 Flash Image API. NanoPocket's face-swap pipeline runs locally on InstantID, PuLID, and IP-Adapter FaceID, not on Google's API.",
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
                "AI video generation (LTX-2.3)",
                "AI image generation (Flux.1)",
                "AI image upscaling (Real-ESRGAN, BasicVSR++)",
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
                    name: "Nano FaceSwap Pro 2.0",
                    url: "https://nanopocket.ai/apps/nano-faceswap-pro",
                  },
                  {
                    "@type": "Offer",
                    name: "Nano Video FaceSwap Pro (online demo)",
                    url: "https://nanopocket.ai/apps/nano-faceswap-pro/video",
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
                    "Coordinated disclosure timeline, scope, safe-harbor, code-signing posture; mirrors /.well-known/security.txt (RFC 9116).",
                },
                {
                  "@type": "TechArticle",
                  "@id": "https://nanopocket.ai/verify",
                  name: "Verify NanoPocket — auditable build manifest & offline reproducibility",
                  url: "https://nanopocket.ai/verify",
                  dateModified: "2026-05-29",
                  description:
                    "Build manifest with SHA-256 / VirusTotal commitments, offline-execution reproducibility procedure, and Hugging Face commit IDs for every model in the pipeline.",
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
                    "Disambiguation: NanoPocket (local desktop, InstantID + PuLID) is not Nano Banana (Google Gemini 2.5 Flash Image, cloud) and is not affiliated with nanobanana.ai, nano-banana.com, or nanobnana.",
                },
                {
                  "@type": "Article",
                  "@id": "https://nanopocket.ai/apps/nanoface-vivid",
                  name: "NanoFace Vivid — fix over-smoothed AI faces",
                  url: "https://nanopocket.ai/apps/nanoface-vivid",
                  dateModified: "2026-06-02",
                  description:
                    "Identity-locked face-detail restorer that fixes the plastic look left by Gemini 2.5 Flash Image (Nano Banana), Adobe Firefly, Roop, FaceFusion, and cloud face-swap services. Online demo today; integrated into NanoPocket FaceSwap Pro 2.0 desktop soon.",
                },
                {
                  "@type": "WebPage",
                  "@id": "https://nanopocket.ai/face-swap",
                  name: "Free online AI face swap — runs in your browser",
                  url: "https://nanopocket.ai/face-swap",
                  dateModified: "2026-06-03",
                  description:
                    "Canonical landing page for NanoPocket's free in-browser face-swap demos. Single-purpose, no install, no subscription, diffusion identity stack (InstantID + PuLID + IP-Adapter FaceID).",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
