"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const showcaseImages = [
  { src: "/images/hero-showcase-1.svg", alt: "AI-generated cosmic landscape" },
  { src: "/images/hero-showcase-2.svg", alt: "AI-generated glass portrait" },
  { src: "/images/hero-showcase-3.svg", alt: "AI-generated futuristic city" },
  { src: "/images/hero-showcase-4.svg", alt: "AI-generated fluid art" },
];

export function HeroSection() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % showcaseImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row lg:gap-20">
        {/* Text content */}
        <div className="flex max-w-xl flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2 text-sm text-muted-foreground animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Creative Studio</span>
          </div>

          <h1
            className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight text-foreground opacity-0 animate-fade-in md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            Create Beyond{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Imagination
            </span>
          </h1>

          <p
            className="mb-8 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Transform your ideas into stunning visuals. Generate breathtaking
            images and cinematic videos with the power of AI, right from your
            phone.
          </p>

          <div
            className="flex flex-wrap items-center gap-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="#pricing">
              <Button size="lg" className="gap-2 rounded-full px-8">
                Get Lumina AI
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#showcase">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-8 bg-transparent"
              >
                <Play className="h-4 w-4" />
                See It in Action
              </Button>
            </Link>
          </div>

          {/* App store badges */}
          <div
            className="mt-8 flex items-center gap-3 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl glass-subtle px-4 py-2.5 text-foreground transition-all hover:scale-105"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight text-muted-foreground">
                  Download on the
                </span>
                <span className="text-sm font-semibold leading-tight">
                  App Store
                </span>
              </div>
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl glass-subtle px-4 py-2.5 text-foreground transition-all hover:scale-105"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.497-.697L2.51 14.88 2 12c0-.305.05-.604.14-.89l.61-6.608c.094-.25.23-.477.41-.688l.45-.001zm.786-.612L14.63 11.157l2.878-2.878-10.84-6.255a2.375 2.375 0 0 0-2.273-.822zM18.73 8.992l-2.88 2.88 2.88 2.88 2.584-1.493a2.375 2.375 0 0 0 0-4.274L18.73 8.992zM14.63 12.843L4.395 22.798a2.375 2.375 0 0 0 2.273-.822l10.84-6.255-2.878-2.878z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight text-muted-foreground">
                  Get it on
                </span>
                <span className="text-sm font-semibold leading-tight">
                  Google Play
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Showcase image carousel */}
        <div
          className="relative flex-1 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl glass-strong">
            {showcaseImages.map((img, i) => (
              <div
                key={img.src}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: activeImage === i ? 1 : 0 }}
              >
                <Image
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 448px"
                />
              </div>
            ))}

            {/* Glass overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 glass-strong p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Generated with Lumina AI
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {showcaseImages[activeImage].alt}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {showcaseImages.map((_, i) => (
                    <button
                      key={`dot-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: dots are static
                        i
                      }`}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImage === i
                          ? "w-6 bg-primary"
                          : "w-1.5 bg-muted-foreground/40"
                      }`}
                      aria-label={`Show image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating accent elements */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-2xl glass animate-float" />
          <div
            className="absolute -bottom-6 -left-6 h-20 w-20 rounded-2xl glass animate-float"
            style={{ animationDelay: "3s" }}
          />
        </div>
      </div>
    </section>
  );
}
