import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2, Fingerprint, Lock, ShieldAlert } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/security";
const LAST_REVIEWED = "2026-05-29";

export const metadata: Metadata = {
  title: "Security & Vulnerability Disclosure — NanoPocket",
  description:
    "How to report a security issue to NanoPocket, our coordinated-disclosure timeline, code-signing posture, and the standards we follow. Last reviewed 2026-05-29.",
  keywords: [
    "NanoPocket security",
    "NanoPocket vulnerability disclosure",
    "NanoPocket security.txt",
    "NanoPocket bug bounty",
    "NanoPocket code signing",
    "NanoPocket SBOM",
    "report security issue NanoPocket",
  ],
  alternates: { canonical: "/security" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "NanoPocket — Security & Vulnerability Disclosure",
    description:
      "How to report a security issue, our coordinated-disclosure timeline, and code-signing posture.",
  },
};

const securityJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "NanoPocket Security & Vulnerability Disclosure",
  url: PAGE_URL,
  inLanguage: "en",
  isAccessibleForFree: true,
  dateModified: LAST_REVIEWED,
  publisher: {
    "@type": "Organization",
    "@id": "https://nanopocket.ai#organization",
    name: "NanoPocket",
    url: "https://nanopocket.ai",
  },
  mainEntityOfPage: PAGE_URL,
};

export default function SecurityPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(securityJsonLd) }}
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

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            <ShieldAlert className="h-3.5 w-3.5" />
            Security
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Security &amp; vulnerability disclosure
          </h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            We treat security reports as first-priority. This page is the authoritative source for
            how to reach the security team, what response time to expect, and what we ask of
            researchers in exchange.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" />
            Last reviewed{" "}
            <time dateTime={LAST_REVIEWED} className="text-foreground">
              {LAST_REVIEWED}
            </time>
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-6 pb-24">
        <section id="report" className="mb-12 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            Report a vulnerability
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Email{" "}
            <a
              href="mailto:security@nanopocket.ai"
              className="font-semibold text-rose-500 underline-offset-4 hover:underline"
            >
              security@nanopocket.ai
            </a>{" "}
            with reproduction steps, affected URL or app version, and the impact you observed. If
            the report is sensitive, encrypt with our PGP key (see fingerprint below).
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Plain-language reports in any language are welcome. We do not require a CVE template.
            We acknowledge every report within 72 hours and provide a status update within 7 days.
          </p>
        </section>

        <section id="scope" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">In scope</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>nanopocket.ai and its subdomains.</li>
            <li>The Image FaceSwap Pro 2.0 and Video FaceSwap Pro online demos (Cloudflare tunnels).</li>
            <li>The desktop applications: Nano FaceSwap, FaceSwap Pro, ImageEnh Pro, VideoEnhance, VideoGen, ImageEdit, FacialEdit, ImageTryon.</li>
            <li>Account, license, and activation APIs (auth, license, activations).</li>
            <li>Update channel and the signed-manifest update mechanism.</li>
          </ul>
        </section>

        <section id="out-of-scope" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">Out of scope</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Volumetric DDoS or rate-limit testing without prior coordination.</li>
            <li>
              Issues in third-party subprocessors (Stripe, Vercel, Supabase, Cloudflare, Google) —
              please report those to the respective vendor under their disclosure policy.
            </li>
            <li>Physical security of demo GPU hosts.</li>
            <li>Issues that require a malicious local OS / firmware compromise to be reachable.</li>
            <li>Self-XSS, missing rate limits without proven impact, missing security headers without proof of exploit.</li>
            <li>Phishing, social engineering, and password-reuse attacks against NanoPocket staff.</li>
          </ul>
        </section>

        <section id="timeline" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            Coordinated disclosure timeline
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">Acknowledge:</strong> ≤ 72 hours after the
              report.
            </li>
            <li>
              <strong className="text-foreground">Validate:</strong> ≤ 7 days, with the impact
              assessment shared with the reporter.
            </li>
            <li>
              <strong className="text-foreground">Fix:</strong> 14–90 days depending on severity
              (CVSS-based). Critical issues are patched within 14 days; high within 30; medium
              within 60; low within 90.
            </li>
            <li>
              <strong className="text-foreground">Public disclosure:</strong> after a fix is
              shipped, on coordinated date with the reporter. We credit reporters by name (or
              handle) in the release notes unless they prefer anonymity.
            </li>
          </ul>
        </section>

        <section id="safe-harbor" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            Researcher safe harbor
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Good-faith research conducted in accordance with this policy — meaning the researcher
            stops at proof of vulnerability, does not access or exfiltrate user data beyond what
            is needed to demonstrate impact, and reports promptly — will not be the basis of a
            legal action by NanoPocket. We treat researchers as colleagues, not threats.
          </p>
        </section>

        <section id="bounty" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            Bug bounty status
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            NanoPocket does not currently operate a paid bug bounty programme. We may offer
            discretionary swag or a license credit on a case-by-case basis. We will publicly
            credit the reporter on this page and in the relevant release notes.
          </p>
        </section>

        <section id="hardening" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            What we do internally
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">Code signing.</strong> Windows builds are
              Authenticode-signed; macOS builds are signed and notarised by Apple. Unsigned
              installers are not distributed.
            </li>
            <li>
              <strong className="text-foreground">Update channel.</strong> Updates are fetched
              over HTTPS with a signed manifest. Users can opt out of automatic updates.
            </li>
            <li>
              <strong className="text-foreground">License posture.</strong> Activation is bound to
              a hashed machine identifier; the raw machine ID never leaves the device.
            </li>
            <li>
              <strong className="text-foreground">Dependency posture.</strong> CI runs npm audit
              and a vulnerability scan (Trivy) on every pull request. Critical CVEs block the
              merge.
            </li>
            <li>
              <strong className="text-foreground">Secret hygiene.</strong> No secrets are
              committed to git; Vercel and Supabase manage runtime secrets. Codacy scans flag
              accidental commits.
            </li>
            <li>
              <strong className="text-foreground">Standards followed.</strong> OWASP ASVS Level 1
              for the web application, OWASP MASVS for considerations on the desktop binary.
            </li>
          </ul>
        </section>

        <section id="pgp" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">PGP key</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sensitive reports may be encrypted to <code className="rounded bg-muted px-1.5 py-0.5">security@nanopocket.ai</code>. Request the
            current public key by emailing the address above with the subject line{" "}
            <em>&ldquo;PGP key request&rdquo;</em>; the key fingerprint and ASCII-armored block
            will be returned out-of-band. We rotate the key annually.
          </p>
        </section>

        <section id="securitytxt" className="mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            <Fingerprint className="-mt-1 mr-2 inline h-5 w-5 text-emerald-500" />
            security.txt
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We publish the RFC 9116 file at{" "}
            <a
              href="https://nanopocket.ai/.well-known/security.txt"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              /.well-known/security.txt
            </a>
            . Automated scanners (e.g. internetwide vuln-disclosure indexes) read this file
            without needing to crawl the marketing site. The file is signed-mirror to this page;
            both sources are authoritative.
          </p>
        </section>

        <section id="hall" className="mb-4">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            <Lock className="-mt-1 mr-2 inline h-5 w-5 text-rose-500" />
            Hall of fame
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We publicly credit reporters here once a fix is shipped and the reporter consents.
            <span className="ml-1 italic text-muted-foreground/70">
              No credited reports yet — be the first.
            </span>
          </p>
        </section>
      </article>

      <Footer />
    </main>
  );
}
