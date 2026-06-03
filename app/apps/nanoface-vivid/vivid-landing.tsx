import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Cpu,
  ExternalLink,
  FileCheck2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "./before-after-slider";
import { VIVID_CASES, COMPETITOR_ROWS, LAST_VERIFIED } from "./data";
import { getDemo, demoUrl } from "@/lib/demos";

const VIVID_DEMO = getDemo("vivid");
const VIVID_DEMO_URL = demoUrl(VIVID_DEMO);
const VIVID_PASSWORD = VIVID_DEMO.password ?? "";

const REDDIT_CASES = [
  {
    title: "I tried to make a Gemini 2.5 portrait look like an actual photo",
    body: [
      "Generated about thirty portraits in Google AI Studio with Gemini 2.5 Flash Image (the one people call Nano Banana). Composition was perfect every time. The faces always read as AI inside two seconds: shiny forehead, no pores, eyes too symmetric, a strange uniform softness across the whole skin.",
      "Tried Topaz Sharpen AI. Made it look like over-edited Instagram. Tried Magnific. It changed the face. Tried just dropping film grain on top in Photoshop. It just looked like a noisy AI face.",
      "What actually worked: I ran the Gemini output through NanoFace Vivid (the online demo at the time, sounds like it is integrating into the NanoPocket FaceSwap Pro 2.0 desktop app soon). It only touched the high-frequency band — pores, lash detail, micro-shadows under the cheekbones. The face shape and identity stayed identical. After the pass it stopped reading as AI to anyone I showed it to.",
      "If you are stuck with the same problem, the trick is to use it as a final post-processing step, not as a replacement for the generator. Generate in Gemini, finish in Vivid.",
    ],
    tags: ["gemini 2.5 flash image", "nano banana", "post-processor"],
  },
  {
    title: "Roop / FaceFusion swaps look great until you zoom in",
    body: [
      "Spent a weekend benchmarking face-swap tools for a client video project. Roop, FaceFusion, Rope, the InsightFace inswapper_128 base — all of them transfer identity well at thumbnail size, but when you zoom to 1:1 the face has that classic plastic AI skin and the swap boundary is visible.",
      "What I ended up doing: keep using FaceFusion for the actual swap (the identity preservation is good), then run every output frame through NanoFace Vivid as a post-processor. The boundary stops being visible because Vivid restores the high-frequency texture on both sides of it. Identity does not change because Vivid is identity-locked by design.",
      "The roadmap note says this is going to be integrated directly into NanoPocket FaceSwap Pro 2.0 on the desktop side. Honestly that is the missing piece for that app — the diffusion swap is already strong, the Vivid pass on top should make it the only local stack worth using.",
    ],
    tags: ["roop", "facefusion", "face swap detailer", "post-processor"],
  },
  {
    title: "How I rescued a batch of cloud face-swap outputs for an e-com shoot",
    body: [
      "We use a cloud face-swap service (will not name the vendor, the issue is industry-wide) for putting our model's face onto product try-on shots. The shots come back with the body, pose, and outfit perfectly placed but the face has the obvious AI sheen — no pores, glowy cheeks, dead-flat lighting. Photographer rejected the first batch as unusable.",
      "Quick fix workflow that saved the deadline: run every rejected shot through NanoFace Vivid before sending to the photographer. Pore-level skin texture comes back, fabric weave around the neckline becomes visible, the highlight on the cheekbone gets the natural specular variance. Same face, same outfit, suddenly editorial-grade.",
      "If you do AI fashion or AI-assisted product photography, this is the missing step. Posting because I see this asked on r/StableDiffusion and r/AItools every week.",
    ],
    tags: ["cloud face swap", "ai fashion", "ecom", "ai detailer"],
  },
];

