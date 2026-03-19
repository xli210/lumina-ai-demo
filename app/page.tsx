import { Navbar } from "./components/navbar";
import { HeroSection } from "./components/hero-section";
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
      name: "What GPU do I need to run NanoPocket apps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An NVIDIA GPU with a minimum of 8 GB VRAM is required. For video generation, 16 GB+ VRAM is recommended. For image generation and enhancement, 10 GB+ VRAM is optimal. Only CUDA-enabled GPUs are currently supported.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data private with NanoPocket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — 100%. All AI processing happens locally on your machine. No images or videos ever leave your computer. There are no cloud APIs, no telemetry, and no data collection.",
      },
    },
    {
      "@type": "Question",
      name: "How does NanoPocket compare to Runway, ComfyUI, and Midjourney?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NanoPocket runs the same cutting-edge AI models (Flux.1, LTX-2.3, etc.) locally on your GPU. Unlike Runway, Midjourney, or Pika, there are no subscriptions, no cloud dependency, and no privacy concerns. Unlike ComfyUI, NanoPocket requires no terminal setup — just download and run.",
      },
    },
    {
      "@type": "Question",
      name: "How does the licensing work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each license key activates on one machine. Free products give you a permanent license at no cost. Paid products offer a 7-day free trial, after which you can purchase a one-time lifetime license — no subscriptions ever.",
      },
    },
    {
      "@type": "Question",
      name: "What is the refund policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer a 7-day free trial for paid apps so you can fully explore before purchasing. Because of this, we do not offer refunds after purchase. Once purchased, you own the application permanently with no recurring fees.",
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
      <HeroSection />
      <DemoSection />
      <FeatureShowcase />
      <ShowcaseSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
