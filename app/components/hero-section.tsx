"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Download,
  Play,
} from "lucide-react";

interface HeroSlide {
  src: string;
  type: "image" | "video";
  alt: string;
  prompt: string;
  model: string;
  tag: string;
}

const demoSlides: HeroSlide[] = [
  {
    src: "/videos/hero-1.mp4",
    type: "video",
    alt: "AI-generated cinematic landscape — sweeping vista",
    prompt: "Cinematic landscape with sweeping camera movement, dramatic lighting, 4k",
    model: "Nano VideoGen",
    tag: "AI Video",
  },
  {
    src: "/images/showcase/hero-2.jpg",
    type: "image",
    alt: "Dramatic mountain landscape — AI enhanced to 4K",
    prompt: "Majestic mountain peak with golden hour lighting, ultra-detailed, 8k",
    model: "Nano ImageEnh",
    tag: "AI Enhancement",
  },
  {
    src: "/videos/hero-2.mp4",
    type: "video",
    alt: "AI-generated cinematic scene — dramatic atmosphere",
    prompt: "Dramatic cinematic scene with volumetric lighting, smooth dolly shot, 4k",
    model: "Nano VideoGen",
    tag: "AI Video",
  },
  {
    src: "/images/showcase/hero-4.jpg",
    type: "image",
    alt: "Milky Way night sky — AI denoised and star-enhanced",
    prompt: "Milky Way galaxy with AI noise reduction and star clarity boost, 4k",
    model: "Nano ImageEnh",
    tag: "AI Enhancement",
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const SLIDE_DURATION = 5000;

  /* Auto-advance slides with progress bar */
  useEffect(() => {
    const tick = 50; // 50ms intervals
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((s) => (s + 1) % demoSlides.length);
          return 0;
        }
        return prev + (tick / SLIDE_DURATION) * 100;
      });
    }, tick);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = useCallback((i: number) => {
    setActiveSlide(i);
    setProgress(0);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex flex-col items-center overflow-hidden px-6 pt-28 pb-8 sm:pt-32 sm:pb-12"
    >
      {/* ── Centered headline ── */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1
          className="mb-8 text-balance text-3xl font-bold leading-[1.15] tracking-tight text-foreground opacity-0 animate-fade-in sm:text-4xl md:text-5xl"
          style={{ animationDelay: "0.1s" }}
        >
          A whole AI studio, right in your pocket
        </h1>

        <div
          className="flex flex-wrap items-center justify-center gap-3 opacity-0 animate-fade-in sm:gap-4"
          style={{ animationDelay: "0.2s" }}
        >
          <Link href="/download">
            <Button
              size="lg"
              className="group gap-2 rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Download className="h-4 w-4" />
              Download Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/#demo">
            <Button
              variant="outline"
              size="lg"
              className="group gap-2 rounded-full px-8 bg-transparent backdrop-blur-sm hover:bg-accent/50 transition-all"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Large cinematic demo area (Runway-style video hero) ── */}
      <div
        className="relative z-10 mx-auto mt-12 w-full max-w-6xl opacity-0 animate-fade-in sm:mt-16"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary/10 sm:rounded-3xl">
          {/* Slides */}
          {demoSlides.map((slide, i) => (
            <div
              key={slide.src}
              className="absolute inset-0 transition-all duration-1000"
              style={{
                opacity: activeSlide === i ? 1 : 0,
                transform:
                  activeSlide === i ? "scale(1)" : "scale(1.03)",
              }}
            >
              {slide.type === "video" ? (
                <video
                  src={slide.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 1152px"
                />
              )}
            </div>
          ))}

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />


          {/* Top-left: model & tag badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 sm:top-6 sm:left-6">
            <span className="rounded-full bg-primary/80 backdrop-blur-md px-3 py-1 text-[10px] font-semibold text-white sm:text-xs">
              {demoSlides[activeSlide].model}
            </span>
            <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-medium text-white/80 border border-white/10 sm:text-xs">
              {demoSlides[activeSlide].tag}
            </span>
          </div>

          {/* Bottom prompt bar — mimics a "generation in progress" terminal */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider sm:text-xs">
                  Prompt
                </span>
              </div>
              <p className="text-xs text-white/90 font-mono leading-relaxed sm:text-sm">
                {demoSlides[activeSlide].prompt}
              </p>
            </div>
          </div>
        </div>

        {/* Progress dots / slide selector */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {demoSlides.map((slide, i) => (
            <button
              key={`dot-${slide.src}`}
              type="button"
              onClick={() => goToSlide(i)}
              className="group relative h-1 overflow-hidden rounded-full bg-white/10 transition-all"
              style={{ width: activeSlide === i ? 48 : 12 }}
              aria-label={`Go to slide ${i + 1}`}
            >
              {activeSlide === i && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

    </section>
  );
}
