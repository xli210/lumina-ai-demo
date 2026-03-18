"use client";

import { useState } from "react";
import {
  Sparkles,
  Shield,
  Cpu,
  Zap,
  HardDrive,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "State-of-the-Art Models",
    description:
      "Run the latest AI models locally — Nano ImageEdit for image generation, Nano VideoGen for video creation, face swap, enhancement, and more.",
    gradient: "from-blue-500 to-blue-400",
    shadowColor: "shadow-blue-500/15",
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description:
      "Your data never leaves your machine. No cloud uploads, no API calls, no tracking. What you create stays yours.",
    gradient: "from-primary to-blue-400",
    shadowColor: "shadow-slate-500/15",
  },
  {
    icon: Cpu,
    title: "GPU Accelerated",
    description:
      "Leverages your NVIDIA GPU for fast inference. Supports CUDA with automatic VRAM management and streaming for lower-end cards.",
    gradient: "from-primary to-blue-400",
    shadowColor: "shadow-blue-600/15",
  },
  {
    icon: Zap,
    title: "One-Click Launch",
    description:
      "No terminal commands, no Python setup. Double-click to launch. The app handles model downloads, activation, and updates automatically.",
    gradient: "from-primary to-blue-400",
    shadowColor: "shadow-sky-500/15",
  },
  {
    icon: HardDrive,
    title: "Works Offline",
    description:
      "After the initial model download, everything runs without internet. Perfect for air-gapped environments and field work.",
    gradient: "from-primary to-blue-400",
    shadowColor: "shadow-slate-500/15",
  },
  {
    icon: RefreshCw,
    title: "Free Updates Forever",
    description:
      "Every license includes lifetime updates. As we add new models and features, you get them — no extra cost, no subscription.",
    gradient: "from-primary to-blue-400",
    shadowColor: "shadow-blue-500/15",
  },
];

export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="features" className="relative px-6 py-24">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Why Local AI
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Your Machine. Your AI.
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            No cloud fees, no rate limits, no data sharing. Professional-grade
            AI tools that run entirely on your hardware.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl glass p-6 transition-all duration-500 hover:scale-[1.02] sm:p-8 sm:hover:scale-[1.03] ${
                hoveredIndex === index
                  ? `shadow-xl ${feature.shadowColor}`
                  : ""
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradient border effect on hover */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ${
                  hoveredIndex === index ? "opacity-100" : ""
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, transparent 40%, hsl(220, 70%, 58%) 100%)",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                  borderRadius: "1rem",
                }}
              />

              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-all duration-500 sm:mb-5 sm:h-14 sm:w-14 ${
                  hoveredIndex === index
                    ? `${feature.shadowColor} shadow-xl scale-110`
                    : "shadow-md"
                }`}
              >
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground sm:text-lg">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
