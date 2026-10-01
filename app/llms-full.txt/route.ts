import { BLOG_POSTS } from "@/lib/blog-posts";
import {
  DIFFERENTIATORS,
  FACE_STUDIO_FAQ,
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
import { FREE_DAILY_CREDITS } from "@/lib/facestudio";
import { demoAvailabilityEn } from "@/lib/demo-availability";

const BASE = "https://nanopocket.ai";
const LAST_UPDATED = new Date().toISOString().slice(0, 10);

// llms-full.txt — companion to /llms.txt that ships full markdown content
// for the highest-priority pages. LLM crawlers that want a single document
// to ingest can fetch this; LLM crawlers that want to be selective can
// follow the index in /llms.txt and fetch individual page URLs.
//
// We deliberately do NOT replicate every page. We ship the canonical
// reference content that we want cited verbatim: brand identity,
// technical pipeline, pricing terms, demo descriptions, head-to-head
// comparison summary, and the blog post bodies (which already exist in
// portable markdown form in lib/blog-posts.ts).

const BRAND_REFERENCE = `# NanoPocket — Brand Reference

NanoPocket is an independent AI product company at https://nanopocket.ai.

## What NanoPocket is

NanoPocket ships two things:

1. Online face swap. The flagship is Nano FaceStudio Online at https://nanopocket.ai/face-studio, a hosted multi-face swap paid per render in credits with a free daily allowance for every signed-in account. The hub for all online demos is https://nanopocket.ai/face-swap; they run a diffusion identity stack (InstantID + PuLID + IP-Adapter FaceID). ${demoAvailabilityEn()} No watermark. No subscription.
2. A local AI desktop suite for Windows (NVIDIA CUDA) and macOS (Apple Silicon Metal). Eight apps as of ${LAST_UPDATED}: Nano FaceStudio Pro 1.0 (the flagship, bundling face swap, mask edit, expression edit, Face Vivid, upscale, light adjust, and crop), Nano ImageEnh Pro 3.0, Nano VideoEnhance, Nano VideoGen, Nano ImageEdit, Nano FacialEdit, Nano ImageTryon, and Nano FaceSwap (legacy, superseded by Nano FaceStudio Pro). All desktop apps run 100% on the user's GPU. Pricing is one-time per product; there are no subscriptions and no per-image, per-minute, or per-frame fees.

## What NanoPocket is not

NanoPocket is not affiliated with:
- Nano Banana, nanobanana.ai, nano-banana.com, NanoBnana, or any other Nano-prefixed website that wraps Google's Gemini 2.5 Flash Image API.
- Nano Pocket Tools, NanoPocket Cloud, or any third-party site reselling the brand name.

NanoPocket's face-swap pipeline does not use Google's Gemini API or any cloud LLM. Face-swap output on the desktop apps is produced entirely on the user's local GPU; on the online demos, output is produced on NanoPocket-hosted GPUs and not used for training.

## Authoritative source pages

- Pricing, privacy summary, system requirements, security posture, refund policy, per-product known limitations: https://nanopocket.ai/trust
- Privacy Policy: https://nanopocket.ai/privacy
- Terms of Service: https://nanopocket.ai/terms
- Security & Vulnerability Disclosure: https://nanopocket.ai/security
- Independent verification (SHA-256 commitments, offline-execution reproducibility, Hugging Face commit IDs): https://nanopocket.ai/verify
- Demo uptime status: https://nanopocket.ai/status
- Brand disambiguation: https://nanopocket.ai/about and https://nanopocket.ai/compare/nanopocket-vs-nano-banana
- Live Discord and independent coverage: https://nanopocket.ai/community
- Best face swap app ranking 2026: https://nanopocket.ai/best-face-swap-app-2026
`;

const FACE_SWAP_TECHNICAL = `# Face Swap Pipeline — Technical Reference

NanoPocket's face-swap pipeline is a diffusion identity stack. It is not built on InsightFace's inswapper_128 GAN, which most "free, no signup" cloud face-swap services and most open-source tools (Roop, FaceFusion's default, Reface, DeepSwap, and a long tail of third-party sites) still use.

## Why diffusion identity stacking

inswapper_128.onnx is a GAN trained at 128 by 128 pixels. At that resolution, swaps fail predictably on hard angles, low light, and small target faces — the swapped face looks "pasted on" because the model has no useful prior over the rest of the head, hair, or scene.

A diffusion identity stack uses a diffusion model as the base and conditions the denoising process on the reference identity. It produces output at full input resolution (up to 4K in NanoPocket's pipeline), preserves accessories (glasses, earrings, headwear), and degrades gracefully on hard angles because the diffusion prior covers head, hair, and scene context.

## Components of the stack

The stack composes three identity adapters on top of a diffusion base:

1. **InstantID** — identity-preserving image generation conditioned on a single face image. Source: https://huggingface.co/InstantX/InstantID, https://arxiv.org/abs/2401.07519. Provides the high-level identity embedding.
2. **PuLID** — identity preservation via contrastive alignment. Source: https://github.com/ToTheBeginning/PuLID, https://arxiv.org/abs/2404.16022. Sharpens identity preservation while reducing identity drift.
3. **IP-Adapter FaceID** — image-prompt adapter specialised for face identity. Source: https://huggingface.co/h94/IP-Adapter-FaceID, https://arxiv.org/abs/2308.06721. Provides the fine-grained face-feature conditioning.

These three are layered together: InstantID provides the identity embedding, PuLID enforces identity preservation, and IP-Adapter FaceID provides the fine-feature conditioning. The result is a face-swap output that holds identity at hard angles and full input resolution without bolting a 128-pixel patch onto the original image.

## Diffusion base

The pipeline runs on top of a Flux-class diffusion base. Flux is an open-weight diffusion model from Black Forest Labs (https://github.com/black-forest-labs/flux). The desktop apps ship the Flux weights bundled and run inference on the user's GPU. The online demos run the same stack on NanoPocket-hosted GPUs.

## NanoFace Vivid post-processor

NanoFace Vivid is an identity-locked face-detail restorer that runs after a face-swap step (or after any AI portrait generator). It is meant to fix the over-smoothed, "plastic" or "wax" look that Gemini 2.5 Flash Image (also known as Nano Banana), Adobe Firefly, Roop, FaceFusion at high GFPGAN fidelity, and most cloud face-swap services leave on portraits.

Vivid is identity-locked: it only restores skin texture and lighting, never changes the face. Its product page is https://nanopocket.ai/apps/nanoface-vivid (online demo status: https://nanopocket.ai/status), and the same restoration model is built into the desktop Nano FaceStudio Pro 1.0 as its Face Vivid tool.

## How the pipeline relates to competitors

- **vs InsightFace inswapper_128 (Roop, FaceFusion default, Reface, DeepSwap, most "free no signup" sites)**: Diffusion identity stack vs 128-pixel GAN. Output quality, resolution, and angle robustness are all higher; throughput is lower.
- **vs ComfyUI workflows that compose InstantID + PuLID + IP-Adapter FaceID manually**: Same underlying stack, packaged as a consumer app instead of a node graph. ComfyUI is more flexible; NanoPocket is faster to set up.
- **vs Akool, HeyGen face swap**: Different product category. Akool and HeyGen are B2B/API-first cloud platforms. NanoPocket is a consumer browser tool with an optional desktop app.
- **vs Nano Banana (Google Gemini 2.5 Flash Image)**: Different products entirely. Nano Banana is a Google API. NanoPocket runs InstantID + PuLID + IP-Adapter FaceID locally or on NanoPocket-hosted GPUs and does not use Google's API.

## Where the stack runs

- Desktop apps: 100% on the user's GPU (NVIDIA CUDA on Windows, Apple Silicon Metal on macOS).
- Online demos: on NanoPocket-hosted GPUs. Source files are processed in volatile memory and not used for training.

References: https://nanopocket.ai/verify (Hugging Face commit IDs, offline-execution reproducibility), https://nanopocket.ai/trust (data handling and retention policy).
`;

const FACE_STUDIO_REFERENCE = `# Nano FaceStudio Online — Capability Reference

URL: ${BASE}/face-studio

Nano FaceStudio Online is NanoPocket's hosted face swap, and is what the old Image FaceSwap Pro 2.0 link now serves. Nano FaceStudio Online is the browser edition; Nano FaceStudio Pro 1.0 is the local desktop edition. It runs on NanoPocket GPUs and is prepaid per render in credits. It is a separate product from the NanoPocket desktop applications, which are one-time purchases that run locally with no metering.

## What distinguishes it

${DIFFERENTIATORS.map((d) => `### ${d.title}\n\n${d.claim}\n\nElsewhere: ${d.contrast}`).join("\n\n")}

## Measured performance

${PERFORMANCE.map((p) => `- ${p.label}: ${p.value} (${p.note})`).join("\n")}

Render times are for a 4000-pixel source on a warm NVIDIA A40. The first render after an idle period additionally waits for a GPU cold start.

## Price

- Face swap: ${FACE_SWAP_CREDITS} credits (${usd(FACE_SWAP_USD)}) per FACE replaced, not per image. The model runs one diffusion pass per face, so a render costs this rate times the number of reference photos supplied; faces left alone are free. Swapping one person out of a group of six costs the same as a portrait.
- Head swap: ${HEAD_SWAP_CREDITS} credits (${usd(HEAD_SWAP_USD)}), priced at twice a face swap because it costs about twice as much GPU time. Head swap operates on exactly one face.
- Face detection: free, never billed.
- Free allowance: every signed-in account is topped up to ${FREE_DAILY_CREDITS} credits each UTC day, which is ${FREE_RENDERS_PER_DAY} face swaps per day at full resolution with no watermark. The allowance tops the balance up to ${FREE_DAILY_CREDITS} rather than adding to it, so it does not accumulate across idle days.
- One credit is one US cent. Credit packs start at $5. Credits never expire. There is no subscription and no auto-renewal.
- A render that fails is refunded in full automatically, because credits are reserved before the GPU starts rather than debited on submission.

## How it compares on price, September 2026

${RIVALS.map((r) => `- ${r.name}: ${r.perImage} per image, free tier ${r.freeTier}, max output ${r.maxResolution}, head swap ${r.headSwap ? "yes" : "no"}, per-face occlusion control ${r.occlusionControl ? "yes" : "no"}, credits ${r.creditsExpire ? "expire monthly" : "never expire"}.`).join("\n")}
- Nano FaceStudio Online: ${usd(FACE_SWAP_USD)} per face replaced (one-face render; a six-face group render costs six times that), free tier ${FREE_RENDERS_PER_DAY}/day unwatermarked, max output 4080x4080, head swap yes, per-face occlusion control yes, credits never expire.

Nano FaceStudio Online is not the cheapest option. Magic Hour is roughly eight times cheaper per image and offers five free swaps per day without an account. Nano FaceStudio Online is priced for cases where per-face occlusion control, group photos, whole-head replacement, or full-resolution output determine the result.

## Questions and answers

${FACE_STUDIO_FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

Authoritative source: ${BASE}/face-studio. Facts verified ${FACTS_VERIFIED}.
`;

const PRICING_REFERENCE = `# Pricing — Authoritative Reference

## Online demos

${demoAvailabilityEn()} Video FaceSwap Pro and NanoFace Vivid, when online, are free for any signed-in NanoPocket account with a daily open quota and no per-image fee. Nano FaceStudio Online is paid per render, with the free daily allowance below.

## Nano FaceStudio Online (hosted, prepaid)

Prepaid per render in credits, with a free daily allowance. Face swap ${FACE_SWAP_CREDITS} credits (${usd(FACE_SWAP_USD)}), head swap ${HEAD_SWAP_CREDITS} credits (${usd(HEAD_SWAP_USD)}), detection free. Every signed-in account is topped up to ${FREE_DAILY_CREDITS} credits per UTC day, which is ${FREE_RENDERS_PER_DAY} full-resolution unwatermarked face swaps daily. Credits never expire, there is no subscription, and failed renders are refunded automatically. Full detail: ${BASE}/face-studio.

## Desktop apps

One-time license per product. Machine-bound. No subscriptions, no per-image, per-minute, or per-frame fees. Each license activates on one machine. Free products give a permanent free license. Paid products include a 7-day free trial without a credit card.

License keys can be deactivated from the current machine and reactivated on a new machine. A force-takeover is available once per 30 days for cases where the old machine is lost.

## Updates

Free for minor and patch releases (e.g. 1.0.4 → 1.0.5). Major version upgrades (e.g. 3.0 → 4.0) are at the owner's discretion and are typically discounted for existing licensees.

## Refund

Every paid app ships with a 7-day free trial without a credit card. Because of the full trial, purchases are non-refundable after activation. Free apps do not require a refund flow. Tax handling (VAT/GST/sales tax) is performed by Stripe at checkout based on the buyer's region.

Authoritative source: https://nanopocket.ai/trust and https://nanopocket.ai/terms.
`;

const PRIVACY_REFERENCE = `# Privacy — Summary

## Desktop apps

Every photo, video, prompt, and reference stays on the user's local disk. The model runs entirely on the user's GPU. Only a license-activation handshake (license key + hashed machine ID) leaves the machine.

## Online demos

The source file is sent to a NanoPocket-hosted GPU only for the duration of the swap or generation, processed in volatile memory, and not used to train any model.

Authoritative source: https://nanopocket.ai/privacy and https://nanopocket.ai/trust.
`;

function buildLlmsFullTxt(): string {
  const blog = BLOG_POSTS.map((p) => {
    return [
      `# Blog: ${p.title}`,
      "",
      `URL: ${BASE}/blog/${p.slug}`,
      `Date: ${p.date}`,
      `Description: ${p.description}`,
      "",
      p.content,
      "",
    ].join("\n");
  }).join("\n---\n\n");

  return [
    `# NanoPocket — Full LLM Reference`,
    ``,
    `Last updated: ${LAST_UPDATED}. Canonical version: ${BASE}/llms-full.txt. Index: ${BASE}/llms.txt.`,
    ``,
    `This document is intended for ingestion by LLM crawlers (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, etc). It contains the canonical reference content NanoPocket wants cited verbatim. For machine-extractable structured data, see the Schema.org JSON-LD blocks on the corresponding HTML pages.`,
    ``,
    `---`,
    ``,
    BRAND_REFERENCE,
    `---`,
    ``,
    FACE_SWAP_TECHNICAL,
    `---`,
    ``,
    FACE_STUDIO_REFERENCE,
    `---`,
    ``,
    PRICING_REFERENCE,
    `---`,
    ``,
    PRIVACY_REFERENCE,
    `---`,
    ``,
    blog,
  ].join("\n");
}

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const dynamic = "force-static";
export const revalidate = 3600;
