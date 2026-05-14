import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Users,
  Maximize2,
  ToggleRight,
  Wand2,
  Library,
  Trophy,
  Smile,
  CheckCircle2,
  Download,
  Lock,
  Cpu,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "Inside Nano FaceSwap Pro — Multi-Face Swap, 4K Detail, Mask Control & Expression Edit",
  description:
    "A complete tour of Nano FaceSwap Pro: multi-face precision, full-resolution output (4K stays 4K), face-vs-head swap modes, pixel-level mask control, a built-in license-free virtual face library, head-to-head benchmarks against leading apps, and Pro-exclusive facial expression editing.",
  keywords: [
    "Nano FaceSwap Pro features",
    "multi-face swap",
    "4K face swap",
    "high resolution face swap",
    "face swap mask control",
    "head swap vs face swap",
    "magic pen face swap",
    "occlusion face swap",
    "virtual face library",
    "AI generated reference faces",
    "facial expression editing",
    "face swap benchmark",
    "best face swap app",
    "professional face swap",
    "diffusion face swap features",
  ],
  alternates: { canonical: "/apps/nano-faceswap-pro/features" },
  openGraph: {
    title: "Inside Nano FaceSwap Pro — Feature Tour",
    description:
      "Multi-face precision, full-resolution output, mask-level control, virtual face library, and Pro-exclusive expression editing — the complete product tour.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inside Nano FaceSwap Pro — Feature Tour",
    description:
      "Multi-face. 4K-preserving. Mask control. Virtual face library. Expression editing. The complete product tour.",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Inside Nano FaceSwap Pro — A Complete Product Tour",
  description:
    "A walkthrough of the seven core capabilities that make Nano FaceSwap Pro the most professional local face-swap app on the market: multi-face precision, full-resolution output, face-vs-head modes, mask-level control, a license-free virtual face library, head-to-head benchmarks, and Pro-exclusive expression editing.",
  author: { "@type": "Organization", name: "NanoPocket" },
  publisher: {
    "@type": "Organization",
    name: "NanoPocket",
    logo: {
      "@type": "ImageObject",
      url: "https://nanopocket.ai/og-image.jpg",
    },
  },
  mainEntityOfPage: "https://nanopocket.ai/apps/nano-faceswap-pro/features",
};

interface FeatureRow {
  index: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  bullets: string[];
  icon: typeof Users;
  accent: "indigo" | "purple" | "fuchsia" | "amber" | "emerald" | "rose" | "blue";
  proOnly?: boolean;
  visual: "multi-face" | "resolution" | "face-head" | "mask" | "library" | "benchmark" | "expression";
}

