import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2, ShieldCheck } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/privacy";
const EFFECTIVE_DATE = "2026-05-29";
const POLICY_VERSION = "1.0";

export const metadata: Metadata = {
  title: "Privacy Policy — NanoPocket",
  description:
    "NanoPocket Privacy Policy: what we collect, why, where it goes, how long we keep it, and the GDPR / CCPA rights available to every user. Effective 2026-05-29, version 1.0.",
  keywords: [
    "NanoPocket privacy policy",
    "NanoPocket data collection",
    "NanoPocket GDPR",
    "NanoPocket CCPA",
    "NanoPocket subprocessors",
    "NanoPocket data retention",
    "is NanoPocket safe",
    "NanoPocket telemetry",
  ],
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "NanoPocket — Privacy Policy",
    description:
      "What we collect, why, where it goes, how long we keep it, and your GDPR / CCPA rights.",
  },
};

interface DataCategory {
  category: string;
  items: string;
  purpose: string;
  basis: string;
  retention: string;
}

const DATA_CATEGORIES: DataCategory[] = [
  {
    category: "Account data",
    items: "Email address, password hash, display name, optional avatar URL.",
    purpose:
      "Authentication, license issuance, support correspondence, transactional email.",
    basis: "Contract performance (GDPR Art. 6(1)(b)).",
    retention: "While the account exists. Deleted within 30 days of an account-deletion request to tech@nanopocket.ai.",
  },
  {
    category: "Licensing & activation data",
    items:
      "License key, hashed machine identifier, machine label, app version, last-seen timestamp.",
    purpose:
      "Bind a license to a machine, enforce activation limits, support force-takeover (1-per-30-days).",
    basis: "Contract performance, legitimate interest in piracy prevention (GDPR Art. 6(1)(b),(f)).",
    retention:
      "While the license is active. Activation rows are removed when the user deactivates a machine; license rows persist for warranty purposes for 7 years after the last activation.",
  },
  {
    category: "Payment metadata",
    items:
      "Stripe customer ID, payment intent ID, transaction amount, region, tax breakdown. NanoPocket never sees the raw card number, CVC, or expiry.",
    purpose: "Order fulfilment, tax remittance, anti-fraud.",
    basis: "Contract performance, legal obligation (tax law).",
    retention:
      "Tax-relevant records retained for the period required by the buyer's jurisdiction (typically 7 years in the US/EU). Stripe's retention policy applies separately.",
  },
  {
    category: "Online demo content",
    items:
      "Source images and videos uploaded to the Image FaceSwap Pro 2.0 and Video FaceSwap Pro online demos.",
    purpose:
      "Process the swap or generation request and return the result to the same browser session.",
    basis: "Consent (the user actively uploads).",
    retention:
      "Volatile only. Source files are processed in working memory on a hosted GPU and discarded once the response is returned. Files are not persisted to a database, an object store, or a model-training pipeline.",
  },
  {
    category: "Feedback & survey responses",
    items:
      "Like / dislike buttons, optional text feedback, contact-form submissions.",
    purpose: "Product improvement, support handling.",
    basis: "Consent (the user submits).",
    retention:
      "Indefinitely while the account exists, deleted with the account. Anonymised aggregate counts may be retained.",
  },
  {
    category: "Web analytics",
    items: "Aggregate page-view counts, referrer, UTM parameters, country-level IP geolocation.",
    purpose: "Understand traffic and content effectiveness.",
    basis: "Legitimate interest (GDPR Art. 6(1)(f)).",
    retention: "14 months in Google Analytics 4 (default GA4 retention).",
  },
  {
    category: "Server logs",
    items:
      "HTTP request logs from Vercel and Supabase: timestamp, IP address, path, status code, user-agent.",
    purpose: "Operational debugging and security monitoring.",
    basis: "Legitimate interest in service reliability (GDPR Art. 6(1)(f)).",
    retention: "30 days in Vercel; Supabase log retention follows the active plan.",
  },
];

interface Subprocessor {
  name: string;
  purpose: string;
  region: string;
  policy: string;
}

