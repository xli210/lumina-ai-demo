"use client";

import { useState } from "react";
import { Crown, ShieldCheck, CreditCard, Wrench } from "lucide-react";

const advantages = [
  {
    icon: Crown,
    title: "Best-in-Class Local AI",
    description:
      "Run the same cutting-edge models used by cloud services — directly on your GPU. No quality compromise, no latency, no rate limits.",
    highlight: "Studio-grade output",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: ShieldCheck,
    title: "No SaaS. No Privacy Risk.",
    description:
      "Your data never leaves your machine. No cloud uploads, no API keys, no third-party access. Complete creative control with zero exposure.",
    highlight: "100% offline processing",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: CreditCard,
    title: "One-Time Purchase. Own Forever.",
    description:
      "No subscriptions, no credits, no usage caps. Pay once and get lifetime access with all future updates included. Your tools, your terms.",
    highlight: "Zero recurring cost",
    gradient: "from-blue-500 to-indigo-400",
  },
  {
    icon: Wrench,
    title: "Build Your Own AI Toolkit",
    description:
      "Pick exactly the AI tools you need — image generation, video creation, face swap, enhancement, virtual try-on. Mix and match for your workflow.",
    highlight: "Modular by design",
    gradient: "from-violet-500 to-purple-400",
  },
];

export function DemoSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="demo" className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Why NanoPocket
          </p>
          <h2 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Professional AI.{" "}
            <span className="bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
              No Compromises.
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Everything cloud AI offers — without the cloud. Full power, full
            privacy, full ownership.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {advantages.map((item, index) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl glass p-8 transition-all duration-500 sm:p-10 ${
                hoveredIndex === index
                  ? "scale-[1.02] shadow-xl shadow-primary/10"
                  : ""
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                }}
              />

              <div className="relative">
                <div className="mb-5 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                    {item.highlight}
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
