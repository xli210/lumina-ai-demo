import type { Metadata } from "next";
import { Navbar } from "../components/navbar";

export const metadata: Metadata = {
  title: "Download AI Tools — Local Alternative to Runway, ComfyUI & Flux",
  description: "Download NanoPocket AI tools — run Flux.1, LTX-2.3, and more locally on your GPU. Image generation, video creation, face swap, enhancement. No subscription, no cloud.",
  alternates: { canonical: "/download" },
};
import { Footer } from "../components/footer";
import { DownloadHero } from "./download-hero";
import { AppCards } from "./app-cards";
import { ReleaseNotes } from "./release-notes";
import { SystemRequirements } from "./system-requirements";

const softwareData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SoftwareApplication", name: "Nano ImageEdit", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "19.90", priceCurrency: "USD" }, description: "AI image generation — local alternative to Midjourney and Flux. Run Flux.1 on your GPU." },
    { "@type": "SoftwareApplication", name: "Nano VideoGen", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "29.90", priceCurrency: "USD" }, description: "AI video generation — local alternative to Runway. Run LTX-2.3 on your GPU." },
    { "@type": "SoftwareApplication", name: "Nano VideoEnhance", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "19.90", priceCurrency: "USD" }, description: "AI video enhancement — local alternative to Topaz Video AI." },
    { "@type": "SoftwareApplication", name: "Nano ImageEnh", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "29.90", priceCurrency: "USD" }, description: "AI image upscaling and enhancement — local alternative to Topaz Photo AI." },
    { "@type": "SoftwareApplication", name: "Nano FacialEdit", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "AI facial editing and retouching — runs 100% locally on your GPU." },
    { "@type": "SoftwareApplication", name: "Nano FaceSwap", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "AI face swap in photos and videos — local alternative to FaceApp." },
    { "@type": "SoftwareApplication", name: "Nano ImageTryon", operatingSystem: "Windows 10/11", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "AI virtual try-on — see how clothes look before you buy." },
  ],
};

export default function DownloadPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
      />
      <Navbar />
      <DownloadHero />
      <AppCards />
      <SystemRequirements />
      <ReleaseNotes />
      <Footer />
    </main>
  );
}
