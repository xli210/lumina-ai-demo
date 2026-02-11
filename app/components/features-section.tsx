"use client";

import { useState } from "react";
import {
  Sparkles,
  Film,
  Palette,
  Zap,
  Shield,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Image Generation",
    description:
      "Create stunning, photorealistic images from text descriptions. Our AI understands artistic styles, lighting, and composition.",
    gradient: "from-blue-500 to-cyan-400",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: Film,
    title: "Video Creation",
    description:
      "Generate cinematic video clips with smooth motion and incredible detail. From nature scenes to abstract art in motion.",
    gradient: "from-purple-500 to-pink-400",
    shadowColor: "shadow-purple-500/20",
  },
  {
    icon: Palette,
    title: "100+ Style Presets",
    description:
      "Choose from over 100 curated styles including oil painting, watercolor, cyberpunk, anime, and photographic realism.",
    gradient: "from-orange-500 to-yellow-400",
    shadowColor: "shadow-orange-500/20",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get results in seconds, not minutes. Our optimized pipeline delivers high-quality outputs with minimal wait time.",
    gradient: "from-yellow-400 to-green-400",
    shadowColor: "shadow-yellow-500/20",
  },
  {
    icon: Shield,
    title: "Commercial License",
    description:
      "Every creation is yours to use commercially. No restrictions on how you use your AI-generated content.",
    gradient: "from-green-500 to-emerald-400",
    shadowColor: "shadow-green-500/20",
  },
  {
    icon: Download,
    title: "HD Export",
    description:
      "Export your creations in up to 4K resolution. Perfect for print, social media, presentations, and professional work.",
    gradient: "from-cyan-500 to-blue-400",
    shadowColor: "shadow-cyan-500/20",
  },
];

export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="features" className="relative px-6 py-24">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Create
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Professional-grade AI creative tools, designed to be simple enough
            for anyone and powerful enough for professionals.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl glass p-8 transition-all duration-500 hover:scale-[1.03] ${
                hoveredIndex === index ? `shadow-xl ${feature.shadowColor}` : ""
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
                  background: `linear-gradient(135deg, transparent 40%, hsl(215, 100%, 55%) 100%)`,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                  borderRadius: "1rem",
                }}
              />

              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-all duration-500 ${
                  hoveredIndex === index
                    ? `${feature.shadowColor} shadow-xl scale-110`
                    : "shadow-md"
                }`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
