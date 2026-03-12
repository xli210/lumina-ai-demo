"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BeforeAfterSlider } from "./before-after-slider";
import { FaceSwapDemo } from "./demos/face-swap-demo";
import { FacialEditDemo } from "./demos/facial-edit-demo";
import { UpscaleDemo } from "./demos/upscale-demo";
import { EditDemo } from "./demos/edit-demo";
import { StyleTransferDemo } from "./demos/style-transfer-demo";
import { TryonDemo } from "./demos/tryon-demo";

type FeatureType = "equation" | "carousel" | "magnifier" | "slider" | "grid" | "triplet" | "tryon";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  type: FeatureType;
  hint: string;
}

const features: Feature[] = [
  {
    id: "faceswap",
    title: "Face Swap",
    subtitle: "Realistic AI face replacement in photos & videos",
    type: "equation",
    hint: "Hover to reveal the swap",
  },
  {
    id: "facialedit",
    title: "Facial Edit",
    subtitle: "AI-powered retouching & expression editing",
    type: "carousel",
    hint: "Hover each variation",
  },
  {
    id: "upscale",
    title: "Image Upscale",
    subtitle: "Enhance resolution & restore old photos with AI",
    type: "magnifier",
    hint: "Move cursor to inspect details",
  },
  {
    id: "colorize",
    title: "Colorize",
    subtitle: "Bring black & white photos to life with AI color",
    type: "slider",
    hint: "Drag the slider to compare",
  },
  {
    id: "edit",
    title: "Image Edit",
    subtitle: "Generate & re-imagine images from text prompts",
    type: "grid",
    hint: "Hover to see prompt variations",
  },
  {
    id: "style",
    title: "Style Transfer",
    subtitle: "Apply artistic styles to any photo instantly",
    type: "triplet",
    hint: "Hover to apply the style",
  },
  {
    id: "tryon",
    title: "Virtual Try-On",
    subtitle: "See how clothes look on you before you buy",
    type: "tryon",
    hint: "Hover the clothing to try it on",
  },
];

function renderDemo(feature: Feature) {
  switch (feature.type) {
    case "equation":
      return <FaceSwapDemo />;
    case "carousel":
      return <FacialEditDemo />;
    case "magnifier":
      return <UpscaleDemo />;
    case "slider":
      return (
        <div className="group/slider rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.06)]">
          <BeforeAfterSlider
            before="/images/demos/colorize-before.jpg"
            after="/images/demos/colorize-after.jpg"
            alt="Colorize"
            width={1200}
            height={1000}
          />
        </div>
      );
    case "grid":
      return <EditDemo />;
    case "triplet":
      return <StyleTransferDemo />;
    case "tryon":
      return <TryonDemo />;
  }
}

function hintIcon(type: FeatureType) {
  if (type === "slider") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
        <path d="M1 7H13M7 1L13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "magnifier") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [parallaxOffsets, setParallaxOffsets] = useState<number[]>(
    () => new Array(features.length).fill(0),
  );
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i); },
        { threshold: 0.5 },
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
        { threshold: 0.25 },
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
    <section id="showcase-features" className="relative">
      {/* Sticky nav dots */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
        {features.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" })}
            className="group relative flex items-center"
            aria-label={`Go to ${f.title}`}
          >
            <span
              className={`absolute right-6 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all duration-500 ${
                activeIndex === i
                  ? "opacity-100 translate-x-0 bg-white/15 backdrop-blur-sm text-white"
                  : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white/10 backdrop-blur-sm text-white/70"
              }`}
            >
              {f.title}
            </span>
            <div
              className={`rounded-full transition-all duration-500 ${
                activeIndex === i
                  ? "h-2.5 w-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)] animate-[pulse-dot_3s_ease-in-out_infinite]"
                  : "h-2 w-2 bg-white/30 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Feature sections */}
      {features.map((feature, i) => {
        const isVisible = visibleSet.has(i);
        const fromRight = i % 2 === 0;

        return (
          <div
            key={feature.id}
            ref={(el) => { sectionRefs.current[i] = el; }}
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-16 sm:px-6 md:py-24"
          >
            {i > 0 && (
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent z-[1]" />
            )}

            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0 opacity-20 transition-transform duration-100 ease-out will-change-transform"
                style={{
                  background: `radial-gradient(ellipse at ${
                    i % 2 === 0 ? "30% 50%" : "70% 50%"
                  }, hsl(${210 + i * 18}, 60%, 25%) 0%, transparent 70%)`,
                  transform: `translateY(${parallaxOffsets[i] ?? 0}px)`,
                }}
              />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:gap-16">
              {/* Text side */}
              <div
                className={`flex flex-col items-center text-center lg:w-2/5 lg:items-start lg:text-left ${
                  fromRight ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <span
                  className="mb-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50 transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: "0s",
                  }}
                >
                  {String(i + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
                </span>

                <h2
                  className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(30px)",
                    transitionDelay: "0.1s",
                  }}
                >
                  {feature.title}
                </h2>

                <p
                  className="max-w-sm text-base text-white/60 sm:text-lg transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transitionDelay: "0.2s",
                  }}
                >
                  {feature.subtitle}
                </p>

                <div
                  className="mt-6 flex items-center gap-2 text-xs text-white/30 transition-all duration-700 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: "0.3s",
                  }}
                >
                  {hintIcon(feature.type)}
                  {feature.hint}
                </div>
              </div>

              {/* Demo side */}
              <div
                className={`flex w-full items-center justify-center lg:w-3/5 transition-all duration-800 ease-out ${
                  fromRight ? "lg:order-2" : "lg:order-1"
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? "translateX(0) scale(1)"
                    : `translateX(${fromRight ? "40px" : "-40px"}) scale(0.96)`,
                  transitionDelay: "0.15s",
                }}
              >
                {renderDemo(feature)}
              </div>
            </div>

            {i < features.length - 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-[1]" />
            )}
          </div>
        );
      })}
    </section>
  );
}
