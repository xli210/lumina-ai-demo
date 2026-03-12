"use client";

import { useEffect, useRef, useState } from "react";
import { BeforeAfterSlider } from "./before-after-slider";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  before: string;
  after: string;
  width: number;
  height: number;
}

const features: Feature[] = [
  {
    id: "faceswap",
    title: "Face Swap",
    subtitle: "Realistic AI face replacement in photos & videos",
    before: "/images/demos/faceswap-before.jpg",
    after: "/images/demos/faceswap-after.jpg",
    width: 900,
    height: 1200,
  },
  {
    id: "facialedit",
    title: "Facial Edit",
    subtitle: "AI-powered retouching & expression editing",
    before: "/images/demos/facialedit-before.jpg",
    after: "/images/demos/facialedit-after.jpg",
    width: 700,
    height: 1040,
  },
  {
    id: "upscale",
    title: "Image Upscale",
    subtitle: "Enhance resolution & restore old photos with AI",
    before: "/images/demos/upscale-before.jpg",
    after: "/images/demos/upscale-after.jpg",
    width: 900,
    height: 1200,
  },
  {
    id: "colorize",
    title: "Colorize",
    subtitle: "Bring black & white photos to life with AI color",
    before: "/images/demos/colorize-before.jpg",
    after: "/images/demos/colorize-after.jpg",
    width: 1200,
    height: 1000,
  },
  {
    id: "edit",
    title: "Image Edit",
    subtitle: "Generate & re-imagine images from text prompts",
    before: "/images/demos/edit-before.jpg",
    after: "/images/demos/edit-after.jpg",
    width: 1000,
    height: 1000,
  },
  {
    id: "style",
    title: "Style Transfer",
    subtitle: "Apply artistic styles to any photo instantly",
    before: "/images/demos/style-before.jpg",
    after: "/images/demos/style-after.jpg",
    width: 1000,
    height: 1000,
  },
  {
    id: "tryon",
    title: "Virtual Try-On",
    subtitle: "See how clothes look on you before you buy",
    before: "/images/demos/tryon-before.jpg",
    after: "/images/demos/tryon-after.jpg",
    width: 600,
    height: 920,
  },
];

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(i);
          }
        },
        { threshold: 0.5 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section id="showcase-features" className="relative">
      {/* Sticky nav dots */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
        {features.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() =>
              sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" })
            }
            className="group relative flex items-center"
            aria-label={`Go to ${f.title}`}
          >
            <span
              className={`absolute right-6 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeIndex === i
                  ? "opacity-100 translate-x-0 bg-white/15 backdrop-blur-sm text-white"
                  : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white/10 backdrop-blur-sm text-white/70"
              }`}
            >
              {f.title}
            </span>
            <div
              className={`h-2 w-2 rounded-full transition-all ${
                activeIndex === i
                  ? "scale-125 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  : "bg-white/30 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Feature sections */}
      {features.map((feature, i) => (
        <div
          key={feature.id}
          ref={(el) => { sectionRefs.current[i] = el; }}
          className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-16 sm:px-6 md:py-24"
        >
          {/* Dark gradient background with subtle color shift per feature */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(ellipse at ${
                  i % 2 === 0 ? "30% 50%" : "70% 50%"
                }, hsl(${210 + i * 18}, 60%, 25%) 0%, transparent 70%)`,
              }}
            />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:gap-16">
            {/* Text side */}
            <div
              className={`flex flex-col items-center text-center lg:w-2/5 lg:items-start lg:text-left ${
                i % 2 === 0 ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <span className="mb-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                {String(i + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
              </span>

              <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {feature.title}
              </h2>

              <p className="max-w-sm text-base text-white/60 sm:text-lg">
                {feature.subtitle}
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
                  <path d="M1 7H13M7 1L13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Drag the slider to compare
              </div>
            </div>

            {/* Slider side */}
            <div
              className={`w-full max-w-xl lg:w-3/5 ${
                i % 2 === 0 ? "lg:order-2" : "lg:order-1"
              }`}
            >
              <div className="rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                <BeforeAfterSlider
                  before={feature.before}
                  after={feature.after}
                  alt={feature.title}
                  width={feature.width}
                  height={feature.height}
                />
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          {i < features.length - 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
          )}
        </div>
      ))}
    </section>
  );
}
