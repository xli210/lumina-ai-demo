"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Maximize2 } from "lucide-react";

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&h=1000&fit=crop&q=80",
    alt: "AI cosmic landscape",
    label: "Cosmic Dreamscape",
    type: "image" as const,
    span: "col-span-2 row-span-2" as const,
    style: "Photorealistic",
  },
  {
    src: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&h=600&fit=crop&q=80",
    alt: "AI neon cityscape",
    label: "Neon Metropolis",
    type: "video" as const,
    span: "col-span-1 row-span-1" as const,
    style: "Cinematic",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop&q=80",
    alt: "AI abstract art",
    label: "Liquid Glass Portrait",
    type: "image" as const,
    span: "col-span-1 row-span-1" as const,
    style: "Abstract",
  },
  {
    src: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=800&fit=crop&q=80",
    alt: "AI futuristic scene",
    label: "Neo Tokyo 2099",
    type: "image" as const,
    span: "col-span-1 row-span-2" as const,
    style: "Cyberpunk",
  },
  {
    src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&h=600&fit=crop&q=80",
    alt: "AI fluid art",
    label: "Marble Dreamflow",
    type: "image" as const,
    span: "col-span-1 row-span-1" as const,
    style: "Oil Painting",
  },
  {
    src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=600&fit=crop&q=80",
    alt: "AI gradient art",
    label: "Crystal Depths",
    type: "video" as const,
    span: "col-span-1 row-span-1" as const,
    style: "Motion Art",
  },
];

export function ShowcaseSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="showcase" className="relative px-6 py-24">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Showcase
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See What Lumina Can{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Create
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            From photorealistic portraits to cinematic video scenes — explore the
            boundless possibilities of AI-powered creativity.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid auto-rows-[240px] grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                  hoveredIndex === index ? "scale-110 brightness-110" : "scale-100"
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Video play icon */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all group-hover:scale-110 group-hover:bg-white/20">
                    <Play className="h-6 w-6 text-white ml-0.5" />
                  </div>
                </div>
              )}

              {/* Style tag - always visible */}
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-black/30 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/90 border border-white/10">
                  {item.style}
                </span>
              </div>

              {/* Info overlay on hover */}
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-white/60 capitalize">
                      AI {item.type} generation
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
