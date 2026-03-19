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
    default: "NanoPocket — Local AI Creative Suite | Run Flux, LTX & More on Your GPU",
    template: "%s | NanoPocket",
  },
  description:
    "NanoPocket is a local AI creative suite — run Runway-quality video generation, Flux-level image creation, and Topaz-grade enhancement all offline on your GPU. Powered by Flux.1, LTX-2.3, and open-source models. No subscription. No cloud. One-time purchase.",
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
  ],
  openGraph: {
    title: "NanoPocket — Local AI Creative Suite",
    description: "Generate videos, images, face swap, and more — 100% offline on your GPU. Powered by Flux, LTX, and open-source AI. No subscription.",
    url: "https://nanopocket.ai",
    siteName: "NanoPocket",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket — Local AI Creative Suite" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NanoPocket — Local AI Creative Suite",
    description: "Run Flux, LTX, and cutting-edge AI models locally on your GPU. No cloud. No subscription. One-time purchase.",
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
              name: "NanoPocket",
              url: "https://nanopocket.ai",
              logo: "https://nanopocket.ai/og-image.jpg",
              contactPoint: [
                { "@type": "ContactPoint", email: "tech@nanopocket.ai", contactType: "technical support" },
                { "@type": "ContactPoint", email: "sales@nanopocket.ai", contactType: "sales" },
              ],
              sameAs: [],
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
