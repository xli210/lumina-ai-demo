"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE, FACESTUDIO_V_LAUNCH, facestudioVHasEnded } from "@/lib/facestudio-v";
import {
  ArrowRight,
  Download,
  Play,
  Video,
} from "lucide-react";

interface HeroSlide {
  src: string;
  type: "image" | "video";
  alt: string;
  prompt: string;
  model: string;
  tag: string;
  poster?: string;
  /** Slide with its own left-aligned copy instead of the shared headline. */
  feature?: "facestudio-v";
}

const demoSlides: HeroSlide[] = [
  {
    src: "/videos/hero-facestudio-v.mp4",
    poster: "/videos/hero-facestudio-v-poster.jpg",
    type: "video",
    alt: "Nano FaceStudio-V Online: a scan line sweeps across a video and the woman's face is replaced with the reference face, everything else as filmed",
    prompt: "Video face swap: one face replaced, the rest as filmed. AI-generated test render on stock footage",
    model: FACESTUDIO_V_NAME,
    tag: "Video Face Swap",
    feature: "facestudio-v",
  },
  {
    src: "/videos/hero-faceswap.mp4",
    type: "video",
    alt: "Nano FaceStudio Pro — diffusion face swap demo (3600×1800)",
    prompt:
      "Diffusion identity stack — InstantID + PuLID + IP-Adapter FaceID — running locally on your GPU",
    model: "Nano FaceStudio Pro",
    tag: "AI Face Swap",
  },
  {
    src: "/videos/hero-1.mp4",
    type: "video",
    alt: "AI-generated cinematic video — ultra-realistic 4K",
    prompt: "Ultra-realistic cinematic scene, dramatic depth of field, 4k",
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
    alt: "AI-generated creative video — cinematic motion",
    prompt: "Creative cinematic motion with fluid camera work, atmospheric lighting",
    model: "Nano VideoGen",
    tag: "AI Video",
  },
  {
    src: "/images/showcase/hero-4.jpg",
    type: "image",
    alt: "AI-generated creative artwork",
    prompt: "Creative digital artwork with rich detail and vibrant composition, 4k",
    model: "Nano ImageEdit",
    tag: "AI Generation",
  },
];

const IMAGE_DURATION = 5000;

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [vEnded, setVEnded] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => setVEnded(facestudioVHasEnded()), []);

  const advance = useCallback(() => {
    setActiveSlide((s) => (s + 1) % demoSlides.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    const slide = demoSlides[activeSlide];
    if (slide.type === "video") {
      const vid = videoRefs.current[activeSlide];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
      return;
    }

    const tick = 50;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          advance();
          return 0;
        }
        return prev + (tick / IMAGE_DURATION) * 100;
      });
    }, tick);
    return () => clearInterval(timer);
  }, [activeSlide, advance]);

  const handleVideoEnd = useCallback(() => {
    advance();
  }, [advance]);

  const goToSlide = useCallback((i: number) => {
    setActiveSlide(i);
    setProgress(0);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex flex-col items-center overflow-hidden pt-16 sm:pt-20"
    >
      <div
        className="relative z-10 w-full opacity-0 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {demoSlides.map((slide, i) => (
            <div
              key={slide.src}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: activeSlide === i ? 1 : 0 }}
            >
              {slide.type === "video" ? (
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={slide.src}
                  poster={slide.poster}
                  preload={i === 0 ? "auto" : "metadata"}
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full overflow-hidden">
                  <div
                    className="relative h-full w-full"
                    style={{
                      transform: activeSlide === i ? "scale(1.12)" : "scale(1)",
                      transition: activeSlide === i
                        ? "transform 6s cubic-bezier(0.25, 0, 0.25, 1)"
                        : "none",
                    }}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      className="object-cover"
                      priority={i === 0}
                      sizes="100vw"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-1000"
            style={{ opacity: demoSlides[activeSlide].feature ? 0.1 : 1 }}
          />

          {/* Left-aligned copy for the Nano FaceStudio-V Online clip: its left quarter is left empty for this. */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center px-6 transition-opacity duration-1000 sm:px-10 lg:px-16"
            style={{ opacity: activeSlide === 0 ? 1 : 0 }}
            aria-hidden={activeSlide !== 0}
          >
            <div className="pointer-events-auto max-w-[46%] sm:max-w-[30%]">
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-300/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-sky-200 sm:mb-4 sm:text-xs">
                <Video className="h-3 w-3" />
                {vEnded ? "Preview ended · official release soon" : "Free 3-day preview"}
              </p>
              <p className="text-balance text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
                Swap one face in a video.
                <span className="block text-sky-200">Leave the rest as filmed.</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
                {!vEnded && (
                  <Link href={FACESTUDIO_V_LAUNCH} tabIndex={activeSlide === 0 ? 0 : -1}>
                    <Button size="sm" className="gap-1.5 rounded-full bg-white px-4 text-black hover:bg-neutral-100 sm:px-6">
                      Try it free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link
                  href={FACESTUDIO_V_PAGE}
                  tabIndex={activeSlide === 0 ? 0 : -1}
                  className="text-xs font-medium text-white/85 underline-offset-4 hover:text-white hover:underline sm:text-sm"
                >
                  See 14 examples
                </Link>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 transition-opacity duration-1000"
            style={{ opacity: activeSlide === 0 ? 0 : 1, pointerEvents: activeSlide === 0 ? "none" : "auto" }}
          >
            <h1 className="mb-6 text-balance text-center text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              A whole AI studio, right in your pocket
            </h1>
            <p className="mb-7 hidden max-w-2xl text-balance text-center text-sm text-white/85 sm:block sm:text-base md:text-lg">
              Face swap and photo editing in your browser, free to start. Or download the
              desktop apps and run everything offline on your own GPU.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/face-swap">
                <Button
                  size="lg"
                  className="group gap-2 rounded-full bg-white px-8 text-black shadow-lg hover:bg-neutral-100 hover:shadow-xl transition-all"
                >
                  <Play className="h-4 w-4" />
                  Try Face Swap Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/image-edit">
                <Button
                  variant="outline"
                  size="lg"
                  className="group gap-2 rounded-full px-8 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  Edit a Photo with AI
                </Button>
              </Link>
              <Link
                href="/download"
                className="hidden items-center gap-2 text-sm font-medium text-white/85 underline-offset-4 hover:text-white hover:underline sm:inline-flex"
              >
                <Download className="h-4 w-4" />
                Download desktop apps
              </Link>
            </div>
          </div>

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
                      style={{ width: `${demoSlides[activeSlide].type === "video" ? 100 : progress}%` }}
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
