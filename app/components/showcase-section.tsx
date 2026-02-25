"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Maximize2, Sparkles } from "lucide-react";

const gallery = [
  {
    src: "/images/showcase/gallery-1-lg.jpg",
    width: 1000,
    height: 1250,
    alt: "AI-generated cosmic nebula with vibrant purple and blue hues",
    label: "Cosmic Dreamscape",
    type: "image" as const,
    span: "col-span-2 row-span-2",
    style: "Cosmic",
    prompt: "Deep space nebula, star formation, vibrant colors",
  },
  {
    src: "/images/showcase/gallery-2-sq.jpg",
    width: 800,
    height: 800,
    alt: "AI-generated futuristic neon tunnel with perspective",
    label: "Neon Corridor",
    type: "video" as const,
    span: "col-span-1 row-span-1",
    style: "Sci-Fi",
    prompt: "Futuristic neon tunnel with depth, cinematic",
  },
  {
    src: "/images/showcase/gallery-3-sq.jpg",
    width: 800,
    height: 800,
    alt: "AI-generated liquid glass morphism in gradient colors",
    label: "Liquid Glass",
    type: "image" as const,
    span: "col-span-1 row-span-1",
    style: "Abstract",
    prompt: "Liquid glass with iridescent gradient, 4k",
  },
  {
    src: "/images/showcase/gallery-4-tall.jpg",
    width: 800,
    height: 1000,
    alt: "AI-generated vibrant neon cityscape at night",
    label: "Neon Metropolis",
    type: "image" as const,
    span: "col-span-1 row-span-2",
    style: "Cyberpunk",
    prompt: "Cyberpunk city, neon rain, night atmosphere",
  },
  {
    src: "/images/showcase/gallery-5-sq.jpg",
    width: 800,
    height: 800,
    alt: "AI-generated digital matrix code visualization",
    label: "Digital Matrix",
    type: "image" as const,
    span: "col-span-1 row-span-1",
    style: "Data Art",
    prompt: "Matrix data streams, green on black, cinematic",
  },
  {
    src: "/images/showcase/gallery-6-sq.jpg",
    width: 800,
    height: 800,
    alt: "AI-generated vibrant color explosion and paint splash",
    label: "Chromatic Burst",
    type: "video" as const,
    span: "col-span-1 row-span-1",
    style: "Abstract",
    prompt: "Explosion of iridescent pigment in slow motion",
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

      {/* ── Constrained container so text & grid feel balanced ── */}
      <div className="relative mx-auto max-w-6xl">
        {/* Header — wider text area */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Gallery
          </p>
          <h2 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See What&apos;s{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Possible
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-base text-muted-foreground sm:text-lg">
            Every image below was generated locally — no cloud, no API calls.
            From photorealistic landscapes to creative abstracts, explore what
            your GPU can create.
          </p>
        </div>

        {/* Bento Grid — narrower (max-w-6xl) so it matches the text width */}
        <div className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 md:grid-cols-3 lg:auto-rows-[240px] lg:grid-cols-4">
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

              {/* Style tag */}
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