const FEATURES: FeatureRow[] = [
  {
    index: 1,
    eyebrow: "Multi-face precision",
    title: "Swap one. Swap all. Pixel-perfect on every face.",
    subtitle: "Detection-aware multi-subject pipeline.",
    paragraphs: [
      "Nano FaceSwap Pro detects every face in the frame and treats each one as an independent identity-transfer target. There is no loss of fidelity when multiple subjects share a single image — each face receives the same diffusion-quality treatment as a single-subject swap.",
      "Choose the faces you want to replace, leave the rest untouched, or run a single-click batch swap across the entire group.",
    ],
    bullets: [
      "Per-face targeting with a numbered face picker",
      "One-click swap-all for group portraits",
      "No quality drop-off as the number of faces increases",
    ],
    icon: Users,
    accent: "indigo",
    visual: "multi-face",
  },
  {
    index: 2,
    eyebrow: "Original resolution preserved",
    title: "Your 4K photo stays 4K.",
    subtitle: "Detail-preserving output, even on close-up portraits.",
    paragraphs: [
      "Most face-swap tools silently downsample your input, soften the result, and break apart on close-up shots with large faces. Nano FaceSwap Pro is engineered around a high-resolution diffusion pipeline paired with a state-of-the-art detail-preserving upscaler.",
      "Your output returns at the exact same resolution as your input — sharp skin texture, intact pore detail, and clean edges around hair and accessories.",
    ],
    bullets: [
      "1:1 resolution preservation (input pixels = output pixels)",
      "Optimized for large-face crops and high-density images",
      "No softening, banding, or upscaling artifacts",
    ],
    icon: Maximize2,
    accent: "blue",
    visual: "resolution",
  },
  {
    index: 3,
    eyebrow: "Face-only or full-head swap",
    title: "Two modes. One app. Total stylistic control.",
    subtitle: "Decide exactly how far the identity transfer goes.",
    paragraphs: [
      "Sometimes you want only the face — keeping the original hairstyle, ears, and head shape intact. Other times you need the full head — hair, jawline, hairline, everything. Nano FaceSwap Pro exposes both modes as a single toggle, so the decision stays in the creator's hands.",
    ],
    bullets: [
      "Face-only mode: identity swap with the original silhouette preserved",
      "Full-head mode: complete identity transfer including hair and jawline",
      "Switch modes per-image without re-uploading or re-configuring",
    ],
    icon: ToggleRight,
    accent: "purple",
    visual: "face-head",
  },
  {
    index: 4,
    eyebrow: "Nano-level region control",
    title: "Pixel-level control over what stays and what changes.",
    subtitle: "Protect details. Repair occlusions. Iterate fast.",
    paragraphs: [
      "Production work demands fine control. Nano FaceSwap Pro ships two interactive tools that put pixel-level decisions back in the user's hands — a protected-region mask and a precision repair brush.",
      "Toggle the protected-region mask to keep accessories, jewelry, piercings, glasses, or any other foreground element untouched during the swap. When occlusion artifacts appear — a stray makeup brush, a microphone, a hair strand passing across the face — the precision brush isolates the region and the “Restore masked region” action reconstructs it with the original content, layer by layer until the result is clean.",
    ],
    bullets: [
      "Protected-region mask — preserve jewelry, glasses, makeup, and accessories",
      "Precision repair brush for occlusion and content-shift correction",
      "Iterative restore: reapply with one click until the region is perfect",
    ],
    icon: Wand2,
    accent: "fuchsia",
    visual: "mask",
  },
  {
    index: 5,
    eyebrow: "Built-in virtual face library",
    title: "A license-free reference library of AI-generated identities.",
    subtitle: "No model releases. No third-party rights. No real photos required.",
    paragraphs: [
      "Every reference identity in the library is fully synthetic — generated in-house with our own diffusion stack. There are no model-release contracts, no licensing fees, and no third-party-rights friction in your workflow.",
      "The library is curated for diversity across gender, ethnicity, age, and facial structure, so any creative brief can be matched on the first try. Upload your own reference when you have one — or browse the library when you don't.",
    ],
    bullets: [
      "Hundreds of identities in the desktop Pro app",
      "Gender- and ethnicity-balanced curation",
      "Zero licensing risk — every face is AI-generated and royalty-free",
      "Test the tool privately without uploading anyone's photo",
    ],
    icon: Library,
    accent: "emerald",
    visual: "library",
  },
  {
    index: 6,
    eyebrow: "Benchmarked against the field",
    title: "Side-by-side, the difference is obvious.",
    subtitle: "Same input. Leading apps. One clear winner.",
    paragraphs: [
      "We evaluated Nano FaceSwap Pro against the most widely used face-swap tools on the market — open-source GAN pipelines and commercial cloud services alike. The benchmark covers identity preservation, lighting consistency, skin-texture realism, edge fidelity, and resolution retention.",
      "Across every metric, the diffusion-based pipeline produced sharper, more identity-faithful, and more naturally lit results.",
    ],
    bullets: [
      "Stronger identity preservation on small and large faces",
      "Better lighting and color match — no flat “pasted-on” look",
      "Higher edge fidelity around hair, jawline, and accessories",
      "Reproducible benchmark gallery available in-app",
    ],
    icon: Trophy,
    accent: "amber",
    visual: "benchmark",
  },
  {
    index: 7,
    eyebrow: "Pro-Local exclusive",
    title: "Re-direct emotion in post.",
    subtitle: "Adjust expressions without re-shooting.",
    paragraphs: [
      "Available exclusively in the desktop Pro release, the facial-expression editor lets you adjust a portrait's emotional read in seconds. Open closed eyes, soften a frown, lift a smile, or shift the entire mood of the shot — all without re-shooting and without compromising identity.",
      "Designed for editorial photography, film VFX, and post-production teams that need creative control after the camera is put down.",
    ],
    bullets: [
      "Open and close eyes with continuous control",
      "Adjust smile intensity from neutral to broad",
      "Reshape brow, mouth, and overall expression independently",
      "Identity-preserving — the subject's likeness is never altered",
    ],
    icon: Smile,
    accent: "rose",
    proOnly: true,
    visual: "expression",
  },
];

const ACCENT_STYLES: Record<
  FeatureRow["accent"],
  { bg: string; ring: string; iconText: string; iconBg: string; chip: string }
