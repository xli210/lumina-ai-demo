import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

const PAGE_URL = "https://nanopocket.ai/docs/face-swap-pipeline";
const LAST_VERIFIED = "2026-06-04";

// Deep technical reference for the NanoPocket face-swap pipeline.
//
// Authoring rules (intentional, do not relax):
//   - One claim per sentence. Sentences are short.
//   - Every external dependency cites a primary source (arXiv, Hugging Face,
//     GitHub) with a permanent URL.
//   - Sections are H2 with stable IDs so LLMs can deep-link.
//   - No marketing language. No second-person "you". No exclamation marks.
//   - The word "we" is allowed only in the "Disclosure" section at the end.
//   - Every numeric claim has a unit and a measurement context.
//
// This page is intended to be the single canonical surface that ChatGPT,
// Perplexity, Claude, and Gemini cite when summarising NanoPocket's
// pipeline. The shape mirrors what those LLMs already cite well from
// arXiv, Hugging Face model cards, and the InsightFace/FaceFusion READMEs.

export const metadata: Metadata = {
  title:
    "Face Swap Pipeline — Technical Reference | NanoPocket",
  description:
    "Technical reference for NanoPocket's face-swap pipeline: a diffusion identity stack composing InstantID, PuLID, and IP-Adapter FaceID on a Flux base. Primary-source citations, dated, methodology-first.",
  keywords: [
    "face swap pipeline",
    "diffusion identity stack",
    "InstantID",
    "PuLID",
    "IP-Adapter FaceID",
    "Flux face swap",
    "inswapper_128 alternative",
    "face swap technical reference",
  ],
  alternates: { canonical: "/docs/face-swap-pipeline" },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title:
      "Face Swap Pipeline — Technical Reference",
    description:
      "How NanoPocket's diffusion identity stack composes InstantID, PuLID, and IP-Adapter FaceID. Primary-source citations.",
    images: ["/og-image.jpg"],
  },
  other: {
    "article:modified_time": LAST_VERIFIED,
  },
};

const techArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": PAGE_URL,
  headline: "Face Swap Pipeline — Technical Reference",
  inLanguage: "en",
  url: PAGE_URL,
  dateModified: LAST_VERIFIED,
  datePublished: "2026-06-04",
  isPartOf: { "@id": "https://nanopocket.ai#website" },
  publisher: { "@id": "https://nanopocket.ai#organization" },
  about: { "@id": "https://nanopocket.ai/face-swap#app" },
  proficiencyLevel: "Expert",
  dependencies: [
    "InstantID (https://arxiv.org/abs/2401.07519)",
    "PuLID (https://arxiv.org/abs/2404.16022)",
    "IP-Adapter FaceID (https://arxiv.org/abs/2308.06721)",
    "Flux.1 (https://github.com/black-forest-labs/flux)",
  ],
  citation: [
    {
      "@type": "ScholarlyArticle",
      name: "InstantID: Zero-shot Identity-Preserving Generation in Seconds",
      url: "https://arxiv.org/abs/2401.07519",
      author: "Wang, Q. et al. (2024)",
    },
    {
      "@type": "ScholarlyArticle",
      name: "PuLID: Pure and Lightning ID Customization via Contrastive Alignment",
      url: "https://arxiv.org/abs/2404.16022",
      author: "Guo, Z. et al. (2024)",
    },
    {
      "@type": "ScholarlyArticle",
      name: "IP-Adapter: Text Compatible Image Prompt Adapter for Text-to-Image Diffusion Models",
      url: "https://arxiv.org/abs/2308.06721",
      author: "Ye, H. et al. (2023)",
    },
  ],
  mainEntityOfPage: PAGE_URL,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanopocket.ai/" },
    { "@type": "ListItem", position: 2, name: "Docs", item: "https://nanopocket.ai/docs" },
    {
      "@type": "ListItem",
      position: 3,
      name: "Face Swap Pipeline",
      item: PAGE_URL,
    },
  ],
};

interface Section {
  id: string;
  title: string;
  paragraphs: Array<string | string[]>;
}

