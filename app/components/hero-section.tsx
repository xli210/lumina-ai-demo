"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Download,
  Sparkles,
  Shield,
  Cpu,
  Play,
} from "lucide-react";

/* ── Hero demo slides — each one simulates a "live generation" ── */
const demoSlides = [
  {
    src: "/images/showcase/hero-1.jpg",
    alt: "AI-generated deep space galaxy",
    prompt: "Deep space nebula with stellar nursery, ultra-realistic, 8k",
    model: "FLUX.2 Klein",
    tag: "Text → Image",
  },
  {
    src: "/images/showcase/hero-2.jpg",
    alt: "AI-generated double-exposure portrait",
    prompt: "Double exposure portrait, city skyline silhouette overlay, golden hour",
    model: "FLUX.2 Klein",
    tag: "Portrait",
  },
  {
    src: "/images/showcase/hero-3.jpg",
    alt: "AI-generated aurora borealis scene",
    prompt: "Aurora borealis dancing over volcanic landscape, long exposure, cinematic",
    model: "Lumina AI",
    tag: "Landscape",
  },
  {
    src: "/images/showcase/hero-4.jpg",
    alt: "AI-generated geometric light art",
    prompt: "Prisms refracting white light into spectrum, minimalist, dark bg",
    model: "FLUX.2 Klein",
    tag: "Abstract",
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
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/3 left-1/4 h-[700px] w-[700px] rounded-full opacity-25 blur-[120px] animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, hsl(215, 100%, 55%) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/4 -right-1/4 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px] animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, hsl(280, 80%, 55%) 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ── Centered headline (Runway-style) ── */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2 text-sm text-muted-foreground animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary animate-spin-slow" />
          <span>Local AI Creative Suite</span>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" /> 100% Private
          </span>
        </div>

        <h1
          className="mb-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground opacity-0 animate-fade-in sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          Create Beyond{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Imagination
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary via-purple-400 to-cyan-400 opacity-50 blur-sm" />
          </span>
        </h1>

        <p
          className="mx-auto mb-7 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground opacity-0 animate-fade-in sm:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          Generate stunning images, extract text from documents, and unleash AI
          creativity — all running{" "}
          <span className="font-medium text-foreground">100% locally</span> on
          your machine. No cloud. No data ever leaves your computer.
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-3 opacity-0 animate-fade-in sm:gap-4"
          style={{ animationDelay: "0.3s" }}
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
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 1152px"
              />
            </div>
          ))}

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

          {/* Play button center (for future video) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 transition-all hover:scale-110 hover:bg-white/20 cursor-pointer sm:h-20 sm:w-20">
              <Play className="h-7 w-7 text-white ml-1 sm:h-8 sm:w-8" />
            </div>
          </div>

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

      {/* ── Trust badges row ── */}
      <div
        className="relative z-10 mx-auto mt-10 flex flex-wrap items-center justify-center gap-6 opacity-0 animate-fade-in sm:mt-12 sm:gap-10"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              100% Offline
            </span>
            <span className="text-xs text-muted-foreground">
              Your data stays local
            </span>
          </div>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <Cpu className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              GPU Accelerated
            </span>
            <span className="text-xs text-muted-foreground">
              Fast local inference
            </span>
          </div>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
            <Download className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Free to Start
            </span>
            <span className="text-xs text-muted-foreground">
              No subscription needed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