> = {
  indigo: {
    bg: "bg-indigo-500/10",
    ring: "ring-indigo-500/20",
    iconText: "text-indigo-500",
    iconBg: "from-indigo-500 to-blue-500",
    chip: "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
    iconText: "text-blue-500",
    iconBg: "from-blue-500 to-cyan-500",
    chip: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    ring: "ring-purple-500/20",
    iconText: "text-purple-500",
    iconBg: "from-purple-500 to-fuchsia-500",
    chip: "bg-purple-500/10 text-purple-500 ring-purple-500/20",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10",
    ring: "ring-fuchsia-500/20",
    iconText: "text-fuchsia-500",
    iconBg: "from-fuchsia-500 to-pink-500",
    chip: "bg-fuchsia-500/10 text-fuchsia-500 ring-fuchsia-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    iconText: "text-emerald-500",
    iconBg: "from-emerald-500 to-teal-500",
    chip: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    iconText: "text-amber-500",
    iconBg: "from-amber-400 to-orange-500",
    chip: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/20",
    iconText: "text-rose-500",
    iconBg: "from-rose-500 to-pink-500",
    chip: "bg-rose-500/10 text-rose-500 ring-rose-500/20",
  },
};

function Visual({
  variant,
  accent,
}: {
  variant: FeatureRow["visual"];
  accent: FeatureRow["accent"];
}) {
  const a = ACCENT_STYLES[accent];

  if (variant === "multi-face") {
    return (
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 ${a.bg} p-8 backdrop-blur-sm`}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${a.iconBg} shadow-lg ring-4 ring-white/10`}
              style={{ transform: `translateY(${i === 1 ? "-12px" : "0"})` }}
            >
              <Users className="h-9 w-9 text-white/90" />
              <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-bold text-foreground shadow-md">
                {i + 1}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                Swap
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>3 faces detected</span>
          <span className="font-mono">batch · select · per-face</span>
        </div>
      </div>
    );
  }

  if (variant === "resolution") {
    const sizes = [
      { label: "4K · Original", scale: 1.0, blur: 0 },
      { label: "2K · Crop", scale: 0.78, blur: 0 },
      { label: "1K · Detail", scale: 0.56, blur: 0 },
    ];
    return (
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 ${a.bg} p-6 backdrop-blur-sm`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {sizes.map((s, i) => (
            <div
              key={s.label}
              className="absolute rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 ring-1 ring-white/20 shadow-xl backdrop-blur-sm"
              style={{
                width: `${65 * s.scale}%`,
                height: `${65 * s.scale}%`,
                zIndex: sizes.length - i,
                transform: `translate(${i * 18}px, ${i * 18}px)`,
              }}
            >
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-mono font-semibold text-foreground shadow-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span className="font-mono">1:1 resolution preservation</span>
          <span>no downsample</span>
        </div>
      </div>
    );
  }

  if (variant === "face-head") {
    return (
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 ${a.bg} p-8 backdrop-blur-sm`}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-10">
          {[
            { label: "Face only", caption: "keep hair · ears · jaw" },
            { label: "Full head", caption: "swap everything" },
          ].map((m, i) => (
            <div key={m.label} className="flex flex-col items-center gap-3">
              <div
                className={`relative flex h-28 w-24 items-end justify-center overflow-hidden rounded-t-[40%] bg-gradient-to-br ${a.iconBg} shadow-lg`}
              >
                <div className="h-12 w-16 rounded-full bg-white/90 mb-2" />
                {i === 0 && (
                  <div className="absolute inset-x-2 top-2 h-3 rounded-full bg-white/60" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {m.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{m.caption}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-mono font-semibold text-foreground shadow-sm backdrop-blur-sm">
          <ToggleRight className={`h-3.5 w-3.5 ${a.iconText}`} />
          mode toggle
        </div>
      </div>
    );
  }

  if (variant === "mask") {
    return (
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 ${a.bg} p-6 backdrop-blur-sm`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`relative flex h-44 w-36 items-end justify-center rounded-t-[45%] bg-gradient-to-br ${a.iconBg} shadow-xl`}
          >
            <div className="absolute right-2 top-8 h-4 w-4 rounded-full bg-amber-300 ring-2 ring-amber-200/80 shadow" />
            <div className="absolute left-2 top-9 h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-amber-200/80 shadow" />
            <div
              className="absolute inset-x-6 top-12 h-12 rounded-2xl border-2 border-dashed border-white/80"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />
            <div className="h-14 w-20 rounded-full bg-white/90 mb-3" />
          </div>
        </div>
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-mono font-semibold text-foreground shadow-sm backdrop-blur-sm">
          <Wand2 className={`h-3.5 w-3.5 ${a.iconText}`} />
          precision brush
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-mono font-semibold text-foreground shadow-sm backdrop-blur-sm">
          <ShieldCheck className={`h-3.5 w-3.5 text-emerald-500`} />
          protected mask
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-center text-[11px] font-medium text-muted-foreground">
          dashed area preserved · accessories intact
        </div>
      </div>
    );
  }

  if (variant === "library") {
    return (
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 ${a.bg} p-6 backdrop-blur-sm`}
      >
        <div className="absolute inset-6 grid grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => {
            const palettes = [
              "from-rose-400 to-pink-500",
              "from-amber-400 to-orange-500",
              "from-emerald-400 to-teal-500",
              "from-blue-400 to-cyan-500",
              "from-purple-400 to-fuchsia-500",
              "from-slate-400 to-slate-600",
              "from-indigo-400 to-violet-500",
              "from-yellow-400 to-amber-500",
              "from-pink-400 to-rose-500",
              "from-teal-400 to-cyan-500",
              "from-fuchsia-400 to-purple-500",
              "from-orange-400 to-red-500",
            ];
            return (
              <div
                key={i}
                className={`relative aspect-square rounded-2xl bg-gradient-to-br ${palettes[i % palettes.length]} shadow-md ring-1 ring-white/20 overflow-hidden`}
              >
                <div className="absolute inset-x-2 bottom-0 h-2/3 rounded-t-full bg-white/30" />
                <div className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-white/70" />
              </div>
            );
          })}
        </div>
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-mono font-semibold text-foreground shadow-sm backdrop-blur-sm">
          <Library className={`h-3.5 w-3.5 ${a.iconText}`} />
          virtual identities
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-mono font-semibold text-emerald-700 ring-1 ring-emerald-500/20 backdrop-blur-sm">
          royalty-free
        </div>
      </div>
    );
  }

  if (variant === "benchmark") {
    const cols = [
      { name: "Tool A", height: 55, winner: false },
      { name: "Nano FaceSwap Pro", height: 92, winner: true },
      { name: "Tool B", height: 64, winner: false },
    ];
    return (
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 ${a.bg} p-6 backdrop-blur-sm`}
      >
        <div className="absolute inset-x-6 bottom-12 flex items-end justify-center gap-4 h-[60%]">
          {cols.map((c) => (
            <div key={c.name} className="flex w-1/4 flex-col items-center gap-2">
              <div
                className={`relative flex w-full items-start justify-center rounded-t-2xl ${
                  c.winner
                    ? `bg-gradient-to-t ${a.iconBg} shadow-lg`
                    : "bg-muted-foreground/20"
                }`}
                style={{ height: `${c.height}%` }}
              >
                {c.winner && (
                  <Crown className="mt-2 h-5 w-5 text-white drop-shadow" />
                )}
              </div>
              <p
                className={`truncate text-center text-[10px] font-mono ${
                  c.winner
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {c.name}
              </p>
            </div>
          ))}
        </div>
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-mono font-semibold text-foreground shadow-sm backdrop-blur-sm">
          <Trophy className={`h-3.5 w-3.5 ${a.iconText}`} />
          benchmark · same input
        </div>
        <div className="absolute bottom-3 left-4 right-4 text-center text-[11px] font-medium text-muted-foreground">
          identity · lighting · texture · edges · resolution
        </div>
      </div>
    );
  }

  // expression
  const expressions = [
    { mood: "Frown", offset: -1 },
    { mood: "Neutral", offset: 0 },
    { mood: "Smile", offset: 1 },
    { mood: "Bright", offset: 2 },
  ];
  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 ${a.bg} p-6 backdrop-blur-sm`}
    >
      <div className="absolute inset-0 flex items-center justify-center gap-3">
        {expressions.map((e, i) => (
          <div key={e.mood} className="flex flex-col items-center gap-2">
            <div
              className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${a.iconBg} shadow-md ring-2 ring-white/20`}
              style={{ opacity: 0.5 + i * 0.16 }}
            >
              <Smile
                className="h-9 w-9 text-white/95"
                style={{
                  transform: `rotate(${e.offset === 0 ? 0 : e.offset * 6}deg)`,
                }}
              />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground">
              {e.mood}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-mono font-semibold text-foreground shadow-sm backdrop-blur-sm">
        <Sparkles className={`h-3.5 w-3.5 ${a.iconText}`} />
        expression slider
      </div>
      <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-[10px] font-mono font-bold text-rose-700 ring-1 ring-rose-500/20 backdrop-blur-sm">
        Pro Local exclusive
      </div>
    </div>
  );
}

