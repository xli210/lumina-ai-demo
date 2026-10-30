import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2, ShieldCheck } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/privacy";
const EFFECTIVE_DATE = "2026-10-30";
const POLICY_VERSION = "1.1";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    `NanoPocket Privacy Policy: what we collect, why, where it goes, how long we keep it, how uploaded faces are handled, and the GDPR / CCPA rights available to every user. Effective ${EFFECTIVE_DATE}, version ${POLICY_VERSION}.`,
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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket" }],
    type: "website",
    url: PAGE_URL,
    title: "NanoPocket — Privacy Policy",
    description:
      "What we collect, why, where it goes, how long we keep it, and your GDPR / CCPA rights.",
  },
};

/** How long online-tool uploads and results are kept: used in the table and in section 4. */
const ONLINE_RETENTION =
  "Video FaceSwap Online: uploads and results are deleted 24 hours after the video is made. Nano FaceStudio Online, Nano HeadSwap Pro and Nano ImageEdit 2.0 Online: uploads and results are kept in private storage (Cloudflare R2 object storage or the GPU servers' disks), reachable only through signed links that expire within an hour, so the result can be downloaded. They are not yet deleted automatically after a fixed period; they are deleted on request (tech@nanopocket.ai) and with the account. Never used to train models.";

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
    items: "Email address, sign-in method (email link, password or Google), password hash if a password is set, display name, optional avatar URL.",
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
      "Stripe customer ID, payment intent ID, transaction amount, region, tax breakdown and, if auto top-up is on, that setting and Stripe's reference to the saved card. NanoPocket never sees the raw card number, CVC, or expiry.",
    purpose: "Order fulfilment, tax remittance, anti-fraud.",
    basis: "Contract performance, legal obligation (tax law).",
    retention:
      "Tax-relevant records retained for the period required by the buyer's jurisdiction (typically 7 years in the US/EU). Stripe's retention policy applies separately.",
  },
  {
    category: "Online tool uploads and results",
    items:
      "Photos and videos uploaded to the online tools (Nano FaceStudio Online, Nano HeadSwap Pro, Video FaceSwap Online and Nano ImageEdit 2.0 Online), the results made from them, and the face data derived from them while a job runs (see section 4).",
    purpose:
      "Carry out the swap or edit the user asked for and let the user download the result.",
    basis:
      "Contract performance (GDPR Art. 6(1)(b)); for face data, the explicit consent the user gives by uploading (Art. 9(2)(a)).",
    retention: ONLINE_RETENTION,
  },
  {
    category: "Credits and job records",
    items:
      "Credit balance and statement (purchases, free grants, spends, refunds), job identifiers, and the mode, size and price of each job. Not the photos or videos themselves.",
    purpose: "Charge and refund credits correctly, answer billing questions, prevent abuse.",
    basis: "Contract performance, legal obligation (accounting), legitimate interest in preventing abuse (GDPR Art. 6(1)(b),(c),(f)).",
    retention:
      "While the account exists. Records of purchases are kept for the period tax law requires (typically 7 years).",
  },
  {
    category: "Invite rewards",
    items:
      "Your invite code. For an account opened through an invite link: which account invited it, when, and whether the reward was paid.",
    purpose: "Run the invite rewards described in the Terms (section 6) and stop self-invites.",
    basis: "Contract performance, legitimate interest in preventing abuse (GDPR Art. 6(1)(b),(f)).",
    retention: "While the accounts involved exist; deleted with either account.",
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
    items:
      "Pages viewed, referrer, UTM parameters, approximate location derived by Google, device and browser type, and events such as sign-up, checkout started and purchase.",
    purpose: "Understand traffic, which pages and sources lead to sign-ups and purchases, and content effectiveness.",
    basis: "Legitimate interest (GDPR Art. 6(1)(f)). You can object or opt out at any time (section 5).",
    retention: "14 months in Google Analytics 4 (default GA4 retention).",
  },
  {
    category: "Free-credit abuse prevention",
    items:
      "A random device id held in a first-party cookie, and a one-way keyed hash of your IP address (an IPv6 address is reduced to its /64 first). Neither is stored in readable form, and the hash cannot be turned back into an address. We also record whether this account was allowed to receive free credits.",
    purpose:
      "Stop one person collecting the free welcome credits and top-ups again by opening several accounts.",
    basis: "Legitimate interest in preventing abuse (GDPR Art. 6(1)(f)).",
    retention:
      "The hashes are kept while the account exists and deleted with it. The IP hash only counts against a new account for 30 days.",
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
    purpose: "Payment processing, receipts and invoices, the saved card for optional auto top-up.",
    region: "US, EU.",
    policy: "https://stripe.com/privacy",
  },
  {
    name: "Cloudflare, Inc.",
    purpose: "Object storage for online-tool uploads and results (R2), and network tunnels to the GPU servers.",
    region: "Global edge.",
    policy: "https://www.cloudflare.com/privacypolicy/",
  },
  {
    name: "Render Services, Inc.",
    purpose: "Hosts the gateways that pass online-tool jobs between nanopocket.ai and the GPU servers.",
    region: "US.",
    policy: "https://render.com/privacy",
  },
  {
    name: "Google LLC (Google Analytics 4)",
    purpose: "Web analytics.",
    region: "Global; GA4 does not log or store IP addresses.",
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
              ["Uploaded photos, videos & faces", "demos"],
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
            retention period. If a category is not on this list, we do not collect it. We never
            use anyone&apos;s face to identify them, and we do not collect other special-category
            data (health, political opinions, religion, sexuality). The face data the online tools
            derive while they work is described in section 4. We do not perform automated
            decision-making with legal effects on data subjects.
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
            4. Online tools: what happens to uploaded photos, videos and faces
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The online tools (Nano FaceStudio Online, Nano HeadSwap Pro, Video FaceSwap Online and
            Nano ImageEdit 2.0 Online) are the only NanoPocket surfaces that receive user-uploaded
            photos and videos. The desktop apps process everything on the user&apos;s own machine.
            We treat online-tool content as follows:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">Where it is processed.</strong> Jobs run on GPU
              servers operated by NanoPocket, reached through gateways hosted by Render and network
              tunnels run by Cloudflare. Nano FaceStudio Online re-encodes photos in the browser
              before upload, which removes their EXIF data, including GPS location.
            </li>
            <li>
              <strong className="text-foreground">Face data.</strong> To swap a face, the models
              detect the faces in a file and derive numerical representations of facial features
              from them (face embeddings). On Video FaceSwap Online the same kind of measure is used
              to show how closely a result matches the reference photo. Face data is used only to
              carry out the job the user asked for. It is never used to identify anyone, never
              compared against a database of people, never sold, and never kept as a separate record
              or beyond the job&apos;s own files.
            </li>
            <li>
              <strong className="text-foreground">How long files are kept.</strong> {ONLINE_RETENTION}
            </li>
            <li>
              <strong className="text-foreground">No model training.</strong> Uploads and results
              are never used to train, fine-tune, evaluate, or red-team any model. There is no
              &quot;opt-in to improve our AI&quot; checkbox; training on user content is simply not
              part of any product surface.
            </li>
            <li>
              <strong className="text-foreground">No human review.</strong> Files are not looked at
              by people, except when we investigate a misuse report or a support request about a
              specific job.
            </li>
            <li>
              <strong className="text-foreground">No third-party sharing.</strong> Uploads and
              results are not transferred to advertising networks, model marketplaces, or any third
              party outside the subprocessor list above.
            </li>
            <li>
              <strong className="text-foreground">Consent &amp; lawful use.</strong> Before a face is
              processed, the tools ask the uploader to confirm they have the right to use it. The
              uploader is responsible for that being true and for the use being lawful (no
              impersonation, no non-consensual likeness, no sexual content of real people, nothing
              involving minors in adult contexts). By uploading a photo or video of themselves, the
              uploader consents to the face-data processing described here.
            </li>
            <li>
              <strong className="text-foreground">US state biometric laws.</strong> Some US state
              laws (for example in Illinois, Texas and Washington) treat face geometry as biometric
              information. Where such a law applies: we collect face data only to perform the job
              the user requests; we do not sell, lease, trade or otherwise profit from it; we
              destroy it no later than the job&apos;s files, and in any case within the time the law
              requires; and the user gives consent by uploading. Anyone who does not consent should
              not upload a photo or video of themselves, and anyone whose face was uploaded by
              someone else without permission can ask us to delete it (tech@nanopocket.ai).
            </li>
          </ul>
        </section>

        <section id="cookies" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            5. Cookies &amp; web tracking
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We use a first-party session cookie for authenticated dashboards (set by
            Supabase&apos;s auth client), and a second first-party cookie, <code>np_did</code>,
            holding a random device id for two years. It is used only to tell whether a second
            account on the same browser has already collected free credits, is never shared with
            another party, and is not used for advertising or analytics. If you arrive through a
            friend&apos;s invite link, a third first-party cookie, <code>np_ref</code>, holds that
            friend&apos;s invite code for 30 days so the invite reward can be paid if you open an
            account and buy credits. Google Analytics 4 sets analytics cookies to measure traffic
            and which sources lead to sign-ups and purchases; GA4 does not log or store IP
            addresses. You can block or delete these cookies in your browser settings, or opt out
            of Google Analytics with Google&apos;s browser add-on
            (tools.google.com/dlpage/gaoptout). We do not use advertising pixels (Meta Pixel,
            TikTok Pixel, Reddit Pixel, LinkedIn Insight Tag, Google Ads conversion pixels, etc.)
            and we do not retarget visitors.
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
            Account, license, and online-tool infrastructure runs primarily in the US. EU-based users
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
            NanoPocket is for adults. It is not directed to anyone under 18, accounts and credit
            purchases are for adults only, and we do not knowingly collect data from anyone under
            18. If a parent or guardian becomes aware that their child has signed up, or that a
            child&apos;s photo was uploaded, please email{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>{" "}
            and we will delete the account and any files we still hold.
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
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Version 1.1 (2026-10-30) corrects how online-tool files are stored and for how long,
            describes the face data the tools derive and the US state biometric notice, adds
            credits and job records, invite rewards and Render as a subprocessor, sets the minimum
            age to 18, and explains how to opt out of analytics. Corrections that bring this policy
            in line with how the services already work take effect on publication.
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