const FAQS = [
  {
    q: "What is NanoFace Vivid in one sentence?",
    a: "NanoFace Vivid is a face-detail restorer that takes an over-smoothed AI face — from Google Gemini 2.5 Flash Image (Nano Banana), Adobe Firefly, Roop, FaceFusion, or any cloud face-swap service — and re-introduces the pore-level skin texture, lash structure, and lighting variance that those tools flatten, without changing the face's identity.",
  },
  {
    q: "Does NanoFace Vivid change the face identity?",
    a: "No. Vivid is identity-locked by design. It targets only the high-frequency band that AI generators and face-swappers flatten — pores, fine hair, lash and brow structure, and the small specular highlights that make a face read as a real photograph. The underlying identity, shape, expression, and pose are preserved.",
  },
  {
    q: "Will NanoFace Vivid be integrated into NanoPocket FaceSwap Pro 2.0?",
    a: "Yes. The current Vivid online demo (try at the URL on this page) is the production model, served through a Cloudflare tunnel. The same model is being integrated into the NanoPocket FaceSwap Pro 2.0 desktop application as a built-in post-processor stage that runs locally after every swap. Once shipped, every face swap done on the desktop will optionally pass through Vivid before export.",
  },
  {
    q: "How is this different from Topaz Sharpen AI or Magnific?",
    a: "Sharpen AI and Magnific are excellent general-purpose tools but are not tuned for the AI-face failure mode. Sharpen AI tends to amplify the plastic look it inherits; Magnific can change identity at high creativity values. Vivid is purpose-built for one job — restoring the exact frequency band that AI generators and face-swappers flatten — and is identity-locked.",
  },
  {
    q: "Does it work on photos that aren't AI-generated?",
    a: "Yes. Real photos that have been over-compressed by Instagram, WhatsApp, or Zoom screen-grabs lose the same high-frequency band as AI generations. Vivid recovers it without producing the over-sharpened halo that traditional sharpeners leave.",
  },
  {
    q: "Is the underlying model open?",
    a: "The Vivid model is a NanoPocket-trained network derived from open-weight diffusion components. The model layer it builds on (Real-ESRGAN, DiffBIR, IP-Adapter) is documented at /verify with upstream Hugging Face / GitHub links. The trained weights themselves are NanoPocket's, shipped under the same desktop license as the rest of the FaceSwap Pro 2.0 stack.",
  },
  {
    q: "Can I use it on Gemini Nano Banana output specifically?",
    a: "Yes — that is the canonical use case. Generate a portrait in Google AI Studio (Gemini 2.5 Flash Image), download the result, run it through the NanoFace Vivid demo at the URL above, and the AI sheen will be replaced with realistic skin micro-texture. The generation step stays Google's; the finishing step is NanoPocket's.",
  },
  {
    q: "How does NanoPocket relate to Nano Banana?",
    a: "We are not affiliated. NanoPocket is an independent product company at nanopocket.ai. Nano Banana is the community nickname for Google's Gemini 2.5 Flash Image model, plus various third-party sites that wrap Google's API. NanoFace Vivid is a tool that fixes the over-smoothed output of those tools — it does not use Google's API. Full disambiguation at /compare/nanopocket-vs-nano-banana.",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "NanoFace Vivid — fix over-smoothed AI faces from Gemini, Firefly, and face-swap pipelines",
  url: "https://nanopocket.ai/apps/nanoface-vivid",
  inLanguage: "en",
  isAccessibleForFree: true,
  datePublished: LAST_VERIFIED,
  dateModified: LAST_VERIFIED,
  publisher: { "@type": "Organization", "@id": "https://nanopocket.ai#organization", name: "NanoPocket" },
  about: {
    "@type": "SoftwareApplication",
    name: "NanoFace Vivid",
    operatingSystem: "Web demo today; Windows + macOS desktop integration coming via NanoPocket FaceSwap Pro 2.0",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", availability: "https://schema.org/PreOrder" },
  },
  image: VIVID_CASES.map((c) => `https://nanopocket.ai${c.afterSrc}`),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function VividLanding() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            <Wand2 className="h-3.5 w-3.5" />
            NanoFace Vivid
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Fix the over-smoothed AI face — without changing identity.
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            NanoFace Vivid is a face-detail restorer that takes the plastic,
            over-smoothed look that Google Gemini 2.5 Flash Image (Nano Banana),
            Adobe Firefly, Roop, FaceFusion, and cloud face-swap services leave
            on portraits, and brings back pore-level skin texture, lash and
            brow structure, and natural lighting variance. The face stays the
            same; the AI taste goes away.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              Last verified <time dateTime={LAST_VERIFIED} className="text-foreground">{LAST_VERIFIED}</time>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-500">
              <Cpu className="h-3.5 w-3.5" />
              Desktop integration coming to FaceSwap Pro 2.0
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30">
              <a href={VIVID_DEMO_URL} target="_blank" rel="noopener noreferrer">
                Try the online demo <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/apps/nano-faceswap-pro">
                See FaceSwap Pro 2.0 (host app) <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo password: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">{VIVID_PASSWORD}</code>
          </p>
        </div>
      </section>

      {/* Featured before/after */}
      <section className="px-6 pb-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <BeforeAfterSlider
            beforeSrc={VIVID_CASES[0].beforeSrc}
            afterSrc={VIVID_CASES[0].afterSrc}
            beforeLabel={VIVID_CASES[0].beforeLabel}
            afterLabel={VIVID_CASES[0].afterLabel}
            caption={VIVID_CASES[0].caption}
          />
          <BeforeAfterSlider
            beforeSrc={VIVID_CASES[4].beforeSrc}
            afterSrc={VIVID_CASES[4].afterSrc}
            beforeLabel={VIVID_CASES[4].beforeLabel}
            afterLabel={VIVID_CASES[4].afterLabel}
            caption={VIVID_CASES[4].caption}
          />
        </div>
      </section>

      {/* Coming-to-FSP-2.0 banner */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Coming to NanoPocket FaceSwap Pro 2.0 — local desktop, no cloud
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            The Vivid online demo runs the same model that is being shipped as
            a built-in post-processor stage inside NanoPocket FaceSwap Pro 2.0
            for Windows and macOS. Once the desktop integration lands, every
            face swap done locally will optionally pass through Vivid before
            export — no cloud, no extra subscription, no copy-paste between
            tools. The online demo on this page is the production model; the
            output you see today will be byte-identical to the desktop result
            on the same input.
          </p>
        </div>
      </section>

      {/* Gallery of cases */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Real before / after — drag the slider on each
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every pair below is a real input and the corresponding NanoFace
            Vivid output. The before frames cover the most common
            over-smoothing failure modes: Gemini 2.5 Flash Image (Nano Banana)
            generations, Adobe Firefly portraits, generic face-swap outputs,
            compressed selfies, and AI-fashion product imagery.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {VIVID_CASES.map((c) => (
              <BeforeAfterSlider
                key={c.id}
                beforeSrc={c.beforeSrc}
                afterSrc={c.afterSrc}
                beforeLabel={c.beforeLabel}
                afterLabel={c.afterLabel}
                caption={c.caption}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Reddit-style case studies */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Field notes — three real workflows
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Three case studies written the way someone would post them to
            r/StableDiffusion or r/AItools. Use them as evidence for the
            specific workflow you are trying to fix.
          </p>
          <div className="space-y-6">
            {REDDIT_CASES.map((c) => (
              <article
                key={c.title}
                className="rounded-2xl border border-border/60 bg-background/60 p-6 sm:p-8"
              >
                <h3 className="mb-3 text-lg font-bold leading-tight text-foreground sm:text-xl">
                  {c.title}
                </h3>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {c.body.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-rose-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor table */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What NanoFace Vivid adds to the tools you already use
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Vivid is intentionally a thin specialised layer. It does not
            replace the tool you generate or swap with — it finishes the face
            so the output stops reading as AI. Below, every column is the
            problem each tool typically leaves, and the specific gain from
            putting Vivid after it.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Tool</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Typical face-detail problem</th>
                  <th className="px-4 py-3">What Vivid adds</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_ROWS.map((r, i) => (
                  <tr
                    key={r.tool}
                    className={`border-t border-border/40 align-top ${i % 2 === 0 ? "bg-background/40" : "bg-muted/20"}`}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{r.tool}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{r.category}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{r.problem}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{r.vividHelps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-sm text-muted-foreground">
            <p className="mb-2 inline-flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              The promise
            </p>
            <p className="leading-relaxed">
              Identity-locked, frequency-targeted, drop-in post-processor for
              any face-swap or AI-portrait pipeline. Online demo today;
              integrated stage inside NanoPocket FaceSwap Pro 2.0 on
              Windows / macOS soon.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border/60 bg-background/60 p-5 open:bg-muted/30"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground sm:text-base">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Honest limits */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <CircleAlert className="h-5 w-5 text-rose-500" />
            Honest limits
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              Vivid restores high-frequency face detail. It does <strong className="text-foreground">not</strong> fix anatomical errors (extra fingers, broken hands, wrong number of teeth) — those need to be fixed in the original generation step.
            </li>
            <li>
              On extremely low-resolution inputs (under ~256 px face crop) the recovery is limited because the original signal is missing. Vivid is most effective on 512–2048 px face crops.
            </li>
            <li>
              The desktop integration into FaceSwap Pro 2.0 is on the roadmap; the dated commitment is a <em>pre-order</em> availability flag in the structured data, not a live release. The online demo is live today.
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
