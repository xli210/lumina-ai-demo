import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  Layers,
  Maximize2,
  ScanFace,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import {
  DIFFERENTIATORS,
  FACE_STUDIO_FAQ,
  FACE_STUDIO_FULL_NAME,
  FACE_STUDIO_STEPS,
  FACE_SWAP_CREDITS,
  FACE_SWAP_USD,
  FACTS_VERIFIED,
  FREE_RENDERS_PER_DAY,
  HEAD_SWAP_CREDITS,
  HEAD_SWAP_USD,
  PERFORMANCE,
  RIVALS,
  usd,
} from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES, FREE_DAILY_CREDITS } from "@/lib/facestudio";

/**
 * /face-studio — the public, indexable landing page.
 *
 * This route is deliberately NOT auth-gated. The console it fronts is (see
 * /face-studio/launch and the `/face-studio/` middleware prefix), but the
 * description of the product has to be readable by Googlebot, Bingbot,
 * GPTBot, ClaudeBot and PerplexityBot without a session — otherwise the
 * flagship product is invisible to every search engine and every assistant,
 * which is exactly the state this page fixes.
 *
 * Every number here comes from lib/face-studio-facts.ts so the visible copy,
 * the structured data, /llms.txt and the comparison pages cannot drift apart.
 */

const PAGE_URL = "https://nanopocket.ai/face-studio";
const CONSOLE_URL = "/face-studio/launch";

export const metadata: Metadata = {
  title:
    "Nano FaceStudio Online — multi-face swap with occlusion control | NanoPocket",
  description: `Swap up to ${FACESTUDIO_MAX_FACES} faces in one photo, or replace a whole head, at full resolution with no watermark. Choose per face what to keep from the original — hair, hands, glasses. ${usd(
    FACE_SWAP_USD
  )} per face replaced, ${FREE_RENDERS_PER_DAY} free every day, credits never expire, no subscription.`,
  keywords: [
    "multi face swap",
    "group photo face swap",
    "head swap online",
    "face swap keep hair",
    "face swap occlusion",
    "full resolution face swap",
    "face swap no watermark",
    "pay per face swap",
    "group photo face swap price",
    "face swap no subscription",
    "ai face swap online",
  ],
  alternates: { canonical: "/face-studio" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Nano FaceStudio Online — multi-face swap with occlusion control",
    description: `Up to ${FACESTUDIO_MAX_FACES} faces per photo, whole-head swap, full-resolution output, and per-face control over what survives the swap. ${usd(
      FACE_SWAP_USD
    )} per render with ${FREE_RENDERS_PER_DAY} free daily.`,
  },
};

/* -------------------------------------------------------------------------- */
/* Structured data                                                             */
/* -------------------------------------------------------------------------- */

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: FACE_STUDIO_FULL_NAME,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "AI face swap",
  operatingSystem: "Any (web browser)",
  url: PAGE_URL,
  description: `Hosted AI face swap that replaces up to ${FACESTUDIO_MAX_FACES} faces in one photo, or an entire head, at source resolution with no watermark, with per-face control over which original regions are preserved.`,
  featureList: DIFFERENTIATORS.map((d) => d.title),
  offers: [
    {
      "@type": "Offer",
      name: "Face swap",
      price: FACE_SWAP_USD.toFixed(2),
      priceCurrency: "USD",
      description: `${FACE_SWAP_CREDITS} credits per face replaced, because the model runs one pass per face. Faces left alone are free. Credits never expire and there is no subscription.`,
      url: PAGE_URL,
    },
    {
      "@type": "Offer",
      name: "Head swap",
      price: HEAD_SWAP_USD.toFixed(2),
      priceCurrency: "USD",
      description: `${HEAD_SWAP_CREDITS} credits, for whole-head replacement. Head swap operates on exactly one face.`,
      url: PAGE_URL,
    },
    {
      "@type": "Offer",
      name: "Free daily allowance",
      price: "0",
      priceCurrency: "USD",
      description: `Every signed-in account is topped up to ${FREE_DAILY_CREDITS} credits per day, which is ${FREE_RENDERS_PER_DAY} full-resolution unwatermarked face swaps. Face detection is always free.`,
      url: PAGE_URL,
    },
  ],
  provider: {
    "@type": "Organization",
    name: "NanoPocket",
    url: "https://nanopocket.ai",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FACE_STUDIO_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to swap several faces in one photo with Nano FaceStudio Online",
  description: `Detect up to ${FACESTUDIO_MAX_FACES} faces in a photo, give each one its own reference, choose what to keep from the original, and render at full resolution.`,
  totalTime: "PT2M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: FACE_SWAP_USD.toFixed(2),
  },
  step: FACE_STUDIO_STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "NanoPocket",
      item: "https://nanopocket.ai",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Online face swap",
      item: "https://nanopocket.ai/face-swap",
    },
    { "@type": "ListItem", position: 3, name: "Nano FaceStudio Online", item: PAGE_URL },
  ],
};

/* -------------------------------------------------------------------------- */

const ICONS = [ScanFace, Layers, Sparkles, Maximize2, Coins, Clock, ShieldCheck, CheckCircle2];

