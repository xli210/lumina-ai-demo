"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

const gallery = [
  {
    src: "/images/showcase/gallery-1-lg.jpg",
    alt: "AI-generated digital artwork — Nano ImageEdit",
    label: "AI Art Generation",
    span: "md:col-span-2 md:row-span-2",
    style: "Nano ImageEdit",
    prompt: "Vibrant digital artwork with intricate details, 8k",
  },
  {
    src: "/images/showcase/gallery-2-sq.jpg",
    alt: "AI-enhanced portrait — sharp detail restoration",
    label: "Portrait Enhancement",
    span: "",
    style: "Nano ImageEnh",
    prompt: "AI upscale and detail recovery, natural skin tones",
  },
  {
    src: "/images/showcase/gallery-3-sq.jpg",
    alt: "Architecture with AI style transfer applied",
    label: "Style Transfer",
    span: "",
    style: "Style Transfer",
    prompt: "Architectural photography with artistic style overlay",
  },
  {
    src: "/images/showcase/gallery-4-tall.jpg",
    alt: "Dramatic ocean scene — AI color grading and enhancement",
    label: "Color Enhancement",
    span: "row-span-2",
    style: "Nano ImageEnh",
    prompt: "Cinematic color grading applied to ocean photography",
  },
  {
    src: "/images/showcase/gallery-5-sq.jpg",
    alt: "Urban cityscape — AI-generated from text prompt",
    label: "City Generation",
    span: "",
    style: "Nano ImageEdit",
    prompt: "Urban cityscape with dramatic lighting, photorealistic",
  },
  {
    src: "/images/showcase/gallery-8-wide.jpg",
    alt: "Mountain landscape — AI upscaled to 4K detail",
    label: "Landscape Upscale",
    span: "md:col-span-2",
    style: "Nano ImageEnh",
    prompt: "4K mountain panorama, AI detail enhancement",
  },
  {
    src: "/images/showcase/gallery-6-sq.jpg",
    alt: "Neon abstract scene — AI creative generation",
    label: "Neon Dreamscape",
    span: "",
    style: "Nano ImageEdit",
    prompt: "Neon-lit abstract scene, cinematic mood, 4k",
  },
  {
    src: "/images/showcase/gallery-7-sq.jpg",
    alt: "Botanical close-up — AI detail enhancement",
    label: "Macro Detail",
    span: "",
    style: "Nano ImageEnh",
    prompt: "Botanical macro with AI sharpening and color boost",
  },
  {
    src: "/images/showcase/gallery-9-sq.jpg",
    alt: "Abstract art — AI color and texture generation",
    label: "Abstract Creation",
    span: "",
    style: "Nano ImageEdit",
    prompt: "Abstract fluid art with vivid gradients, high detail",
  },
  {
    src: "/images/showcase/gallery-10-wide.jpg",
    alt: "Night sky — AI noise reduction and star enhancement",
    label: "Astrophotography",
    span: "md:col-span-2",
    style: "Nano ImageEnh",
    prompt: "Milky Way with AI denoising, enhanced star clarity",
  },
];

export function ShowcaseSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="showcase" className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Gallery
          </p>
          <h2 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See What&apos;s{" "}
            <span className="bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
              Possible
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-base text-muted-foreground sm:text-lg">
            From AI-generated art to photo enhancement and style transfer —
            every result below was created locally using NanoPocket tools.
          </p>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:gap-4 md:grid-cols-4 lg:auto-rows-[220px]">
          {gallery.map((item, index) => (
            <div
              key={item.src}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${item.span}`}
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

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-black/30 backdrop-blur-md px-3 py-1 text-[10px] font-medium text-white/90 border border-white/10 sm:text-xs">
                  {item.style}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0 sm:p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-white/50 font-mono truncate sm:text-xs">
                    &quot;{item.prompt}&quot;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary/50" />
          <span>
            All outputs created locally with NanoPocket generative AI tools
          </span>
        </div>
      </div>
    </section>
  );
}
