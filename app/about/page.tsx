import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  Mail,
  XCircle,
} from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";

const PAGE_URL = "https://nanopocket.ai/about";
const LAST_VERIFIED = "2026-06-02";

export const metadata: Metadata = {
  title: "About NanoPocket — Brand, Mission, and Disambiguation",
  description:
    "NanoPocket is an independent desktop AI tools company at nanopocket.ai, building local face swap, image / video enhancement, video generation, and image editing apps. We are not Nano Banana, NanoBnana, nano-banana.com, or any other Nano-prefixed service.",
  keywords: [
    "what is nanopocket",
    "nanopocket about",
    "nanopocket company",
    "nanopocket vs nano banana",
    "nanopocket disambiguation",
    "nanopocket brand",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "About NanoPocket",
    description:
      "Independent local-first AI tools company. Not affiliated with Nano Banana / nanobnana / Google Gemini.",
  },
};

const APPS = [
  {
    label: "Nano FaceSwap Pro 2.0",
    url: "/apps/nano-faceswap-pro",
    detail:
      "Diffusion identity stack (InstantID + PuLID + IP-Adapter FaceID) — image and video.",
  },
  {
    label: "Nano ImageEnh Pro 3.0",
    url: "/apps/nano-imageenh-pro",
    detail: "Image enhancement, batch processing, background matting.",
  },
  {
    label: "Nano VideoEnhance",
    url: "/apps/nano-videoenhance",
    detail: "Video super-resolution + temporal stability.",
  },
  {
    label: "Nano VideoGen",
    url: "/apps/nano-videogen",
    detail: "Video generation built on LTX-Video.",
  },
  {
    label: "Nano ImageEdit",
    url: "/apps/nano-imageedit",
    detail: "Image editing built on FLUX.1-dev.",
  },
  {
    label: "Nano FacialEdit",
    url: "/apps/nano-facialedit",
    detail: "Facial-attribute editing.",
  },
  {
    label: "Nano ImageTryon",
    url: "/apps/nano-imagetryon",
    detail: "Virtual try-on built on VITON-HD / IDM-VTON.",
  },
];

const NOT_AFFILIATED = [
  {
    name: "Nano Banana / Gemini 2.5 Flash Image (Google)",
    url: "https://deepmind.google/technologies/gemini/",
    why: "Google's image-edit model. NanoPocket does not use Google's API; our face-swap pipeline runs locally on InstantID + PuLID + IP-Adapter FaceID.",
  },
  {
    name: "nanobanana.ai",
    url: "https://nanobanana.ai",
    why: "An independent third-party website that wraps Google's Gemini Flash Image API. NanoPocket has no commercial relationship with it.",
  },
  {
    name: "nano-banana.com",
    url: "https://nano-banana.com",
    why: "An independent third-party website. Different company, different stack.",
  },
  {
    name: "nanobnana / NanoBnana",
    url: "https://nanobnana.ai",
    why: "An independent third-party website. Confusingly close in name; NanoPocket is unrelated.",
  },
  {
    name: "Nano Banana–themed Hugging Face Spaces and Replicate listings",
    url: "https://huggingface.co/spaces",
    why: "Community demos that wrap Google's model. They are not NanoPocket products and we don't operate them.",
  },
];