export default function FaceStudioLandingPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-14 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <ScanFace className="h-3.5 w-3.5" />
            Hosted · pay per render
          </div>

          <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            The face swap that knows what to leave alone
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            Nano FaceStudio Online replaces up to {FACESTUDIO_MAX_FACES} faces in a single
            photo — or an entire head — and lets you choose, per face, which
            parts of the original survive. A hand in front of a cheek, a strand
            of hair across an eye, the frame of a pair of glasses: they stay.
            Everywhere else, they get painted over.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href={CONSOLE_URL}>
                Open Nano FaceStudio Online
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/credits">See credit packs</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {FREE_RENDERS_PER_DAY} free renders every day for any signed-in
            account, at full resolution with no watermark. After that,{" "}
            {usd(FACE_SWAP_USD)} per face replaced. No subscription, and credits
            never expire.
          </p>
        </div>
      </section>

      {/* Differentiators — the substance of the page */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground">
            What this does that browser face swaps generally do not
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Each claim below is paired with what the rest of the market does, so
            the comparison is checkable rather than asserted.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div
                  key={d.title}
                  className="glass rounded-2xl p-6 sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-xl bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {d.title}
                        </h3>
                        {d.rare && (
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            Rare in this market
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-foreground">{d.claim}</p>
                      <p className="mt-2.5 flex items-start gap-2 text-sm text-muted-foreground">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                        <span>{d.contrast}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Measured numbers */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground">Measured, not estimated</h2>
          <p className="mt-2 text-muted-foreground">
            Render times are for a 4000-pixel source on a warm NVIDIA A40.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERFORMANCE.map((p) => (
              <div key={p.label} className="glass rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">{p.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {p.value}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price comparison */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground">
            How the price compares
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Per-image cost for one photo face swap, normalised to USD from each
            vendor&apos;s own credit units. Checked against vendor pricing pages
            on {FACTS_VERIFIED}. We are not the cheapest, and the table says so.
          </p>

          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 font-semibold text-foreground">Service</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">Per image</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">Free tier</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">Max output</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">Head swap</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">Occlusion control</th>
                  <th className="pb-3 font-semibold text-foreground">Credits expire</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-primary/5">
                  <td className="py-3 pr-4 font-semibold text-primary">Nano FaceStudio Online</td>
                  <td className="py-3 pr-4 tabular-nums text-foreground">
                    {usd(FACE_SWAP_USD)}
                  </td>
                  <td className="py-3 pr-4 text-foreground">
                    {FREE_RENDERS_PER_DAY}/day, no watermark
                  </td>
                  <td className="py-3 pr-4 text-foreground">4080×4080</td>
                  <td className="py-3 pr-4 text-foreground">Yes</td>
                  <td className="py-3 pr-4 text-foreground">Yes, per face</td>
                  <td className="py-3 text-foreground">Never</td>
                </tr>
                {RIVALS.map((r) => (
                  <tr key={r.name} className="border-b border-border">
                    <td className="py-3 pr-4 text-foreground">{r.name}</td>
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                      {r.perImage}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.freeTier}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {r.maxResolution}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {r.headSwap ? "Yes" : "No"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {r.occlusionControl ? "Yes" : "No"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {r.creditsExpire ? "Monthly" : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            The Nano FaceStudio Online row is a one-face render, which is what the other
            rows are. We charge per face, so a six-face group render is six
            times that — and against a tool that bills per photo, a crowded
            photo is where we are most expensive. Akool also bills per face.
            Magic Hour is roughly eight times cheaper on a single face and
            gives five free swaps a day without an account; if price is the
            only thing that matters for your use, it is the better choice.
            Nano FaceStudio Online is priced for the cases where occlusion control, head
            swap, or full-resolution output decide the result.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
          <ol className="mt-7 flex flex-col gap-5">
            {FACE_STUDIO_STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{s.name}</h3>
                  <p className="mt-1 text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Not the desktop apps */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="glass-strong rounded-2xl p-7">
            <h2 className="text-xl font-bold text-foreground">
              Nano FaceStudio Online is not the desktop apps, and buying one does not
              affect the other
            </h2>
            <p className="mt-3 text-muted-foreground">
              Nano FaceStudio Online is a hosted service that runs on our GPUs and is
              billed per render in credits. The NanoPocket desktop applications
              are separate one-time purchases that run entirely on your own GPU
              with no metering, no subscription, and no per-image, per-minute or
              per-frame fee. Credits do not apply to them, and owning a desktop
              license does not consume credits. See{" "}
              <Link href="/trust" className="text-primary hover:underline">
                /trust
              </Link>{" "}
              for the authoritative pricing terms of both.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-7 flex flex-col gap-6">
            {FACE_STUDIO_FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-foreground">{f.q}</h3>
                <p className="mt-1.5 text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Try it on a group photo
          </h2>
          <p className="mt-3 text-muted-foreground">
            That is where the difference shows: {FACESTUDIO_MAX_FACES} faces in
            one pass, each with its own reference, each keeping whatever was in
            front of it.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href={CONSOLE_URL}>
                Open Nano FaceStudio Online
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/docs/face-swap-pipeline">Read the pipeline docs</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Facts on this page verified {FACTS_VERIFIED}.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