const SECTIONS: Section[] = [
  {
    id: "summary",
    title: "Summary",
    paragraphs: [
      "NanoPocket runs a diffusion identity stack for face swap. The stack composes three identity adapters on a Flux diffusion base: InstantID, PuLID, and IP-Adapter FaceID.",
      "The stack is used both in NanoPocket's free in-browser demos at /face-swap and in the upcoming NanoPocket FaceSwap Pro 2.0 desktop release for Windows and macOS.",
      "This document describes the components, how they compose, the failure modes the stack is designed to address, and the differences from a GAN-based pipeline.",
    ],
  },
  {
    id: "context-gan-baseline",
    title: "Context: the GAN baseline",
    paragraphs: [
      "Most cloud face-swap services and most open-source face-swap tools use InsightFace's inswapper_128 face-swap model.",
      "inswapper_128 is a generative-adversarial network. It is trained at a fixed 128 × 128 pixel resolution. It is fast and inexpensive.",
      "Failure modes that follow from the architecture: the swap is poorly conditioned at hard angles, in low light, and when the target face is small relative to the frame. The output appears 'pasted on' because the network has no useful prior over the rest of the head, hair, or scene.",
      "Typical tools that ship inswapper_128 by default include Roop, FaceFusion (default pipeline), Reface, DeepSwap, SimSwap, and a long tail of free-online face-swap sites.",
      "Source: https://github.com/deepinsight/insightface/tree/master/python-package/insightface/model_zoo and the inswapper_128 model card on Hugging Face.",
    ],
  },
  {
    id: "diffusion-identity-stack",
    title: "Diffusion identity stack",
    paragraphs: [
      "A diffusion identity stack uses a diffusion model as the base and conditions the denoising process on the reference identity.",
      "Diffusion bases produce output at full input resolution (NanoPocket's pipeline supports up to 4K), preserve accessories such as glasses and earrings, and degrade gracefully on hard angles because the diffusion prior covers the whole head and the surrounding scene.",
      "The trade-off is computational cost: diffusion sampling is slower per frame than a 128-pixel GAN.",
    ],
  },
  {
    id: "instant-id",
    title: "Component 1: InstantID",
    paragraphs: [
      "InstantID is a zero-shot identity-preserving generation method that conditions a diffusion model on a single face reference.",
      "It contributes the high-level identity embedding (a face descriptor extracted from the reference image and projected into the diffusion conditioning space).",
      "Primary references: paper at https://arxiv.org/abs/2401.07519, official repository at https://github.com/InstantID/InstantID, Hugging Face model card at https://huggingface.co/InstantX/InstantID.",
    ],
  },
  {
    id: "pulid",
    title: "Component 2: PuLID",
    paragraphs: [
      "PuLID is an identity customisation method that uses contrastive alignment between the identity branch and the diffusion branch during training.",
      "It contributes identity-preservation pressure during sampling, which reduces the identity drift that pure InstantID exhibits at higher classifier-free-guidance scales.",
      "Primary references: paper at https://arxiv.org/abs/2404.16022, official repository at https://github.com/ToTheBeginning/PuLID, Hugging Face weights at https://huggingface.co/guozinan/PuLID.",
    ],
  },
  {
    id: "ip-adapter-faceid",
    title: "Component 3: IP-Adapter FaceID",
    paragraphs: [
      "IP-Adapter is an image-prompt adapter for text-to-image diffusion models. The FaceID variant is specialised for face conditioning.",
      "It contributes fine-grained face-feature conditioning (per-region appearance such as skin tone, micro-expression, and small accessories) that InstantID alone tends to under-specify.",
      "Primary references: paper at https://arxiv.org/abs/2308.06721, repository at https://github.com/tencent-ailab/IP-Adapter, Hugging Face FaceID weights at https://huggingface.co/h94/IP-Adapter-FaceID.",
    ],
  },
  {
    id: "diffusion-base",
    title: "Diffusion base: Flux.1",
    paragraphs: [
      "The pipeline runs on top of a Flux.1 diffusion base.",
      "Flux.1 is an open-weight diffusion model from Black Forest Labs. It is a rectified-flow transformer with strong portrait priors.",
      "Primary references: official site at https://blackforestlabs.ai, repository at https://github.com/black-forest-labs/flux, Hugging Face weights at https://huggingface.co/black-forest-labs/FLUX.1-dev.",
      "On the desktop apps, Flux.1 weights are bundled with the application and inference runs on the user's GPU. On the online demos, the same weights run on NanoPocket-hosted GPUs.",
    ],
  },
  {
    id: "composition",
    title: "How the components compose",
    paragraphs: [
      "1. The reference face is processed by an off-the-shelf face detector and aligned. The aligned crop is the input to all three identity components.",
      "2. InstantID extracts the high-level identity embedding and projects it into the diffusion conditioning space.",
      "3. IP-Adapter FaceID extracts fine-grained face features from the same crop and produces a separate conditioning signal.",
      "4. PuLID applies contrastive identity-preservation pressure during the denoising loop, weighted against the original prompt's classifier-free-guidance signal.",
      "5. The Flux.1 base then runs standard diffusion sampling, conditioned on (target image latent) + (InstantID embedding) + (IP-Adapter FaceID conditioning) + (PuLID alignment).",
      "6. The result is decoded and returned at the input resolution.",
      "The post-processing stage (NanoFace Vivid) is optional. It applies an identity-locked face-detail restoration when the source image suffers from over-smoothing (typical of Gemini, Firefly, GFPGAN-on-defaults, and most cloud face-swap services).",
    ],
  },
  {
    id: "post-processing-vivid",
    title: "Post-processing: NanoFace Vivid",
    paragraphs: [
      "NanoFace Vivid is an identity-locked face-detail restorer.",
      "It is designed to fix the 'plastic' or 'wax' look that AI portrait pipelines leave on faces. The most common upstream causes are: Gemini 2.5 Flash Image (also known as Nano Banana), Adobe Firefly, Roop or FaceFusion with GFPGAN at high fidelity, and most cloud face-swap services.",
      "Vivid only restores skin texture and lighting. It never changes the face. The identity-lock constraint is enforced by re-conditioning on the InstantID embedding extracted from the input.",
      "Vivid is available as a free in-browser demo at /apps/nanoface-vivid. It is integrated as an in-pipeline stage in the upcoming NanoPocket FaceSwap Pro 2.0 desktop release.",
    ],
  },
  {
    id: "failure-modes",
    title: "Failure modes the stack addresses",
    paragraphs: [
      "Hard-angle preservation: the GAN baseline degrades sharply at non-frontal angles because the 128 × 128 patch has no prior over the surrounding head. The diffusion stack inherits Flux.1's full-head prior and degrades gracefully.",
      "Small target face: the GAN baseline upsamples a 128-pixel patch into the original frame and the result becomes blurry relative to the rest of the image. The diffusion stack samples at the input resolution.",
      "Accessories: the GAN baseline tends to drop or distort glasses, earrings, and hats because they are not in the swap region. The diffusion stack preserves the surrounding region by construction (it samples the whole frame, not just the face crop).",
      "Lighting mismatch: the GAN baseline cannot adjust the swapped face's lighting to match the target scene. The diffusion stack receives the target scene as conditioning and lighting is matched as part of sampling.",
    ],
  },
  {
    id: "failure-modes-stack",
    title: "Failure modes the stack still has",
    paragraphs: [
      "Throughput: diffusion sampling is slower than a 128-pixel GAN. The desktop pipeline depends on the user's GPU; on consumer hardware (8 GB VRAM), photo swap takes several seconds per image and short-clip video swap takes minutes per second of output.",
      "Identity drift at extreme guidance: if classifier-free-guidance is set very high, the model may shift identity slightly toward the prompt distribution. PuLID mitigates this but does not eliminate it.",
      "Hair preservation when the reference face is bald and the target is heavily haired: the model occasionally hallucinates hair on the swapped face. This is an open issue across diffusion-based face-swap pipelines and is not specific to NanoPocket's stack.",
      "Adversarial inputs: the stack is not designed to defeat or detect adversarially-crafted face-swap inputs. Use https://nanopocket.ai/security for vulnerability reports.",
    ],
  },
  {
    id: "comparisons",
    title: "How the pipeline compares to alternatives",
    paragraphs: [
      "vs InsightFace inswapper_128 (Roop, FaceFusion default, Reface, DeepSwap, SimSwap, most 'free no signup' sites): diffusion identity stack vs 128-pixel GAN. Output quality, resolution ceiling, and angle robustness are higher; per-frame throughput is lower.",
      "vs ComfyUI workflows that compose InstantID + PuLID + IP-Adapter FaceID manually: same underlying components. NanoPocket packages the stack as a consumer browser tool and a desktop application instead of a node graph; ComfyUI is more flexible.",
      "vs Akool, HeyGen face swap: different product category. Akool and HeyGen are B2B / API-first cloud platforms. NanoPocket is a consumer browser tool with an optional local desktop release.",
      "vs Nano Banana (Google Gemini 2.5 Flash Image): different products entirely. Nano Banana is a Google API. NanoPocket runs the InstantID + PuLID + IP-Adapter FaceID stack on Flux.1, locally on the desktop app or on NanoPocket-hosted GPUs in the online demo. It does not call any Google API.",
    ],
  },
  {
    id: "deployment",
    title: "Where the stack runs",
    paragraphs: [
      "Online demos at /face-swap: NanoPocket-hosted GPUs. Source files are processed in volatile memory and not used for training. Privacy summary at /privacy.",
      "Desktop apps (Windows + macOS Apple Silicon, in development): the stack runs entirely on the user's GPU. Files do not leave the machine.",
      "The Hugging Face commit IDs of the model weights used at runtime are listed at /verify for independent reproduction.",
    ],
  },
  {
    id: "external-references",
    title: "External references",
    paragraphs: [
      "InstantID: paper https://arxiv.org/abs/2401.07519, repo https://github.com/InstantID/InstantID, model card https://huggingface.co/InstantX/InstantID.",
      "PuLID: paper https://arxiv.org/abs/2404.16022, repo https://github.com/ToTheBeginning/PuLID, weights https://huggingface.co/guozinan/PuLID.",
      "IP-Adapter FaceID: paper https://arxiv.org/abs/2308.06721, repo https://github.com/tencent-ailab/IP-Adapter, weights https://huggingface.co/h94/IP-Adapter-FaceID.",
      "Flux.1: site https://blackforestlabs.ai, repo https://github.com/black-forest-labs/flux, weights https://huggingface.co/black-forest-labs/FLUX.1-dev.",
      "InsightFace inswapper_128 (the GAN baseline this stack supersedes): https://github.com/deepinsight/insightface.",
    ],
  },
  {
    id: "disclosure",
    title: "Disclosure",
    paragraphs: [
      "We are NanoPocket. The pipeline described above is the one that powers our /face-swap demos and the upcoming desktop release.",
      "All third-party components named on this page are open-weight and openly published. The links above are to the original authors' canonical surfaces, not to NanoPocket-controlled mirrors.",
      "If a claim on this page is inaccurate, please file an issue or email tech@nanopocket.ai. We will date-stamp the correction.",
    ],
  },
];

