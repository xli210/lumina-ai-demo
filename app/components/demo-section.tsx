"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, FileText, Wand2, Play } from "lucide-react";

/* ── Each tab represents a product capability ── */
const demos = [
  {
    id: "image-gen",
    icon: ImagePlus,
    label: "Image Generation",
    headline: "From Text to Stunning Visuals",
    description:
      "Type a prompt, and Nano ImageEdit generates a high-resolution image in seconds — entirely on your local GPU. No internet, no cloud, no waiting in queues.",
    image: "/images/showcase/gallery-1-lg.jpg",
    imageAlt: "Nano ImageEdit generating cosmic nebula from text prompt",
    prompt: '"Cosmic nebula with vivid purple and blue, stellar dust, 8k"',
    model: "Nano ImageEdit",
    badge: "Text → Image",
  },
  {
    id: "ocr",
    icon: FileText,
    label: "Text Recognition",
    headline: "Extract Text from Anything",
    description:
      "Point OCR Demo at any image, scanned document, or screenshot — it reads the text instantly. Supports multiple languages, tables, and handwriting. All processing happens locally.",
    image: "/images/showcase/gallery-5-sq.jpg",
    imageAlt: "OCR Demo extracting text from a document image",
    prompt: "Scanning document → extracting structured text data",
    model: "OCR Demo · PaddleOCR",
    badge: "Image → Text",
  },
  {
    id: "creative",
    icon: Wand2,
    label: "Creative Studio",
    headline: "Your Complete AI Toolkit",
    description:
      "Lumina AI combines image generation, video creation, and 100+ style presets in a single desktop app. One-click launch, no setup — just double-click and start creating.",
    image: "/images/showcase/gallery-6-sq.jpg",
    imageAlt: "Lumina AI creative studio with multiple AI tools",
    prompt: '"Iridescent paint explosion in slow motion, macro, 4k"',
    model: "Lumina AI · v3.2",
    badge: "All-in-One",
  },
];

export function DemoSection() {
  const [activeTab, setActiveTab] = useState(0);
  const current = demos[activeTab];

  return (
    <section id="demo" className="relative px-6 py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            See It In Action
          </p>
          <h2 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Powerful AI Tools.{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Running Locally.
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Each tool runs entirely on your machine — no cloud dependency, no
            rate limits. See how they work.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {demos.map((demo, i) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all sm:px-6 sm:py-3 ${
                activeTab === i
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "glass-subtle text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <demo.icon className="h-4 w-4" />
              {demo.label}
            </button>
          ))}
        </div>

        {/* Demo content area — large 16:9 with side panel */}
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Demo image / video area — 3 cols */}
          <div className="relative lg:col-span-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-xl sm:rounded-3xl">
              {demos.map((demo, i) => (
                <div
                  key={demo.id}
                  className="absolute inset-0 transition-all duration-700"
                  style={{
                    opacity: activeTab === i ? 1 : 0,
                    transform:
                      activeTab === i ? "scale(1)" : "scale(1.03)",
                  }}
                >
                  <Image
                    src={demo.image}
                    alt={demo.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              ))}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 transition-all hover:scale-110 hover:bg-white/20 cursor-pointer sm:h-16 sm:w-16">
                  <Play className="h-6 w-6 text-white ml-0.5 sm:h-7 sm:w-7" />
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                <span className="rounded-full bg-primary/80 backdrop-blur-md px-3 py-1 text-[10px] font-semibold text-white sm:text-xs">
                  {current.badge}
                </span>
              </div>

              {/* Bottom prompt bar */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                <div className="rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider sm:text-[10px]">
                      {current.model}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 font-mono sm:text-xs">
                    {current.prompt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description panel — 2 cols */}
          <div className="flex flex-col justify-center lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg">
                <current.icon className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {current.badge}
              </span>
            </div>

            <h3 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
              {current.headline}
            </h3>

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {current.description}
            </p>

            {/* Feature bullets */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-muted-foreground">
                  Runs on your local GPU
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="text-sm text-muted-foreground">
                  No internet required after setup
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span className="text-sm text-muted-foreground">
                  Free license included
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
