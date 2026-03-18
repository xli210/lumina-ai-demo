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

export default function Page() {
  return (
    <main className="relative min-h-screen">
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
