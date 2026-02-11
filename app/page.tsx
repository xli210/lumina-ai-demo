import { Navbar } from "./components/navbar";
import { HeroSection } from "./components/hero-section";
import { ShowcaseSection } from "./components/showcase-section";
import { FeaturesSection } from "./components/features-section";
import { PricingSection } from "./components/pricing-section";
import { Footer } from "./components/footer";

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <HeroSection />
      <ShowcaseSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
