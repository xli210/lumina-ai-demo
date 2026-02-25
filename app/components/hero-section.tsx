"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Sparkles, Shield, Cpu } from "lucide-react";

const showcaseImages = [
  {
    src: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=1000&fit=crop&q=85",
    alt: "AI-generated surreal landscape with dramatic lighting",
    prompt: '"Surreal alpine valley at golden hour, cinematic"',
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop&q=85",
    alt: "AI-generated artistic portrait with vibrant colors",
    prompt: '"Artistic portrait with prismatic light effects"',
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=1000&fit=crop&q=85",
    alt: "AI-generated cosmic visualization of Earth",
    prompt: '"Earth from orbit with aurora and city lights"',
  },
  {
    src: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=1000&fit=crop&q=85",
    alt: "AI-generated abstract fluid art",
    prompt: '"Abstract fluid dynamics in iridescent colors"',
  },
];

export function HeroSection() {
  const [activeImage, setActiveImage] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % showcaseImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16"
    >
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/3 -left-1/3 h-[800px] w-[800px] rounded-full opacity-30 blur-[120px] animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, hsl(215, 100%, 55%) 0%, transparent 70%)",
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute -right-1/4 top-1/4 h-[600px] w-[600px] rounded-full opacity-20 blur-[100px] animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, hsl(280, 80%, 55%) 0%, transparent 70%)",
            animationDelay: "2s",
            transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute -bottom-1/4 left-1/3 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px] animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, hsl(170, 80%, 50%) 0%, transparent 70%)",
            animationDelay: "4s",
          }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
        {/* Text content */}
        <div className="flex max-w-xl flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2 text-sm text-muted-foreground animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary animate-spin-slow" />
            <span>Local AI Creative Suite</span>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Shield className="h-3 w-3" /> Private
            </span>
          </div>

          <h1
            className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground opacity-0 animate-fade-in sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            Create Beyond{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Imagination
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary via-purple-400 to-cyan-400 opacity-50 blur-sm" />
            </span>
          </h1>

          <p
            className="mb-8 max-w-md text-pretty text-base leading-relaxed text-muted-foreground opacity-0 animate-fade-in sm:text-lg"
            style={{ animationDelay: "0.2s" }}
          >
            Generate stunning images, extract text from any document, and unleash
            AI creativity — all running{" "}
            <span className="font-medium text-foreground">100% locally</span> on
            your machine. No cloud. No data leaves your computer.
          </p>

          <div
            className="flex flex-col items-center gap-3 opacity-0 animate-fade-in sm:flex-row sm:gap-4"
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
            <Link href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="group gap-2 rounded-full px-8 bg-transparent backdrop-blur-sm hover:bg-accent/50 transition-all"
              >
                <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-6 opacity-0 animate-fade-in sm:gap-8 lg:justify-start"
            style={{ animationDelay: "0.4s" }}
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
        </div>

        {/* Showcase image carousel */}
        <div
          className="relative w-full max-w-sm flex-1 opacity-0 animate-fade-in sm:max-w-md"
          style={{ animationDelay: "0.3s" }}
        >
          <div
            className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-3xl glass-strong shadow-2xl shadow-primary/10"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 0.1}deg) rotateX(${mousePos.y * -0.1}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            {showcaseImages.map((img, i) => (
              <div
                key={img.src}
                className="absolute inset-0 transition-all duration-1000"
                style={{
                  opacity: activeImage === i ? 1 : 0,
                  transform:
                    activeImage === i ? "scale(1)" : "scale(1.05)",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 448px"
                />
              </div>
            ))}

            {/* Prompt overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16 sm:p-6 sm:pt-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/60 font-mono">
                  flux-klein v1.0
                </span>
              </div>
              <p className="text-xs text-white/80 font-mono sm:text-sm">
                {showcaseImages[activeImage].prompt}
              </p>
              <div className="mt-3 flex gap-1.5">
                {showcaseImages.map((_, i) => (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      activeImage === i
                        ? "w-8 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Show image ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating accent elements */}
          <div
            className="absolute -top-4 -right-4 h-20 w-20 rounded-2xl glass animate-float border border-white/10 sm:-top-6 sm:-right-6 sm:h-24 sm:w-24"
            style={{
              transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary/40 sm:h-8 sm:w-8" />
            </div>
          </div>
          <div
            className="absolute -bottom-6 -left-6 h-16 w-16 rounded-2xl glass animate-float border border-white/10 sm:-bottom-8 sm:-left-8 sm:h-20 sm:w-20"
            style={{
              animationDelay: "3s",
              transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <Cpu className="h-5 w-5 text-cyan-400/40 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
