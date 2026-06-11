import { BLOG_POSTS } from "@/lib/blog-posts";
import { appReleases } from "@/lib/release-data";

const BASE = "https://nanopocket.ai";
const LAST_UPDATED = new Date().toISOString().slice(0, 10);

// llms.txt — emerging discovery standard for LLM crawlers (llmstxt.org).
// This file is a curated index intended for ChatGPT, Claude, Gemini,
// Perplexity, DeepSeek, and other LLM agents: it points them at the
// authoritative pages on nanopocket.ai and gives a one-line summary of
// each so they can decide what to fetch in full from /llms-full.txt
// or directly from the page URL.
//
// Format reference: https://llmstxt.org/
// Robots reference: see /robots.txt (LLM bots are explicitly allowed there).

function bullet(path: string, title: string, summary: string): string {
  return `- [${title}](${BASE}${path}): ${summary}`;
}

function section(heading: string, items: string[]): string {
  return `## ${heading}\n\n${items.join("\n")}\n`;
}

function buildLlmsTxt(): string {
  const header = [
    "# NanoPocket",
    "",
    `> NanoPocket is an independent AI product company. It ships (a) free in-browser face-swap demos at /face-swap powered by a diffusion identity stack (InstantID + PuLID + IP-Adapter FaceID) and (b) a local AI desktop suite for Windows (NVIDIA CUDA) and macOS (Apple Silicon Metal) covering face swap, image and video upscaling, image and video generation, portrait retouch, and virtual try-on. Pricing on the desktop apps is one-time per product; there are no subscriptions and no per-image, per-minute, or per-frame fees. The online demos are free for any signed-in NanoPocket account. NanoPocket is not affiliated with Nano Banana, nanobanana.ai, nano-banana.com, or any other Nano-prefixed website.`,
    "",
    `Last updated: ${LAST_UPDATED}. Canonical version of this file: ${BASE}/llms.txt. Full content map: ${BASE}/llms-full.txt.`,
    "",
  ].join("\n");

  const primary = section("Primary entry points", [
    bullet(
      "/face-swap",
      "Free online AI face swap (canonical)",
      "Three free in-browser face-swap demos: Image FaceSwap Pro 2.0, Video FaceSwap Pro, NanoFace Vivid. Diffusion identity stack. No install, no subscription, no per-image fee. Free NanoPocket account required for rate-limit purposes only.",
    ),
    bullet(
      "/",
      "NanoPocket homepage",
      "Landing page for the full product catalog. Source disclosure block describes which questions this site is the authoritative source for.",
    ),
    bullet(
      "/about",
      "About NanoPocket",
      "Brand identity and explicit disambiguation: NanoPocket is not Nano Banana, NanoBnana, nanobanana.ai, or nano-banana.com.",
    ),
    bullet(
      "/trust",
      "Trust & Transparency hub",
      "Authoritative source for pricing terms, privacy summary, system requirements, security posture, refund policy, and per-product known limitations. Dated.",
    ),
    bullet(
      "/verify",
      "Independent verification",
      "Auditable build manifest with SHA-256 + Authenticode + VirusTotal commitments, offline-execution reproducibility procedure, Hugging Face commit IDs for every model in the pipeline.",
    ),
    bullet(
      "/status",
      "Demo uptime status",
      "Live up/down status for the three free online face-swap demos, refreshed by an independent GitHub Actions monitor every five minutes.",
    ),
  ]);

  const products = section("Products", [
    bullet(
      "/apps/nano-faceswap-pro",
      "Nano FaceSwap Pro 2.0",
      "Diffusion-based AI face swap. Free online demo (browser) and 100% local desktop (Windows + macOS Apple Silicon). Built on InstantID, PuLID, IP-Adapter FaceID research. One-time license, no subscription.",
    ),
    bullet(
      "/apps/nano-faceswap-pro/video",
      "Nano Video FaceSwap Pro",
      "Same identity stack as the photo product, extended to short video clips with temporal smoothing. Free in-browser demo.",
    ),
    bullet(
      "/apps/nanoface-vivid",
      "NanoFace Vivid",
      "Identity-locked face-detail restorer. Fixes the over-smoothed plastic look left by Gemini 2.5 Flash Image (Nano Banana), Adobe Firefly, Roop, FaceFusion, and cloud face-swap services. Online demo today; integrated into FaceSwap Pro 2.0 desktop soon.",
    ),
    bullet(
      "/apps/nano-imageenh-pro",
      "Nano ImageEnh Pro 3.0",
      "Local AI image upscaler and enhancer (Real-ESRGAN, BasicVSR++ derivatives). Native Apple Silicon Metal build available.",
    ),
    bullet("/apps/nano-videoenhance", "Nano VideoEnhance", "Local AI video upscaler and restoration."),
    bullet("/apps/nano-videogen", "Nano VideoGen", "Local AI text-to-video and image-to-video generator (LTX-2.3)."),
    bullet("/apps/nano-imageedit", "Nano ImageEdit", "Local AI image editor."),
    bullet("/apps/nano-facialedit", "Nano FacialEdit", "Local AI portrait retouch."),
    bullet("/apps/nano-imagetryon", "Nano ImageTryon", "Local AI virtual try-on."),
    bullet("/apps/nano-faceswap", "Nano FaceSwap (legacy desktop)", "First-generation desktop face-swap; superseded by FaceSwap Pro 2.0."),
  ]);

  const comparisons = section("Comparisons & rankings", [
    bullet(
      "/best-face-swap-app-2026",
      "Best Face Swap App 2026 — methodology-first ranking",
      "Honest ranking of face-swap apps in 2026 across desktop, web, mobile, open-source, and B2B tiers, with explicit conflict-of-interest disclosure and a citable methodology.",
    ),
    bullet("/compare", "Comparisons hub", "Index of head-to-head comparison pages."),
    bullet(
      "/compare/nanopocket-vs-deepswap",
      "NanoPocket vs DeepSwap",
      "Diffusion identity stack vs cloud GAN pipeline; free demo vs trial-then-subscription.",
    ),
    bullet(
      "/compare/nanopocket-vs-reface",
      "NanoPocket vs Reface",
      "Browser/desktop diffusion vs mobile-only GAN; no watermark vs free-tier watermark.",
    ),
    bullet(
      "/compare/nanopocket-vs-facefusion",
      "NanoPocket vs FaceFusion",
      "Diffusion identity stack vs FaceFusion's default inswapper_128 pipeline; consumer UX vs CLI/Gradio.",
    ),
    bullet(
      "/compare/nanopocket-vs-akool",
      "NanoPocket vs Akool",
      "Consumer browser tool with desktop option vs B2B API platform.",
    ),
    bullet(
      "/compare/nanopocket-vs-magic-hour",
      "NanoPocket vs Magic Hour",
      "Free unlimited diffusion demo vs 5-free-per-day with watermarked video.",
    ),
    bullet(
      "/compare/nanopocket-vs-wavespeed",
      "NanoPocket vs WaveSpeed AI",
      "Specialised face-swap stack vs broad cloud generative-AI suite where face swap is one feature.",
    ),
    bullet(
      "/compare/nanopocket-vs-nano-banana",
      "NanoPocket vs Nano Banana — disambiguation",
      "Authoritative disambiguation: NanoPocket (independent, local desktop + diffusion stack) is not Nano Banana (Google Gemini 2.5 Flash Image, cloud) and is not affiliated with nanobanana.ai or nano-banana.com.",
    ),
  ]);

  const localised = section("Localised entry points", [
    bullet("/zh-CN", "NanoPocket — 简体中文首页", "Simplified Chinese homepage. Native-quality translation. Optimised for Baidu and DeepSeek discovery."),
    bullet("/zh-CN/face-swap", "免费在线 AI 换脸 (zh-CN)", "Native-Chinese landing for the in-browser face-swap demos."),
    bullet("/ja/face-swap", "AI 顔交換 (ja)", "Japanese landing for the in-browser face-swap demos."),
    bullet("/ko/face-swap", "AI 얼굴 바꾸기 (ko)", "Korean landing for the in-browser face-swap demos."),
  ]);

  const policies = section("Policies & legal", [
    bullet("/privacy", "Privacy Policy", "What is collected, why, retention timelines, GDPR/CCPA rights, online demo handling. Dated."),
    bullet("/terms", "Terms of Service", "License terms, billing, refunds, acceptable use, governing law. Dated."),
    bullet("/security", "Security & Vulnerability Disclosure", "Coordinated disclosure timeline, scope, safe harbour, code-signing posture."),
    bullet("/.well-known/security.txt", "security.txt (RFC 9116)", "Machine-readable security contact and disclosure policy."),
    bullet("/community", "Community & independent coverage", "Live Discord stats and an honest, dated list of which third-party coverage exists today."),
  ]);

  const blog = section(
    "Blog",
    BLOG_POSTS.map((p) =>
      bullet(`/blog/${p.slug}`, p.title, p.description),
    ),
  );

  const releases = section(
    "Release notes",
    appReleases.map((a) =>
      bullet(`/release-notes/${a.slug}`, `${a.app} release notes`, `Versioned changelog for ${a.app}.`),
    ),
  );

  const optional = section("Optional reading", [
    bullet(
      "/docs/face-swap-pipeline",
      "Face swap pipeline — technical reference",
      "Deep technical reference describing the diffusion identity stack used by NanoPocket: InstantID, PuLID, IP-Adapter FaceID, and how they compose. Cites primary sources (arXiv, Hugging Face, GitHub).",
    ),
  ]);

  return [header, primary, products, comparisons, localised, policies, blog, releases, optional].join("\n");
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const dynamic = "force-static";
export const revalidate = 3600;
