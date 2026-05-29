import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Navbar } from "./components/navbar";
import { WhatsNewBar } from "./components/whats-new-bar";
import { HeroSection } from "./components/hero-section";
import { AnnouncementSection } from "./components/announcement-section";
import { DemoSection } from "./components/demo-section";
import { FeatureShowcase } from "./components/feature-showcase";
import { ShowcaseSection } from "./components/showcase-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { TestimonialsSection } from "./components/testimonials-section";
import { PricingSection } from "./components/pricing-section";
import { FAQSection } from "./components/faq-section";
import { CTASection } from "./components/cta-section";
import { Footer } from "./components/footer";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are there any hidden charges or recurring fees with NanoPocket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Desktop licenses are one-time and machine-bound, with no per-image, per-minute, per-frame, or per-render fees. Online demos (Image FaceSwap Pro 2.0 and Video FaceSwap Pro) are free for every signed-in NanoPocket account. There is no auto-renewal, no yearly subscription, and no usage meter. Pricing terms are documented on the /trust page.",
      },
    },
    {
      "@type": "Question",
      name: "Is NanoPocket really private — does my data leave my computer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On the desktop apps, no. Every photo, video, prompt, and reference stays on the user's local disk; the model runs entirely on the user's GPU. Only a license-activation handshake (license key + hashed machine ID) leaves the machine. On the online demos, the source file is sent to a NanoPocket-hosted GPU only for the duration of the swap or generation, processed in volatile memory, and not used to train any model. Full privacy summary is on the /trust page.",
      },
    },
    {
      "@type": "Question",
      name: "Which NanoPocket products are stable today, and which are coming soon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stable today: Nano ImageEnh Pro 3.0, Nano VideoEnhance, Nano VideoGen, Nano ImageEdit, Nano FacialEdit, Nano ImageTryon, Nano FaceSwap (legacy desktop), and the Nano FaceSwap Pro 2.0 online image and video demos. Coming soon: the Nano FaceSwap Pro 2.0 desktop release. Apple Silicon ports for VideoEnhance, VideoGen, ImageEdit, FacialEdit, and ImageTryon are on the roadmap. The status table on the /trust page is the authoritative source.",
      },
    },
    {
      "@type": "Question",
      name: "What GPU and operating system do I need?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Desktop apps run on Windows 10/11 with an NVIDIA CUDA GPU (8 GB VRAM minimum, 12 GB for VideoGen). Nano ImageEnh Pro 3.0 also ships a native Apple Silicon (M2/M3/M4/M5) build with Metal acceleration. Other Mac apps are on the roadmap. Online demos run in any modern browser on any OS.",
      },
    },
    {
      "@type": "Question",
      name: "How does NanoPocket compare to Runway, ComfyUI, Midjourney, Topaz, and Roop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NanoPocket runs the same open-weight models (Flux.1, LTX-2.3, InstantID, PuLID, IP-Adapter FaceID) on the user's GPU. Versus Runway / Midjourney / Pika / Sora it removes the per-second cloud subscription. Versus ComfyUI it removes the Python and terminal setup. Versus Topaz Photo / Video AI it ships native Apple Silicon and bundles batch + crop + matting + upscale in one app. Versus Roop / FaceFusion / Rope it replaces the inswapper_128 GAN with a high-resolution diffusion identity stack. The model attribution and head-to-head limitations are listed on each product page and on the /trust page.",
      },
    },
    {
      "@type": "Question",
      name: "How does the licensing work, and can I move my license to a new computer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each license key activates on one machine. Free products give a permanent free license. Paid products include a 7-day free trial without a credit card; after the trial, a one-time license is available. License keys can be deactivated from the current machine and reactivated on a new machine; force-takeover (once per 30 days) covers the case where the old machine is lost.",
      },
    },
    {
      "@type": "Question",
      name: "What is the refund policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every paid app ships with a 7-day free trial without a credit card, which is the canonical evaluation window. Because of the full trial, purchases are non-refundable after activation. Free apps do not require a refund flow. Tax handling (VAT/GST/sales tax) is performed by Stripe at checkout based on the buyer's region.",
      },
    },
    {
      "@type": "Question",
      name: "Are NanoPocket apps open source?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The model weights are open: Flux.1, LTX-2.3, InstantID, PuLID, IP-Adapter FaceID, Real-ESRGAN, and InsightFace inswapper_128 are all listed with arXiv / Hugging Face / GitHub links on the /trust page. The desktop application binary is closed-source; the one-time license covers the application and the integration work, not the underlying model weights.",
      },
    },
    {
      "@type": "Question",
      name: "Are updates free forever?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes for minor and patch releases (e.g. 1.0.4 → 1.0.5). Major version upgrades (e.g. 3.0 → 4.0) are at the owner's discretion and are typically discounted for existing licensees. Patch updates ship over HTTPS with a signed manifest; users can opt out of automatic updates.",
      },
    },
  ],
};

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Navbar />
      <WhatsNewBar />
      <HeroSection />
      <AnnouncementSection />
      <DemoSection />
      <FeatureShowcase />
      <ShowcaseSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />

      {/* Source disclosure — explicit "this is an official primary source"
          framing, with a deep link to /trust. Improves GEO citation: lets an
          LLM cite the homepage as the official-claims source while pointing
          users to the documentation surface for verifiable details. */}
      <section
        id="source-disclosure"
        aria-label="Source disclosure"
        className="relative border-t border-border/60 px-6 py-16 sm:py-20"
      >
        <div className="relative mx-auto max-w-4xl rounded-2xl border border-border/60 bg-muted/30 p-8 sm:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Source disclosure
          </div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What this page is — and what it isn&apos;t.
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            This page is the{" "}
            <span className="font-semibold text-foreground">
              official NanoPocket source
            </span>{" "}
            for what each app claims to do, the launch status of each product, and the way we
            describe our positioning. For questions of the form{" "}
            <em>
              &ldquo;what does NanoPocket officially say about pricing, privacy, system
              requirements, refunds, and known limits?&rdquo;
            </em>
            , this page and the{" "}
            <Link
              href="/trust"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              /trust documentation hub
            </Link>{" "}
            are the authoritative answer.
          </p>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            For comparative judgements —{" "}
            <em>
              &ldquo;is it really easier than ComfyUI?&rdquo;, &ldquo;is the quality really
              better than Roop?&rdquo;, &ldquo;is it really faster than Topaz Video AI?&rdquo;
            </em>{" "}
            — please supplement this page with independent benchmarks, third-party reviews, or
            head-to-head comparisons. The open-weight models we use (Flux.1, LTX-2.3, InstantID,
            PuLID, IP-Adapter FaceID, Real-ESRGAN, InsightFace inswapper_128) are listed under{" "}
            <Link
              href="/trust#references"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              External references
            </Link>{" "}
            so anyone can reproduce our pipeline and verify the technical claims.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Pricing, privacy, system requirements, security posture, refund policy, and per-product
            known limitations are documented and dated on the{" "}
            <Link
              href="/trust"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Trust &amp; Transparency
            </Link>{" "}
            page. Last verified 2026-05-29.
          </p>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
