"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ImagePart {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

interface VisualConfig {
  /** "single" = one tall image, "stack" = two stacked, "split" = two columns */
  layout: "single" | "stack" | "split";
  primary: ImagePart;
  secondary?: ImagePart;
}

interface FeatureRow {
  index: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  hint: string;
  proOnly?: boolean;
  visual: VisualConfig | { layout: "css"; variant: "benchmark" | "expression" };
}

const FEATURES: FeatureRow[] = [
  {
    index: 1,
    eyebrow: "Multiple Faces",
    title: "Swap one. Swap all.",
    subtitle:
      "A detection-aware multi-subject pipeline. Every face in the frame is treated as an independent identity-transfer target — no quality loss when the count climbs.",
    bullets: [
      "Per-face targeting with a numbered face picker",
      "One-click swap-all for group portraits",
      "Same fidelity on a single face or six",
    ],
    hint: "Per-face control · batch swap",
    visual: {
      layout: "stack",
      primary: {
        src: "/images/faceswap-pro/image10.png",
        alt: "Before and after grid showing nine portraits face-swapped in a single shot",
        width: 2048,
        height: 1046,
        caption: "Same input · all nine faces swapped in one pass",
      },
      secondary: {
        src: "/images/faceswap-pro/image21.png",
        alt: "Per-face reference picker UI listing six detected faces, each assigned an individual identity reference",
        width: 1802,
        height: 554,
        caption: "Pick any combination of references — one per detected face",
      },
    },
  },
  {
    index: 2,
    eyebrow: "Original Resolution",
    title: "4K stays 4K.",
    subtitle:
      "Engineered around a high-resolution diffusion pipeline paired with a state-of-the-art detail-preserving upscaler. Output returns at the exact same resolution as the input — sharp skin, clean edges, intact pores.",
    bullets: [
      "1:1 resolution preservation — input pixels equal output pixels",
      "Optimized for large-face crops and high-density images",
      "No softening, banding, or upscaling artifacts",
    ],
    hint: "Detail-preserving · no downsample",
    visual: {
      layout: "single",
      primary: {
        src: "/images/faceswap-pro/image11.png",
        alt: "Three-panel comparison preserving fine skin detail across original, intermediate, and final swapped portrait at 2K",
        width: 1899,
        height: 828,
        caption: "Original · reference · result · all at full resolution",
      },
    },
  },
  {
    index: 3,
    eyebrow: "Two Modes",
    title: "Face only, or full head.",
    subtitle:
      "Decide exactly how far the identity transfer goes. Keep the original silhouette, or replace the entire head — hair, hairline, jawline included. The choice is a single toggle.",
    bullets: [
      "Face-only — identity swap with original hair, ears, and head shape preserved",
      "Full-head — complete identity transfer including hair and jawline",
      "Switch modes per image without re-uploading or re-configuring",
    ],
    hint: "Single mode toggle",
    visual: {
      layout: "stack",
      primary: {
        src: "/images/faceswap-pro/image9.png",
        alt: "Choose swap mode UI with two cards: Face Swap (only the face region is swapped) and Head Swap (the whole head is swapped)",
        width: 1722,
        height: 318,
        caption: "Choose swap mode at the start of every job",
      },
      secondary: {
        src: "/images/faceswap-pro/image13.png",
        alt: "Three-panel demonstration: subject portrait, reference portrait, and the resulting face-only swap that keeps the original hairstyle",
        width: 1919,
        height: 952,
        caption: "Subject · reference · result with original hair preserved",
      },
    },
  },
  {
    index: 4,
    eyebrow: "Pixel-Level Control",
    title: "Keep what you want. Restore what you need.",
    subtitle:
      "Production work demands fine control. Two interactive tools put pixel-level decisions back in the user's hands — a protected-region mask for accessories and apparel, and a precision repair brush for occlusion artifacts.",
    bullets: [
      "Toggle the protected-region mask to keep hair, hats, jewelry, and accessories intact",
      "Use the precision brush to mark occlusions — makeup brushes, microphones, hair strands",
      "Press “Restore masked region” once or several times to bring the original content back",
    ],
    hint: "Protected mask · precision brush",
    visual: {
      layout: "split",
      primary: {
        src: "/images/faceswap-pro/image1.png",
        alt: "Keep occluders panel with toggles for Background, Hair, Upper Clothing, Apparel, Face Neck, and Lower Lip",
        width: 434,
        height: 922,
        caption: "Toggle exactly which regions stay untouched",
      },
      secondary: {
        src: "/images/faceswap-pro/image3.png",
        alt: "Before and after close-up showing the subject's nose ring fully preserved through the swap",
        width: 2048,
        height: 723,
        caption: "Result — the nose ring survives the swap",
      },
    },
  },
  {
    index: 5,
    eyebrow: "Virtual Identity Library",
    title: "License-free reference faces, built in.",
    subtitle:
      "A curated, in-app gallery of fully synthetic identities — no model releases, no licensing fees, no third-party rights. Diverse across gender, ethnicity, and age, so any creative brief can be matched on the first try.",
    bullets: [
      "Hundreds of identities in the desktop Pro app",
      "Gender- and ethnicity-balanced curation",
      "Royalty-free — every face is AI-generated",
      "Test the tool privately without uploading anyone's photo",
    ],
    hint: "Click a face to use as reference",
    visual: {
      layout: "single",
      primary: {
        src: "/images/faceswap-pro/image17.png",
        alt: "Virtual face library UI with twelve diverse AI-generated reference identities arranged in a grid",
        width: 1433,
        height: 524,
        caption: "“Or pick a virtual face” — built into the workflow",
      },
    },
  },
  {
    index: 6,
    eyebrow: "Head-to-Head",
    title: "Benchmarked against the field.",
    subtitle:
      "Evaluated against the most widely used face-swap tools on the market. Across identity preservation, lighting consistency, skin texture, edge fidelity, and resolution retention — the diffusion-based pipeline produces sharper, more identity-faithful, and more naturally lit results.",
    bullets: [
      "Stronger identity lock-in on small and large faces",
      "Better lighting and color match — no flat “pasted-on” look",
      "Higher edge fidelity around hair, jawline, and accessories",
      "Reproducible benchmark gallery available in-app",
    ],
    hint: "Same input · multiple apps · clearest result",
    visual: { layout: "css", variant: "benchmark" },
  },
  {
    index: 7,
    eyebrow: "Pro Local Exclusive",
    title: "Re-direct emotion in post.",
    subtitle:
      "Available exclusively in the desktop Pro release. Adjust a portrait's emotional read in seconds — open closed eyes, soften a frown, lift a smile — without re-shooting and without compromising identity.",
    bullets: [
      "Open and close eyes with continuous control",
      "Adjust smile intensity from neutral to broad",
      "Reshape brow, mouth, and overall expression independently",
      "Identity-preserving — the subject's likeness is never altered",
    ],
    hint: "Slider-driven · identity-preserving",
    proOnly: true,
    visual: { layout: "css", variant: "expression" },
  },
];

