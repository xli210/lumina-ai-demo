import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { hreflangAlternates } from "@/lib/i18n/locales";
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
import { HOME_FAQS } from "./components/faq-data";
import { AT_A_GLANCE_JSON_LD, AtAGlanceSection } from "./components/at-a-glance-section";
import { CTASection } from "./components/cta-section";
import { Footer } from "./components/footer";

/** Re-rendered every 10 minutes, so the Nano FaceStudio Pro launch price leaves the page soon after it ends. */
export const revalidate = 600;

/**
 * Page-level metadata override that adds hreflang alternates pointing at the
 * Chinese homepage. Title, description, and OG tags all inherit from the
 * defaults set in app/layout.tsx so the existing English SEO is unchanged.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: hreflangAlternates("https://nanopocket.ai", "/", ["zh-CN"]),
  },
};

// Built from the same list the visible FAQ renders, so the structured data always matches the page.
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(AT_A_GLANCE_JSON_LD) }}
      />
      <Navbar />
      <WhatsNewBar />
      <HeroSection />
      <AnnouncementSection />
      <AtAGlanceSection />
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
            The open-weight models we build on are listed under{" "}
            <Link
              href="/trust#references"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              External references
            </Link>{" "}
            so anyone can reproduce our pipeline and verify the technical claims.
          </p>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Formal, dated documents are linked directly:{" "}
            <Link
              href="/privacy"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            (data, retention, subprocessors, GDPR/CCPA),{" "}
            <Link
              href="/terms"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            (license, billing, refunds, governing law),{" "}
            <Link
              href="/security"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              Security &amp; Vulnerability Disclosure
            </Link>{" "}
            with a machine-readable{" "}
            <a
              href="/.well-known/security.txt"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              /.well-known/security.txt
            </a>{" "}
            (RFC 9116).
          </p>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            For independent verification —{" "}
            <strong className="text-foreground">things you can check without trusting us</strong>
            {" "}— see{" "}
            <Link
              href="/verify"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              /verify
            </Link>{" "}
            (SHA-256 checksums for every download, our code-signing status, an offline-execution
            reproducibility procedure, and Hugging Face commit IDs for every model in our
            pipeline) and{" "}
            <Link
              href="/community"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              /community
            </Link>{" "}
            (live Discord stats fetched from Discord&apos;s API and an honest, dated list of
            which third-party coverage exists today — and which doesn&apos;t).
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
