import type { Metadata } from "next";
import { Navbar } from "../components/navbar";

export const metadata: Metadata = {
  title: "Download AI Tools — Local Alternative to Runway, ComfyUI & Flux",
  description: "Download NanoPocket AI tools — run GAN and diffusion models locally on your GPU. Image generation, video creation, face swap, enhancement. No subscription, no cloud.",
  alternates: { canonical: "/download" },
};
import { Footer } from "../components/footer";
import { DownloadHero } from "./download-hero";
import { NewVersionNotice } from "./new-version-notice";
import { AppCards } from "./app-cards";
import { ReleaseNotes } from "./release-notes";
import { SystemRequirements } from "./system-requirements";
import { PRODUCTS } from "@/lib/products";
import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n/locales";
import { pageStrings } from "@/lib/i18n/strings";
import { BusinessContact } from "../components/business-contact";

/** Re-rendered every 10 minutes, so a launch price leaves the page soon after it ends. */
export const revalidate = 600;

// A function, so the price is read when the page renders rather than once per server instance.
const softwareData = () => ({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SoftwareApplication", name: "Nano FaceStudio Pro", operatingSystem: "Windows 10/11 (NVIDIA CUDA); macOS Apple Silicon to follow", applicationCategory: "MultimediaApplication", softwareVersion: "1.0.2", offers: { "@type": "Offer", price: (PRODUCTS.find((p) => p.id === "nano-facestudio-pro")!.priceInCents / 100).toFixed(2), priceCurrency: "USD", availability: "https://schema.org/InStock", url: "https://nanopocket.ai/apps/nano-facestudio-pro" }, description: "AI Face Studio — 7 tools in one local desktop app: face swap (up to 16 faces), mask edit, expression editing, face vivid, 2×/3×/4× upscale, light adjust, crop. GAN and diffusion models." },
    { "@type": "SoftwareApplication", name: "Nano ImageEdit", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "19.90", priceCurrency: "USD" }, description: "AI image generation — local alternative to Midjourney and Flux. Run GAN and diffusion models on your GPU." },
    { "@type": "SoftwareApplication", name: "Nano VideoGen", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "29.90", priceCurrency: "USD" }, description: "AI video generation — local alternative to Runway. Run GAN and diffusion models on your GPU." },
    { "@type": "SoftwareApplication", name: "Nano VideoEnhance", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "19.90", priceCurrency: "USD" }, description: "AI video enhancement — local alternative to Topaz Video AI." },
    { "@type": "SoftwareApplication", name: "Nano ImageEnh", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "29.90", priceCurrency: "USD" }, description: "AI image upscaling and enhancement — local alternative to Topaz Photo AI." },
    { "@type": "SoftwareApplication", name: "Nano FacialEdit", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "AI facial editing and retouching — runs 100% locally on your GPU." },
    { "@type": "SoftwareApplication", name: "Nano FaceSwap", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "AI face swap in photos and videos — local alternative to FaceApp." },
    { "@type": "SoftwareApplication", name: "Nano ImageTryon", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "AI virtual try-on — see how clothes look before you buy." },
  ],
});

export default async function DownloadPage() {
  const locale = (await getLocale()) as AppLocale;
  const strings = await pageStrings(locale);
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData()) }}
      />
      <Navbar />
      <DownloadHero strings={strings} />
      <NewVersionNotice strings={strings} />
      <AppCards strings={strings} locale={locale} />
      <SystemRequirements strings={strings} />
      <div className="mx-auto max-w-5xl px-6 pb-8">
        <BusinessContact strings={strings} />
      </div>
      <ReleaseNotes />
      <Footer />
    </main>
  );
}