const SUBPROCESSORS: Subprocessor[] = [
  {
    name: "Vercel, Inc.",
    purpose: "Web hosting, edge delivery, server logs.",
    region: "Global edge; primary US-East.",
    policy: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Supabase, Inc.",
    purpose: "Authentication, database (Postgres), storage of account/license/feedback rows.",
    region: "US-East-1 by default.",
    policy: "https://supabase.com/privacy",
  },
  {
    name: "Stripe, Inc.",
    purpose: "Payment processing, tax calculation, invoice generation.",
    region: "US, EU.",
    policy: "https://stripe.com/privacy",
  },
  {
    name: "Cloudflare, Inc.",
    purpose: "Demo tunnels for online image / video face-swap demos.",
    region: "Global edge.",
    policy: "https://www.cloudflare.com/privacypolicy/",
  },
  {
    name: "Google LLC (Google Analytics 4)",
    purpose: "Aggregate web analytics.",
    region: "Global; configured to anonymise IP at collection.",
    policy: "https://policies.google.com/privacy",
  },
  {
    name: "GitHub, Inc.",
    purpose:
      "Source code hosting (release artifacts may be served over LFS for some downloads).",
    region: "US.",
    policy: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
  },
  {
    name: "Discord, Inc.",
    purpose: "Public community channel (opt-in by user).",
    region: "US.",
    policy: "https://discord.com/privacy",
  },
];