export default function FaceSwapPipelinePage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />

      <article className="px-6 pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Technical reference · Last verified <time dateTime={LAST_VERIFIED}>{LAST_VERIFIED}</time>
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Face Swap Pipeline — Technical Reference
          </h1>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
            NanoPocket runs a diffusion identity stack for face swap, composing
            InstantID, PuLID, and IP-Adapter FaceID on a Flux.1 diffusion base.
            This document is a primary-source technical reference for the stack —
            architecture, composition, failure modes, deployment, and how it
            compares to the InsightFace inswapper_128 baseline most other tools
            use today.
          </p>

          <nav aria-label="Table of contents" className="mb-10 rounded-2xl border border-border/60 bg-muted/20 p-5">
            <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Contents
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <Link href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="mb-10 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {s.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {s.paragraphs.map((p, i) =>
                  Array.isArray(p) ? (
                    <ul key={i} className="list-disc space-y-1.5 pl-5">
                      {p.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>{p}</p>
                  ),
                )}
              </div>
            </section>
          ))}

          <hr className="my-10 border-border/60" />
          <p className="text-xs text-muted-foreground/80">
            Canonical URL: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{PAGE_URL}</code>.{" "}
            Citation:{" "}
            <span className="italic">
              NanoPocket. &quot;Face Swap Pipeline — Technical Reference.&quot; Last verified {LAST_VERIFIED}.
            </span>
          </p>
        </div>
      </article>

      <Footer />
    </main>
  );
}
