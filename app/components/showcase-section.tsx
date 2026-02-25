"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Maximize2, Sparkles } from "lucide-react";

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=1100&fit=crop&q=85",
    alt: "AI-generated majestic mountain landscape at sunrise",
    label: "Alpine Majesty",
    type: "image" as const,
    span: "col-span-2 row-span-2",
    style: "Landscape",
    prompt: "Majestic alpine peaks at golden hour",
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop&q=85",
    alt: "AI-generated artistic portrait with dramatic lighting",
    label: "Prismatic Portrait",
    type: "image" as const,
    span: "col-span-1 row-span-1",
    style: "Portrait",
    prompt: "Artistic portrait with prismatic light",
  },
  {
    src: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&h=600&fit=crop&q=85",
    alt: "AI-generated futuristic neon cityscape",
    label: "Neon Metropolis",
    type: "video" as const,
    span: "col-span-1 row-span-1",
    style: "Sci-Fi",
    prompt: "Cyberpunk city in neon rain",
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=800&fit=crop&q=85",
    alt: "AI-generated cosmic Earth visualization with data networks",
    label: "Digital Earth",
    type: "image" as const,
    span: "col-span-1 row-span-2",
    style: "Cosmic",
    prompt: "Earth from orbit with neural networks",
  },
  {
    src: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=600&h=600&fit=crop&q=85",
    alt: "AI-generated vibrant abstract color explosion",
    label: "Chromatic Burst",
    type: "image" as const,
    span: "col-span-1 row-span-1",
    style: "Abstract",
    prompt: "Explosion of iridescent pigments",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop&q=85",
    alt: "AI-generated mystical misty forest landscape",
    label: "Enchanted Forest",
    type: "image" as const,
    span: "col-span-1 row-span-1",
    style: "Nature",
    prompt: "Mystical forest with volumetric fog",
  },
];

export function ShowcaseSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="showcase" className="relative px-6 py-24">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Gallery
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See What&apos;s{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Possible
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Every image below was generated locally — no cloud, no API calls.
            From photorealistic landscapes to creative abstracts, explore what
            your GPU can create.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid auto-rows-[220px] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:auto-rows-[260px] lg:grid-cols-4">
          {gallery.map((item, index) => (
            <div
              key={item.src}
              className={`group relative overflow-hidden rounded-2xl ${item.span} cursor-pointer`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className={`object-cover transition-all duration-700 ${
                  hoveredIndex === index
                    ? "scale-110 brightness-110"
                    : "scale-100"
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Permanent subtle gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Video play icon */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all group-hover:scale-110 group-hover:bg-white/20 sm:h-14 sm:w-14">
                    <Play className="h-5 w-5 text-white ml-0.5 sm:h-6 sm:w-6" />
                  </div>
                </div>
              )}

              {/* Style tag - always visible */}
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-black/30 backdrop-blur-md px-3 py-1 text-[10px] font-medium text-white/90 border border-white/10 sm:text-xs">
                  {item.style}
                </span>
              </div>

              {/* Info overlay on hover */}
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0 sm:p-4">
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-white/50 font-mono truncate sm:text-xs">
                      &quot;{item.prompt}&quot;
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors sm:h-8 sm:w-8"
                    aria-label={`Expand ${item.label}`}
                  >
                    <Maximize2 className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary/50" />
          <span>
            All outputs generated locally with FLUX.2 Klein &amp; Lumina AI
          </span>
        </div>
      </div>
    </section>
  );
}