const privacyJsonLd = {
  "@context": "https://schema.org",
  "@type": "PrivacyPolicy",
  name: "NanoPocket Privacy Policy",
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
  about: {
    "@type": "Thing",
    name: "Personal data processing by NanoPocket",
  },
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
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

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy Policy
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            This policy describes what NanoPocket collects, why, where it goes, how long we keep
            it, and what rights every user has. It is the authoritative source for these answers.
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
        {/* TOC */}
        <nav className="mb-12 rounded-2xl border border-border/60 bg-muted/30 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Contents
          </h2>
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["Who we are", "who"],
              ["What we collect", "collect"],
              ["Subprocessors", "subprocessors"],
              ["Online demo handling", "demos"],
              ["Cookies & web tracking", "cookies"],
              ["GDPR rights (EU/UK)", "gdpr"],
              ["CCPA rights (California)", "ccpa"],
              ["International transfers", "transfers"],
              ["Children's data", "children"],
              ["Security", "security"],
              ["Changes to this policy", "changes"],
              ["How to contact us", "contact"],
            ].map(([label, anchor]) => (
              <li key={anchor as string}>
                <a
                  href={`#${anchor}`}
                  className="text-sm text-emerald-500 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section id="who" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            1. Who we are
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            NanoPocket is the data controller for every personal-data category described below.
            For privacy questions, write to{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>
            . We are not a registered &quot;publisher&quot; or &quot;data fiduciary&quot; under any
            sector-specific regime; we operate as a software vendor.
          </p>
        </section>

        <section id="collect" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            2. What we collect, why, and for how long
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every category below is listed with its purpose, lawful basis under the GDPR, and
            retention period. If a category is not on this list, we do not collect it. We do not
            collect special-category data (health, biometric identifiers used for unique
            identification, political opinions, religion, sexuality) and we do not perform
            automated decision-making with legal effects on data subjects.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">What it is</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Lawful basis</th>
                  <th className="px-4 py-3">Retention</th>
                </tr>
              </thead>
              <tbody>
                {DATA_CATEGORIES.map((d, i) => (
                  <tr
                    key={d.category}
                    className={`border-t border-border/40 ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 align-top text-sm font-semibold text-foreground">
                      {d.category}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">{d.items}</td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {d.purpose}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {d.basis}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {d.retention}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="subprocessors" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            3. Subprocessors
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We use the following subprocessors. Each maintains its own privacy policy; we link
            directly to the relevant page so it can be inspected without going through us.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Subprocessor</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Policy</th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((s, i) => (
                  <tr
                    key={s.name}
                    className={`border-t border-border/40 ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 align-top text-sm font-semibold text-foreground">
                      {s.name}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">{s.purpose}</td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">{s.region}</td>
                    <td className="px-4 py-4 align-top text-sm">
                      <a
                        href={s.policy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:underline"
                      >
                        view policy
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="demos" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            4. Online demo handling — what happens to uploaded faces
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The Image FaceSwap Pro 2.0 and Video FaceSwap Pro online demos are the only NanoPocket
            surfaces that receive user-uploaded face content. We treat that content as follows:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">Volatile processing only.</strong> Source files
              live in the demo GPU&apos;s working memory for the duration of one inference and are
              discarded immediately after the response is returned.
            </li>
            <li>
              <strong className="text-foreground">No model training.</strong> Demo content is never
              used to train, fine-tune, evaluate, or red-team any model. There is no &quot;opt-in
              to improve our AI&quot; checkbox; training on user content is simply not part of any
              product surface.
            </li>
            <li>
              <strong className="text-foreground">No persistence.</strong> Demo content is not
              copied to long-term object storage, a database, a content-moderation queue, or any
              human-review pipeline.
            </li>
            <li>
              <strong className="text-foreground">No third-party sharing.</strong> Demo content is
              not transferred to advertising networks, model marketplaces, or any third party
              outside the subprocessor list above.
            </li>
            <li>
              <strong className="text-foreground">Consent &amp; lawful use.</strong> By submitting
              a face to the demo, the uploader confirms they hold all rights necessary to do so
              and that the use is lawful (no impersonation, no non-consensual likeness, no minors
              in adult contexts).
            </li>
          </ul>
        </section>

        <section id="cookies" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            5. Cookies &amp; web tracking
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We use a single first-party session cookie for authenticated dashboards (set by
            Supabase&apos;s auth client). Google Analytics 4 sets analytics cookies for aggregate
            traffic measurement; IPs are anonymised at collection. We do not use advertising
            pixels (Meta Pixel, TikTok Pixel, LinkedIn Insight Tag, Google Ads conversion pixels,
            etc.) and we do not retarget visitors.
          </p>
        </section>

        <section id="gdpr" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            6. GDPR rights (EU / UK / EEA / Switzerland)
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Data subjects have the following rights under the GDPR (and the UK GDPR / Swiss FADP
            equivalents). Email{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>{" "}
            from the address on the account; we respond within 30 days as required.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Right of access (Art. 15) — receive a copy of personal data we hold.</li>
            <li>Right to rectification (Art. 16) — correct inaccurate or incomplete data.</li>
            <li>Right to erasure (Art. 17) — delete the account and associated data.</li>
            <li>Right to restrict processing (Art. 18).</li>
            <li>Right to data portability (Art. 20) — export in JSON format.</li>
            <li>Right to object to processing on legitimate-interest grounds (Art. 21).</li>
            <li>
              Right to lodge a complaint with a supervisory authority (e.g. CNIL, ICO, BfDI). We
              encourage users to contact us first; we will not retaliate against complainants.
            </li>
          </ul>
        </section>

        <section id="ccpa" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            7. CCPA rights (California)
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            California residents have the right to know, the right to delete, the right to
            correct, and the right to limit use of sensitive personal information under the CCPA
            (as amended by the CPRA). Submit verifiable consumer requests to{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>
            . We respond within 45 days.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We do not sell or share personal information for cross-context behavioural advertising.
            Our Global Privacy Control (GPC) signal handling: GPC has no effect on our processing
            because we do not engage in &quot;sale&quot; or &quot;sharing&quot; under the CPRA.
          </p>
        </section>

        <section id="transfers" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            8. International data transfers
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Account, license, and demo infrastructure runs primarily in US-East. EU-based users
            who use these services therefore transfer personal data to the US. We rely on the
            European Commission&apos;s Standard Contractual Clauses (2021/914) where required, and
            on the EU-U.S. Data Privacy Framework where the relevant subprocessor is certified.
          </p>
        </section>

        <section id="children" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            9. Children&apos;s data
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            NanoPocket is not directed to children under 16 (under 13 in the United States). We do
            not knowingly collect data from children. If a parent or guardian becomes aware that
            their child has signed up, please email{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>{" "}
            and we will delete the account.
          </p>
        </section>

        <section id="security" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            10. Security
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We use TLS 1.2+ in transit and AES-256 at rest for managed-database content. Account
            passwords are stored as bcrypt hashes by Supabase. Vulnerability reports are accepted
            at{" "}
            <a
              href="mailto:security@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              security@nanopocket.ai
            </a>
            ; the full coordinated-disclosure policy is on the{" "}
            <Link
              href="/security"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              Security page
            </Link>
            .
          </p>
        </section>

        <section id="changes" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            11. Changes to this policy
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Material changes will be announced via email to the address on the user&apos;s account
            at least 14 days before they take effect. Non-material edits (typo fixes, link
            updates, subprocessor list refreshes within the same category) are made silently and
            reflected in the version number above.
          </p>
        </section>

        <section id="contact">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            12. How to contact us
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Privacy questions:{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>
            . Security reports:{" "}
            <a
              href="mailto:security@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              security@nanopocket.ai
            </a>
            . Sales / partnership questions:{" "}
            <a
              href="mailto:sales@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              sales@nanopocket.ai
            </a>
            .
          </p>
        </section>
      </article>

      <Footer />
    </main>
  );
}
