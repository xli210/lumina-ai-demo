import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2, ScrollText } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { TERMS_EFFECTIVE_DATE, TERMS_VERSION } from "@/lib/terms-version";
import { REFERRAL_FRIEND_CREDITS, REFERRAL_REWARD_CREDITS } from "@/lib/referral";

const PAGE_URL = "https://nanopocket.ai/terms";
const EFFECTIVE_DATE = TERMS_EFFECTIVE_DATE;
const POLICY_VERSION = TERMS_VERSION;

export const metadata: Metadata = {
  title: "Terms of Service — NanoPocket",
  description:
    `NanoPocket Terms of Service — license terms, billing, refunds and EU/UK withdrawal rights, invite rewards, acceptable use, AI-generated content, misuse reports, warranty disclaimer, governing law. Effective ${TERMS_EFFECTIVE_DATE}, version ${TERMS_VERSION}.`,
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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket" }],
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
              ["Online tools", "demos"],
              ["Billing", "billing"],
              ["Refunds & withdrawal", "refunds"],
              ["Invite rewards", "referrals"],
              ["Acceptable use", "aup"],
              ["AI-generated content", "ai-content"],
              ["Reporting misuse", "report"],
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
          user must not use NanoPocket products or services. The user must be at least 18 years
          old and legally capable of entering into a contract. NanoPocket accounts, the online
          tools and credit purchases are for adults only.
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

        <Section id="demos" title="3. Online tools">
          The online tools (Nano FaceStudio Online, Nano HeadSwap Pro, Video FaceSwap Online and
          Nano ImageEdit 2.0 Online) are available to every signed-in NanoPocket account. New
          accounts receive free credits; beyond them, use is paid in prepaid credits as described
          on the Pricing page. They are best-effort, rate-limited services with no uptime SLA.
          Before a face is processed, the tools ask the user to confirm the right to use it.
          Results made by an account that has never bought credits carry a visible NanoPocket
          watermark. The user retains all rights to outputs, subject to the Acceptable Use policy
          below. How uploads and results are stored, and for how long, is described in the{" "}
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
              <strong>Free credits.</strong> Welcome credits and any free top-up are
              intended for one account per person. We may decline them to an account opened from
              a device or network that has already received them, and we may remove free credits
              obtained through multiple accounts. Credits you have bought are never affected.
            </li>
            <li>
              <strong className="text-foreground">Credits.</strong> Credits are prepaid units used
              only on NanoPocket&apos;s online tools (1 credit = USD 0.01 of list price). Each job
              shows its price in credits before it starts. Credits have no cash value, cannot be
              transferred between accounts or exchanged for money except as a refund under
              section 5, and do not expire while the account exists; they end when the account is
              deleted.
            </li>
            <li>
              <strong className="text-foreground">One-time license.</strong> Paid licenses are
              one-time purchases. There is no recurring fee, no auto-renewal, no per-image charge,
              no per-minute charge, and no per-frame charge.
            </li>
            <li>
              <strong className="text-foreground">Auto top-up (optional).</strong> Credits are
              prepaid and nothing is charged automatically unless you turn on auto top-up by
              ticking its box when you buy a credit pack. Doing so lets us keep the card you pay
              with and, when your available balance drops below 20% of that pack&apos;s credits,
              charge it for another pack of the same size and add the credits, with 2% of the
              pack&apos;s price in extra credits on every automatic top-up. We charge at most once
              in any 24 hours and three times in any 30 days, Stripe emails a receipt each time,
              and the setting is shown on your{" "}
              <Link href="/credits" className="text-indigo-500 underline-offset-4 hover:underline">
                credits page
              </Link>
              . You can turn it off there at any time; that applies to charges after you do. It
              also turns itself off if a charge is declined, your bank asks you to confirm a
              payment, or a payment is disputed. Credits bought this way are credits like any
              others: they do not expire, and the refund policy below applies to them.
            </li>
            <li>
              <strong className="text-foreground">Currency &amp; tax.</strong> Prices are quoted
              in USD; the buyer&apos;s bank may apply its own currency conversion. Any VAT, GST or
              sales tax that is charged is shown at checkout before payment.
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

        <Section id="refunds" title="5. Refunds & the right of withdrawal">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Desktop apps.</strong> Every paid app includes a
              7-day free trial without a credit card. Because the trial is the evaluation window,
              app purchases are non-refundable after activation. A purchase that has not been used
              (zero activations and zero generations) may be refunded on request within 14 days of
              purchase. Free apps do not require a refund flow.
            </li>
            <li>
              <strong className="text-foreground">Credits.</strong> A job that fails, or that is
              cancelled while it is still waiting, is refunded in credits automatically. Purchased
              credits that have not been used may be refunded on request to{" "}
              <a href="mailto:sales@nanopocket.ai" className="text-indigo-500 underline-offset-4 hover:underline">sales@nanopocket.ai</a> within 14 days of purchase. Credits that have been
              used, and free credits (welcome credits, free top-ups, invite rewards, bonus credits),
              are not refundable; when a purchase is refunded, the bonus credits that came with it
              are removed.
            </li>
            <li>
              <strong className="text-foreground">Consumers in the EU, EEA and UK.</strong> You
              have a statutory right to withdraw from a purchase within 14 days without giving a
              reason. Digital services and content are supplied as soon as you use them: when you
              use purchased credits, or activate an app, within those 14 days, you ask us to start
              supplying immediately and you lose the right of withdrawal for what has been
              supplied. Purchased credits you have not used can be returned within 14 days of
              purchase for a refund; write to <a href="mailto:sales@nanopocket.ai" className="text-indigo-500 underline-offset-4 hover:underline">sales@nanopocket.ai</a> from the address on the
              account.
            </li>
          </ul>
          <p className="mt-3">
            Nothing in this section limits rights you have under mandatory consumer law, for
            example where a product does not work as described.
          </p>
        </Section>

        <Section id="referrals" title="6. Invite rewards">
          <p className="mb-3">
            An account can share its invite link (Account, then Invite friends). When someone opens
            a new NanoPocket account through that link within 30 days of following it, and later
            buys credits for the first time, the inviter receives {REFERRAL_REWARD_CREDITS} credits
            and the new account receives {REFERRAL_FRIEND_CREDITS} extra credits.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              One reward per invited account. The first invite link a browser followed is the one
              that counts.
            </li>
            <li>
              Accounts opened from the inviter&apos;s own device or network, accounts opened only to
              collect rewards, and purchases that are refunded or charged back do not qualify.
              Rewards obtained that way may be removed.
            </li>
            <li>Reward credits are free credits: they have no cash value and are not refundable.</li>
            <li>
              When sharing an invite link publicly, say that you receive credits if people sign up
              and buy through it.
            </li>
            <li>
              NanoPocket may change or end the programme at any time. Rewards already earned are
              kept.
            </li>
          </ul>
        </Section>

        <Section id="aup" title="7. Acceptable use policy">
          <p className="mb-3">
            NanoPocket products may not be used to:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Generate or distribute child sexual abuse material (CSAM). Violations are reported
              to NCMEC and law-enforcement bodies in the relevant jurisdiction.
            </li>
            <li>
              Upload or transform the face or likeness of a real person without the right to do so:
              it must be the user&apos;s own, or the person (or, for a minor, a parent or guardian)
              must have agreed. The online tools ask the user to confirm this before they run.
            </li>
            <li>
              Create non-consensual intimate imagery (NCII) of any real person, or use the online
              tools to create nude or sexually explicit imagery of any real person.
            </li>
            <li>
              Create any sexual content involving a person who is, or appears to be, under 18.
            </li>
            <li>
              Impersonate a real person for fraud, defamation, or election interference, or present
              a result as real in order to deceive (fake news, fake evidence, scams, or getting past
              a liveness, identity or KYC check).
            </li>
            <li>
              Remove, crop out or obscure a watermark or AI disclosure in order to pass a result off
              as authentic.
            </li>
            <li>
              Open more accounts to get around the free-credit rules, usage limits or a suspension.
            </li>
            <li>
              Attack, overload or scrape the online services, or resell access to them without
              written permission.
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

        <Section id="ai-content" title="8. AI-generated content">
          <p className="mb-3">
            Everything the online tools and the desktop apps produce is generated or altered by AI.
            Results made by an account that has never bought credits carry a visible NanoPocket
            watermark.
          </p>
          <p>
            When the user publishes or shares a result, the user is responsible for complying with
            the law and the platform&apos;s rules on synthetic media. In particular, where a result
            is a realistic image, audio or video of a real person, place or event (a
            &ldquo;deepfake&rdquo;), the user must clearly disclose that it was generated or
            manipulated by AI, as required for example by Article 50 of the EU AI Act. For
            evidently artistic, satirical or fictional work the disclosure can be made in a way that
            does not spoil the work. The user must not publish a result in a way that is likely to
            make people believe it is authentic.
          </p>
        </Section>

        <Section id="report" title="9. Reporting misuse">
          <p className="mb-3">
            Anyone who believes a NanoPocket product was used to create content of them without
            consent, intimate imagery, content involving a minor, or other misuse can report it to{" "}
            <a href="mailto:tech@nanopocket.ai" className="text-indigo-500 underline-offset-4 hover:underline">tech@nanopocket.ai</a> with the subject &ldquo;Misuse report&rdquo;. Please include
            a copy of or link to the content, the account email if known, and how to reach you.
          </p>
          <p>
            We review reports promptly. We can suspend the account involved, delete any of its
            files we still hold, and cooperate with law enforcement; reports of child sexual abuse
            material are passed to NCMEC. NanoPocket does not publish results, so content posted
            elsewhere should also be reported to the site that hosts it.
          </p>
        </Section>

        <Section id="rights" title="10. User content & rights">
          The user retains all rights to the content the user creates with NanoPocket products,
          subject to the Acceptable Use policy and the licenses of the underlying open-weight models
          (listed on the trust page). The user is solely responsible for clearing any third-party rights
          (likeness, trademark, copyright) implicated by the user&apos;s inputs and outputs.
        </Section>

        <Section id="updates" title="11. Updates & support">
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

        <Section id="termination" title="12. Termination">
          Either party may terminate the agreement at any time. NanoPocket may terminate
          immediately for breach of these Terms. On termination, the user&apos;s license to use
          the desktop applications ends; offline-installed copies will continue to function
          mechanically until the next license validation, which the user must not bypass.
        </Section>

        <Section id="warranty" title="13. Warranty disclaimer">
          NANOPOCKET PRODUCTS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
          WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTY
          ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. AI-GENERATED OUTPUTS MAY BE INACCURATE
          OR UNSUITABLE FOR A GIVEN USE; THE USER IS RESPONSIBLE FOR REVIEW AND VALIDATION BEFORE
          USE.
        </Section>

        <Section id="liability" title="14. Limitation of liability">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NANOPOCKET SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF
          PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO THESE TERMS OR THE USE OF
          NANOPOCKET PRODUCTS, WHETHER IN CONTRACT, TORT, OR OTHERWISE, EVEN IF ADVISED OF THE
          POSSIBILITY OF SUCH DAMAGES. NANOPOCKET&apos;S AGGREGATE LIABILITY FOR ANY CLAIM SHALL
          NOT EXCEED THE AMOUNT THE USER PAID NANOPOCKET IN THE TWELVE (12) MONTHS BEFORE THE
          EVENT GIVING RISE TO THE CLAIM, OR USD 100 IF THE USER PAID NOTHING.
        </Section>

        <Section id="indemnity" title="15. Indemnity">
          The user agrees to indemnify and hold NanoPocket harmless from any claim, demand, loss,
          or damage (including reasonable attorneys&apos; fees) arising from the user&apos;s
          violation of these Terms, the user&apos;s violation of applicable law, or the
          user&apos;s infringement of any third-party right via inputs or outputs created with
          NanoPocket products.
        </Section>

        <Section id="law" title="16. Governing law & disputes">
          These Terms are governed by the laws of the State of Delaware, USA, without regard to
          its conflict-of-laws rules. The parties agree to the exclusive jurisdiction of the state
          and federal courts located in Wilmington, Delaware, USA, except that NanoPocket may seek
          injunctive relief in any court of competent jurisdiction. Nothing in these Terms
          deprives a consumer of mandatory consumer-protection rights under their local law.
        </Section>

        <Section id="changes" title="17. Changes to these terms">
          <p className="mb-3">
            NanoPocket may update these Terms; the version and effective date at the top of this
            page reflect the current revision. Material changes will be announced via email at
            least 14 days before they take effect. Continued use after the effective date
            constitutes acceptance of the new Terms.
          </p>
          <p>
            Version 1.3 adds the adult-only age requirement, credit refunds and the EU/UK right of
            withdrawal, invite rewards, the AI-generated content rules and misuse reporting, and
            extends the acceptable use policy. It applies to accounts opened from 2026-10-30 and to
            existing accounts from 2026-11-13.
          </p>
        </Section>

        <Section id="contact" title="18. Contact">
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
