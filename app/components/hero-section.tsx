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
    alt: "AI-enhanced portrait with vivid detail and clarity",
    prompt: "High-fidelity portrait with AI sharpening and color enhancement, 4k",
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
      className="relative flex flex-col items-center overflow-hidden pt-16 sm:pt-20"
    >
      {/* ── Full-width cinematic demo with slogan overlay ── */}
      <div
        className="relative z-10 w-full opacity-0 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
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
                  sizes="100vw"
                />
              )}
            </div>
          ))}

          <div className="absolute inset-0 bg-black/40" />

          {/* Slogan centered on the video/image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <h1 className="mb-6 text-balance text-center text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              A whole AI studio, right in your pocket
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/download">
                <Button
                  size="lg"
                  className="group gap-2 rounded-full bg-white px-8 text-black shadow-lg hover:bg-neutral-100 hover:shadow-xl transition-all"
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
                  className="group gap-2 rounded-full px-8 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom progress bar */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="flex items-center justify-center gap-2">
              {demoSlides.map((slide, i) => (
                <button
                  key={`dot-${slide.src}`}
                  type="button"
                  onClick={() => goToSlide(i)}
                  className="group relative h-1 overflow-hidden rounded-full bg-white/20 transition-all"
                  style={{ width: activeSlide === i ? 48 : 12 }}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {activeSlide === i && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-white transition-none"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