const ARROW_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 7h8M8 3l3 4-3 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HINT_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className="text-white/30"
    aria-hidden="true"
  >
    <path
      d="M7 1v12M1 7h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

function VisualBlock({ v }: { v: FeatureRow["visual"] }) {
  if ("variant" in v) {
    if (v.variant === "benchmark") {
      const cols = [
        { label: "Tool A", height: 42 },
        { label: "Nano FaceSwap Pro", height: 96, winner: true },
        { label: "Tool B", height: 56 },
      ];
      return (
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            <span>Benchmark</span>
            <span>Same input · five metrics</span>
          </div>
          <div className="flex h-[260px] items-end justify-center gap-12 px-12 pb-10 pt-6 sm:h-[320px] sm:gap-16">
            {cols.map((c) => (
              <div
                key={c.label}
                className="flex h-full w-20 flex-col items-center justify-end gap-3"
              >
                <div
                  className={`relative w-full rounded-t-md transition-all ${
                    c.winner
                      ? "bg-gradient-to-t from-white to-white/40 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                      : "bg-white/15"
                  }`}
                  style={{ height: `${c.height}%` }}
                >
                  {c.winner && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.2em] text-white">
                      Winner
                    </span>
                  )}
                </div>
                <p
                  className={`whitespace-nowrap text-[11px] font-mono ${
                    c.winner ? "text-white" : "text-white/40"
                  }`}
                >
                  {c.label}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 px-5 py-3 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
            identity · lighting · texture · edges · resolution
          </div>
        </div>
      );
    }

    // expression
    const slots = ["Frown", "Neutral", "Smile", "Bright"];
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
          <span>Expression</span>
          <span>Pro Local exclusive</span>
        </div>
        <div className="flex flex-col items-stretch gap-5 px-8 py-10 sm:px-12">
          <div className="grid grid-cols-4 gap-4">
            {slots.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div
                  className="relative flex aspect-square w-full items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04]"
                  style={{ opacity: 0.4 + i * 0.18 }}
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    fill="none"
                    className="text-white"
                  >
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    <circle cx="16" cy="19" r="1.5" fill="currentColor" />
                    <circle cx="28" cy="19" r="1.5" fill="currentColor" />
                    <path
                      d={
                        i === 0
                          ? "M14 30c2.5-2 5.5-3 8-3s5.5 1 8 3"
                          : i === 1
                          ? "M14 28h16"
                          : i === 2
                          ? "M14 27c2.5 2 5.5 3 8 3s5.5-1 8-3"
                          : "M13 26c3 4 6 5 9 5s6-1 9-5"
                      }
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-white/50">{s}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 px-2">
            <div className="relative h-1 rounded-full bg-white/10">
              <div className="absolute left-0 top-0 h-full w-2/3 rounded-full bg-white/60" />
              <div className="absolute -top-1 left-[66%] h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
              <span>frown</span>
              <span>bright</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (v.layout === "single") {
    return (
      <figure className="w-full">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50">
          <Image
            src={v.primary.src}
            alt={v.primary.alt}
            width={v.primary.width}
            height={v.primary.height}
            className="h-auto w-full"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </div>
        {v.primary.caption && (
          <figcaption className="mt-3 text-center text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
            {v.primary.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (v.layout === "stack") {
    return (
      <div className="flex w-full flex-col gap-4">
        <figure>
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50">
            <Image
              src={v.primary.src}
              alt={v.primary.alt}
              width={v.primary.width}
              height={v.primary.height}
              className="h-auto w-full"
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </div>
          {v.primary.caption && (
            <figcaption className="mt-2 text-center text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
              {v.primary.caption}
            </figcaption>
          )}
        </figure>
        {v.secondary && (
          <figure>
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50">
              <Image
                src={v.secondary.src}
                alt={v.secondary.alt}
                width={v.secondary.width}
                height={v.secondary.height}
                className="h-auto w-full"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            </div>
            {v.secondary.caption && (
              <figcaption className="mt-2 text-center text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
                {v.secondary.caption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    );
  }

  // split — left/right (works well when primary is portrait-tall)
  return (
    <div className="grid w-full grid-cols-12 items-stretch gap-3 sm:gap-4">
      <figure className="col-span-12 sm:col-span-5">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50">
          <Image
            src={v.primary.src}
            alt={v.primary.alt}
            width={v.primary.width}
            height={v.primary.height}
            className="h-auto w-full"
            sizes="(min-width: 1024px) 28vw, 100vw"
          />
        </div>
        {v.primary.caption && (
          <figcaption className="mt-2 text-center text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
            {v.primary.caption}
          </figcaption>
        )}
      </figure>
      {v.secondary && (
        <figure className="col-span-12 sm:col-span-7">
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50">
            <Image
              src={v.secondary.src}
              alt={v.secondary.alt}
              width={v.secondary.width}
              height={v.secondary.height}
              className="h-auto w-full"
              sizes="(min-width: 1024px) 32vw, 100vw"
            />
          </div>
          {v.secondary.caption && (
            <figcaption className="mt-2 text-center text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
              {v.secondary.caption}
            </figcaption>
          )}
        </figure>
      )}
    </div>
  );
}

export function FaceSwapFeatureRows() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [parallaxOffsets, setParallaxOffsets] = useState<number[]>(
    () => new Array(FEATURES.length).fill(0)
  );
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSet((prev) => {
              if (prev.has(i)) return prev;
              const next = new Set(prev);
              next.add(i);
              return next;
            });
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleScroll = useCallback(() => {
    const offsets = sectionRefs.current.map((el) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = (viewH - rect.top) / (viewH + rect.height);
      return (progress - 0.5) * 60;
    });
    setParallaxOffsets(offsets);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="relative bg-black">
      {/* Sticky right-side dot navigation — same as landing page feature-showcase */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
        {FEATURES.map((f, i) => (
          <button
            key={f.index}
            type="button"
            onClick={() =>
              sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" })
            }
            className="group relative flex items-center"
            aria-label={`Go to ${f.eyebrow}`}
          >
            <span
              className={`absolute right-6 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all duration-500 ${
                activeIndex === i
                  ? "translate-x-0 bg-white/15 text-white opacity-100 backdrop-blur-sm"
                  : "translate-x-2 bg-white/10 text-white/70 opacity-0 backdrop-blur-sm group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {f.eyebrow}
            </span>
            <span
              className={`rounded-full transition-all duration-500 ${
                activeIndex === i
                  ? "h-2.5 w-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                  : "h-2 w-2 bg-white/30 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      {FEATURES.map((feature, i) => {
        const isVisible = visibleSet.has(i);
        const fromRight = i % 2 === 0;

        return (
          <div
            key={feature.index}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            id={`feature-${feature.index}`}
            className="relative flex items-center justify-center overflow-hidden bg-black px-4 py-16 sm:px-6 sm:py-20 md:py-24 scroll-mt-24"
          >
            {/* Subtle radial gradient — only one cool blue→violet hue, shifts gently per section */}
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0 opacity-25 transition-transform duration-100 ease-out will-change-transform"
                style={{
                  background: `radial-gradient(ellipse at ${
                    i % 2 === 0 ? "30% 50%" : "70% 50%"
                  }, hsl(${220 + i * 10}, 55%, 25%) 0%, transparent 70%)`,
                  transform: `translateY(${parallaxOffsets[i] ?? 0}px)`,
                }}
              />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
              {/* Text side — compact (28%) */}
              <div
                className={`flex flex-col items-center text-center lg:w-[32%] lg:items-start lg:text-left ${
                  fromRight ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <span
                  className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0)"
                      : "translateY(12px)",
                    transitionDelay: "0s",
                  }}
                >
                  <span className="font-mono text-white/40">
                    {String(feature.index).padStart(2, "0")} /{" "}
                    {String(FEATURES.length).padStart(2, "0")}
                  </span>
                  <span className="text-white/60">{feature.eyebrow}</span>
                  {feature.proOnly && (
                    <span className="rounded-full border border-white/30 px-1.5 py-0 text-[8px] font-bold text-white/80">
                      PRO
                    </span>
                  )}
                </span>

                <h2
                  className="mb-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0)"
                      : "translateY(30px)",
                    transitionDelay: "0.1s",
                  }}
                >
                  {feature.title}
                </h2>

                <p
                  className="max-w-md text-sm leading-relaxed text-white/60 sm:text-base transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0)"
                      : "translateY(20px)",
                    transitionDelay: "0.2s",
                  }}
                >
                  {feature.subtitle}
                </p>

                <ul
                  className="mt-5 max-w-md space-y-2 transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0)"
                      : "translateY(20px)",
                    transitionDelay: "0.3s",
                  }}
                >
                  {feature.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-left text-sm text-white/70"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="mt-5 flex items-center gap-2 text-[11px] text-white/30 transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0)"
                      : "translateY(12px)",
                    transitionDelay: "0.4s",
                  }}
                >
                  {HINT_ICON}
                  {feature.hint}
                </div>

                <Link
                  href="/#announcement"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0)"
                      : "translateY(12px)",
                    transitionDelay: "0.5s",
                  }}
                >
                  Try it free online
                  {ARROW_ICON}
                </Link>
              </div>

              {/* Visual side — dominant (68%) */}
              <div
                className={`flex w-full items-center justify-center lg:w-[68%] transition-all duration-1000 ease-out ${
                  fromRight ? "lg:order-2" : "lg:order-1"
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? "translateX(0) scale(1)"
                    : `translateX(${fromRight ? "40px" : "-40px"}) scale(0.97)`,
                  transitionDelay: "0.15s",
                }}
              >
                <VisualBlock v={feature.visual} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