function FeatureSection({ feature, flip }: { feature: FeatureRow; flip: boolean }) {
  const a = ACCENT_STYLES[feature.accent];
  const Icon = feature.icon;

  return (
    <section className="relative px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-12">
          <div
            className={`lg:col-span-6 ${flip ? "lg:order-2" : "lg:order-1"}`}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="font-mono text-base text-foreground/60">
                0{feature.index}
              </span>
              <span className={a.iconText}>{feature.eyebrow}</span>
              {feature.proOnly && (
                <span className="ml-2 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 ring-1 ring-rose-500/20">
                  PRO LOCAL
                </span>
              )}
            </div>

            <div className="mb-3 inline-flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.iconBg} text-white shadow-md`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <h2 className="mb-3 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {feature.title}
            </h2>
            <p className="mb-5 text-base font-medium text-muted-foreground sm:text-lg">
              {feature.subtitle}
            </p>

            <div className="mb-6 space-y-3">
              {feature.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  {p}
                </p>
              ))}
            </div>

            <ul className="space-y-2.5">
              {feature.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${a.iconText}`}
                  />
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`lg:col-span-6 ${flip ? "lg:order-1" : "lg:order-2"}`}
          >
            <Visual variant={feature.visual} accent={feature.accent} />
          </div>
        </div>
      </div>
    </section>
  );
}

const TRUST_HIGHLIGHTS = [
  "Free online demo — no credit card",
  "100% local desktop processing",
  "GPU-accelerated · NVIDIA & Apple Silicon",
  "Built by Generative AI & image-quality PhDs",
];

export default function NanoFaceSwapProFeaturesPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute top-1/3 right-0 h-[320px] w-[320px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/apps/nano-faceswap-pro"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Nano FaceSwap Pro
          </Link>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            <Sparkles className="h-3.5 w-3.5" />
            Product tour · Seven core capabilities
          </div>

          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Inside Nano FaceSwap{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              Pro
            </span>
          </h1>

          <p className="mb-6 max-w-3xl text-balance text-lg text-muted-foreground sm:text-xl">
            A complete, professional face-swap workflow — engineered for creators who need pixel-perfect control, full-resolution output, and a license-free path to production.
          </p>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Link href="/#announcement">
              <Button
                size="lg"
                className="group gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-8 text-white border-0 shadow-lg shadow-indigo-500/25 hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                Try Free Online
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/download">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-8"
              >
                <Download className="h-4 w-4" />
                Download desktop app
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {TRUST_HIGHLIGHTS.map((h) => (
              <span key={h} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quick jump table-of-contents */}
      <section className="relative px-6 pb-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-sm">
            <p className="mb-3 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              On this page
            </p>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => {
                const a = ACCENT_STYLES[f.accent];
                return (
                  <a
                    key={f.index}
                    href={`#feature-${f.index}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-all hover:opacity-80 ${a.chip}`}
                  >
                    <span className="font-mono text-[10px] opacity-60">
                      0{f.index}
                    </span>
                    {f.eyebrow}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature rows */}
      {FEATURES.map((f) => (
        <div key={f.index} id={`feature-${f.index}`} className="scroll-mt-24">
          <FeatureSection feature={f} flip={f.index % 2 === 0} />
        </div>
      ))}

      {/* Trust strip */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-card/60 to-card/20 p-8 backdrop-blur-sm sm:p-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    100% local processing
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Desktop Pro runs entirely on your GPU. Photos never leave your machine.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    GPU-accelerated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    NVIDIA CUDA on Windows · Metal on Apple Silicon (M2–M5).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    Production-grade
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Royalty-free virtual face library and clear licensing for commercial workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[100px]" />
            </div>
            <div className="relative">
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                Ready for production-grade face swap?
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-sm text-slate-300 sm:text-base">
                Try the online demos in your browser, or download the desktop Pro app for the complete workflow — including the virtual face library and expression editor.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/#announcement">
                  <Button
                    size="lg"
                    className="group gap-2 rounded-full bg-white text-slate-900 hover:bg-white/90 shadow-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    Try Free Online
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/download">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group gap-2 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" />
                    Download desktop Pro
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