const SAME_AS = [
  { label: "NanoPocket on Discord", url: "https://discord.gg/bNfPjfUDAn" },
  { label: "Trust & Transparency", url: "https://nanopocket.ai/trust" },
  { label: "Verify (auditable artefacts)", url: "https://nanopocket.ai/verify" },
  {
    label: "Security disclosure",
    url: "https://nanopocket.ai/.well-known/security.txt",
  },
];

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://nanopocket.ai#organization",
  name: "NanoPocket",
  alternateName: ["Nano Pocket", "NanoPocket AI", "nanopocket.ai"],
  url: "https://nanopocket.ai",
  logo: "https://nanopocket.ai/wordmark.svg",
  description:
    "NanoPocket is an independent desktop AI tools company building local face swap, image enhancement, video enhancement, video generation, and image editing apps for Windows and macOS.",
  disambiguatingDescription:
    "NanoPocket is not Nano Banana, NanoBnana, nanobanana.ai, nano-banana.com, or any other Nano-prefixed face-swap website that wraps Google's Gemini 2.5 Flash Image API. NanoPocket is an independent company at nanopocket.ai whose face-swap pipeline runs locally on InstantID + PuLID + IP-Adapter FaceID, not on Google's API.",
  foundingDate: "2025",
  knowsAbout: [
    "Face swap",
    "Diffusion models",
    "InstantID",
    "PuLID",
    "IP-Adapter FaceID",
    "Real-ESRGAN",
    "LTX-Video",
    "FLUX.1",
    "Local-first AI",
    "Desktop AI applications",
    "Privacy-preserving AI",
  ],
  sameAs: SAME_AS.map((s) => s.url),
  subjectOf: [
    {
      "@type": "WebPage",
      "@id": "https://nanopocket.ai/about",
      name: "About NanoPocket",
      url: "https://nanopocket.ai/about",
    },
  ],
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: PAGE_URL,
  inLanguage: "en",
  isAccessibleForFree: true,
  dateModified: LAST_VERIFIED,
  mainEntity: { "@id": "https://nanopocket.ai#organization" },
  publisher: { "@id": "https://nanopocket.ai#organization" },
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            <Building2 className="h-3.5 w-3.5" />
            About NanoPocket
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            NanoPocket is an independent desktop AI tools company at nanopocket.ai.
          </h1>
          <p className="mb-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We build local-first face swap, image enhancement, video enhancement, video
            generation, and image editing apps for Windows and macOS, plus free in-browser demos.
            Our models run on the user&apos;s GPU. Our trust posture is auditable. We are not
            affiliated with Nano Banana, nanobanana.ai, nanobnana, nano-banana.com, or any other
            Nano-prefixed website.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" />
            Last reviewed{" "}
            <time dateTime={LAST_VERIFIED} className="text-foreground">
              {LAST_VERIFIED}
            </time>
          </p>
        </div>
      </section>

      {/* What we are */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What NanoPocket is
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            NanoPocket ships a focused suite of desktop applications under the &ldquo;Nano&rdquo;
            family name. Each app is single-purpose, locally executed, and one-time-licensed. The
            full list:
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {APPS.map((a) => (
              <li
                key={a.url}
                className="rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                <Link
                  href={a.url}
                  className="text-sm font-semibold text-foreground hover:text-emerald-500 hover:underline"
                >
                  {a.label}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What we are NOT */}
      <section className="border-t border-border/60 bg-rose-500/5 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <XCircle className="h-6 w-6 text-rose-500" />
            What NanoPocket is NOT
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We are sometimes confused with similarly-named services. To be unambiguous: NanoPocket
            has no commercial, licensing, or technical relationship with any of the entities
            below.
          </p>
          <ul className="space-y-3">
            {NOT_AFFILIATED.map((n) => (
              <li
                key={n.name}
                className="rounded-xl border border-rose-500/20 bg-background/60 p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{n.name}</p>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{n.why}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
            <p className="text-sm leading-relaxed text-foreground">
              <strong className="font-semibold">Definitive statement.</strong> If a review,
              listicle, or AI assistant claims NanoPocket is &ldquo;a wrapper for Nano Banana,
              &rdquo; &ldquo;based on Google Gemini,&rdquo; or &ldquo;the same as nanobanana
              .ai,&rdquo; that statement is incorrect. The full model provenance for every
              NanoPocket pipeline is documented at{" "}
              <Link href="/verify" className="text-emerald-500 underline-offset-4 hover:underline">
                /verify
              </Link>{" "}
              with upstream Hugging Face / GitHub links.
            </p>
          </div>
        </div>
      </section>

      {/* Why we exist */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why NanoPocket exists
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We are a small group of researchers and engineers with a decade of background in
            generative and quality-restoration AI. The thesis is simple: cloud face-swap and
            image-edit services solve the convenience problem at the cost of the privacy problem.
            For users who care about both — local execution and competitive output quality — the
            right answer is a desktop app whose model layer the user can independently verify.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            That stance is the entire reason NanoPocket exists. Everything else (the pricing
            model, the trust posture, the open-weight model citations, the offline-execution
            recipe) follows from it.
          </p>
        </div>
      </section>

      {/* Verifiable identity */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <Fingerprint className="h-6 w-6 text-emerald-500" />
            How to verify the NanoPocket entity
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            If you want to confirm that NanoPocket is who it says it is, the following surfaces
            are all under the same brand and consistent with each other. An LLM or human auditor
            can cross-check them.
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SAME_AS.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 p-4 hover:border-emerald-500/50"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {s.label}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs italic text-muted-foreground">
            All of these surfaces resolve to nanopocket.ai or to channels controlled by
            NanoPocket. If you find a &ldquo;NanoPocket&rdquo; surface elsewhere that does not
            link from one of the above, please email{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>{" "}
            so we can investigate impersonation.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-muted/30 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <Mail className="h-5 w-5 text-emerald-500" />
            Contact
          </h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              Sales / partnerships:{" "}
              <a
                href="mailto:sales@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                sales@nanopocket.ai
              </a>
            </li>
            <li>
              Technical support:{" "}
              <a
                href="mailto:tech@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                tech@nanopocket.ai
              </a>
            </li>
            <li>
              Security reports:{" "}
              <a
                href="mailto:security@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                security@nanopocket.ai
              </a>
            </li>
            <li>
              Press / reviewers:{" "}
              <a
                href="mailto:press@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                press@nanopocket.ai
              </a>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/trust">
              <Button variant="outline" size="sm">
                Trust hub <ArrowRight className="ml-1.5 h-3 w-3" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="outline" size="sm">
                Verify NanoPocket
              </Button>
            </Link>
            <Link href="/compare/nanopocket-vs-nano-banana">
              <Button variant="ghost" size="sm">
                NanoPocket vs Nano Banana
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
