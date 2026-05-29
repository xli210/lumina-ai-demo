import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2, ScrollText } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/terms";
const EFFECTIVE_DATE = "2026-05-29";
const POLICY_VERSION = "1.0";

export const metadata: Metadata = {
  title: "Terms of Service — NanoPocket",
  description:
    "NanoPocket Terms of Service — license terms, billing, refund policy, acceptable-use policy, warranty disclaimer, governing law. Effective 2026-05-29, version 1.0.",
  keywords: [
    "NanoPocket terms of service",
    "NanoPocket EULA",
    "NanoPocket license terms",
    "NanoPocket billing terms",
    "NanoPocket refund policy",
    "NanoPocket acceptable use",
    "NanoPocket governing law",
  ],
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "NanoPocket — Terms of Service",
    description:
      "License terms, billing, refund policy, acceptable use, warranty disclaimer, governing law.",
  },
};

const termsJsonLd = {
  "@context": "https://schema.org",
  "@type": "TermsOfService",
  name: "NanoPocket Terms of Service",
  url: PAGE_URL,
  inLanguage: "en",
  isAccessibleForFree: true,
  datePublished: EFFECTIVE_DATE,
  dateModified: EFFECTIVE_DATE,
  version: POLICY_VERSION,
  publisher: {
    "@type": "Organization",
    "@id": "https://nanopocket.ai#organization",
    name: "NanoPocket",
    url: "https://nanopocket.ai",
  },
  mainEntityOfPage: PAGE_URL,
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />

      <Navbar />

      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/trust"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trust
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
            <ScrollText className="h-3.5 w-3.5" />
            Terms of Service
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            These terms are the agreement between every NanoPocket user and NanoPocket. They cover
            the license, billing, acceptable use, warranties, liability, and the law that governs
            disputes.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              Effective{" "}
              <time dateTime={EFFECTIVE_DATE} className="text-foreground">
                {EFFECTIVE_DATE}
              </time>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              Version {POLICY_VERSION}
            </span>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-6 pb-24">
        <nav className="mb-12 rounded-2xl border border-border/60 bg-muted/30 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Contents
          </h2>
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["Acceptance", "acceptance"],
              ["License", "license"],
              ["Online demos", "demos"],
              ["Billing", "billing"],
              ["Refunds", "refunds"],
              ["Acceptable use", "aup"],
              ["User content & rights", "rights"],
              ["Updates & support", "updates"],
              ["Termination", "termination"],
              ["Warranty disclaimer", "warranty"],
              ["Limitation of liability", "liability"],
              ["Indemnity", "indemnity"],
              ["Governing law & disputes", "law"],
              ["Changes to these terms", "changes"],
              ["Contact", "contact"],
            ].map(([label, anchor]) => (
              <li key={anchor as string}>
                <a
                  href={`#${anchor}`}
                  className="text-sm text-indigo-500 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="acceptance" title="1. Acceptance">
          By creating a NanoPocket account, downloading any NanoPocket application, or using the
          online demos, the user accepts these Terms. If the user does not accept these Terms, the
          user must not use NanoPocket products or services. The user must be at least 16 years
          old (13 in the United States) and legally capable of entering into a contract.
        </Section>

        <Section id="license" title="2. License grant">
          <p className="mb-3">
            NanoPocket grants the user a non-exclusive, non-transferable, revocable license to
            install and use the desktop applications on the number of machines covered by the
            license key (one machine per key by default). The license is perpetual unless revoked
            for breach of these Terms.
          </p>
          <p>
            The user may not (a) reverse-engineer, decompile, or disassemble the binary except as
            permitted by applicable mandatory law; (b) redistribute the application, the license
            key, or the bundled model weights; (c) remove or alter copyright, trademark, or
            license notices; or (d) use NanoPocket to develop a directly competing product.
          </p>
        </Section>

        <Section id="demos" title="3. Online demos">
          The Image FaceSwap Pro 2.0 and Video FaceSwap Pro online demos are provided free for
          every signed-in NanoPocket account. They are best-effort, rate-limited services with no
          uptime SLA. The user retains all rights to demo outputs, subject to the Acceptable Use
          policy below. Source content is processed in volatile memory and discarded as described
          in the{" "}
          <Link
            href="/privacy#demos"
            className="text-indigo-500 underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </Section>

        <Section id="billing" title="4. Billing">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">One-time license.</strong> Paid licenses are
              one-time purchases. There is no recurring fee, no auto-renewal, no per-image charge,
              no per-minute charge, and no per-frame charge.
            </li>
            <li>
              <strong className="text-foreground">Currency &amp; tax.</strong> Prices are quoted
              in USD by default; Stripe handles currency conversion and applies VAT, GST, or sales
              tax based on the buyer&apos;s region at checkout.
            </li>
            <li>
              <strong className="text-foreground">Failed payments.</strong> If a payment fails or
              is reversed (chargeback, dispute), the associated license is suspended until the
              balance is settled.
            </li>
            <li>
              <strong className="text-foreground">Chargebacks.</strong> Initiating a chargeback
              without first contacting{" "}
              <a
                href="mailto:sales@nanopocket.ai"
                className="text-indigo-500 underline-offset-4 hover:underline"
              >
                sales@nanopocket.ai
              </a>{" "}
              is a breach of these Terms and may result in termination.
            </li>
            <li>
              <strong className="text-foreground">Receipts &amp; invoices.</strong> Stripe issues
              every receipt and tax invoice to the email on the order. Custom enterprise invoices
              are available on request.
            </li>
          </ul>
        </Section>

        <Section id="refunds" title="5. Refund policy">
          Every paid app includes a 7-day free trial without a credit card. Because the trial is
          the canonical evaluation window, purchases are non-refundable after activation. If a
          purchase is not used (zero activations and zero generations) it may be refunded within
          14 days at NanoPocket&apos;s discretion. Free apps do not require a refund flow.
        </Section>

        <Section id="aup" title="6. Acceptable use policy">
          <p className="mb-3">
            NanoPocket products may not be used to:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Generate or distribute child sexual abuse material (CSAM). Violations are reported
              to NCMEC and law-enforcement bodies in the relevant jurisdiction.
            </li>
            <li>
              Create non-consensual intimate imagery (NCII) of any real person.
            </li>
            <li>
              Impersonate a real person for fraud, defamation, or election interference.
            </li>
            <li>
              Infringe a third party&apos;s copyright, trademark, right of publicity, or other
              proprietary right.
            </li>
            <li>
              Generate content that targets a person or group on the basis of a protected
              characteristic (race, religion, gender, sexuality, disability) for harassment.
            </li>
            <li>
              Violate any applicable export-control regime (US EAR, EU dual-use regulations).
            </li>
          </ul>
          <p className="mt-3">
            Violations are grounds for immediate license revocation and account termination, with
            no refund.
          </p>
        </Section>

        <Section id="rights" title="7. User content & rights">
          The user retains all rights to the content the user creates with NanoPocket products,
          subject to the Acceptable Use policy and the underlying open-weight model licenses
          (Flux.1, LTX-2.3, InstantID, PuLID, IP-Adapter FaceID, Real-ESRGAN, InsightFace
          inswapper_128). The user is solely responsible for clearing any third-party rights
          (likeness, trademark, copyright) implicated by the user&apos;s inputs and outputs.
        </Section>

        <Section id="updates" title="8. Updates & support">
          Minor and patch updates (e.g. 1.0.4 → 1.0.5) are included free for life of the product.
          Major version upgrades (e.g. 3.0 → 4.0) are at NanoPocket&apos;s discretion and are
          typically discounted for existing licensees. Support is best-effort via{" "}
          <a
            href="mailto:tech@nanopocket.ai"
            className="text-indigo-500 underline-offset-4 hover:underline"
          >
            tech@nanopocket.ai
          </a>
          ; there is no SLA on response time.
        </Section>

        <Section id="termination" title="9. Termination">
          Either party may terminate the agreement at any time. NanoPocket may terminate
          immediately for breach of these Terms. On termination, the user&apos;s license to use
          the desktop applications ends; offline-installed copies will continue to function
          mechanically until the next license validation, which the user must not bypass.
        </Section>

        <Section id="warranty" title="10. Warranty disclaimer">
          NANOPOCKET PRODUCTS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
          WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTY
          ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. AI-GENERATED OUTPUTS MAY BE INACCURATE
          OR UNSUITABLE FOR A GIVEN USE; THE USER IS RESPONSIBLE FOR REVIEW AND VALIDATION BEFORE
          USE.
        </Section>

        <Section id="liability" title="11. Limitation of liability">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NANOPOCKET SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF
          PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO THESE TERMS OR THE USE OF
          NANOPOCKET PRODUCTS, WHETHER IN CONTRACT, TORT, OR OTHERWISE, EVEN IF ADVISED OF THE
          POSSIBILITY OF SUCH DAMAGES. NANOPOCKET&apos;S AGGREGATE LIABILITY FOR ANY CLAIM SHALL
          NOT EXCEED THE AMOUNT THE USER PAID NANOPOCKET IN THE TWELVE (12) MONTHS BEFORE THE
          EVENT GIVING RISE TO THE CLAIM, OR USD 100 IF THE USER PAID NOTHING.
        </Section>

        <Section id="indemnity" title="12. Indemnity">
          The user agrees to indemnify and hold NanoPocket harmless from any claim, demand, loss,
          or damage (including reasonable attorneys&apos; fees) arising from the user&apos;s
          violation of these Terms, the user&apos;s violation of applicable law, or the
          user&apos;s infringement of any third-party right via inputs or outputs created with
          NanoPocket products.
        </Section>

        <Section id="law" title="13. Governing law & disputes">
          These Terms are governed by the laws of the State of Delaware, USA, without regard to
          its conflict-of-laws rules. The parties agree to the exclusive jurisdiction of the state
          and federal courts located in Wilmington, Delaware, USA, except that NanoPocket may seek
          injunctive relief in any court of competent jurisdiction. Nothing in these Terms
          deprives a consumer of mandatory consumer-protection rights under their local law.
        </Section>

        <Section id="changes" title="14. Changes to these terms">
          NanoPocket may update these Terms; the version and effective date at the top of this
          page reflect the current revision. Material changes will be announced via email at least
          14 days before they take effect. Continued use after the effective date constitutes
          acceptance of the new Terms.
        </Section>

        <Section id="contact" title="15. Contact">
          Legal / contractual questions:{" "}
          <a
            href="mailto:sales@nanopocket.ai"
            className="text-indigo-500 underline-offset-4 hover:underline"
          >
            sales@nanopocket.ai
          </a>
          . Technical support:{" "}
          <a
            href="mailto:tech@nanopocket.ai"
            className="text-indigo-500 underline-offset-4 hover:underline"
          >
            tech@nanopocket.ai
          </a>
          . Security reports:{" "}
          <a
            href="mailto:security@nanopocket.ai"
            className="text-indigo-500 underline-offset-4 hover:underline"
          >
            security@nanopocket.ai
          </a>
          .
        </Section>
      </article>

      <Footer />
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12">
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</div>
    </section>
  );
}
