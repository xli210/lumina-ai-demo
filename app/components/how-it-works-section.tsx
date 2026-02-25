"use client";

import { useState } from "react";
import { Download, KeyRound, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Download the App",
    description:
      "Pick the AI tool you need — image generation, OCR, or video. Download the installer and extract it to any folder.",
    detail: "Works on Windows 10/11. No admin rights needed.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    number: "02",
    icon: KeyRound,
    title: "Activate Your License",
    description:
      "Create a free account, claim your license key, and enter it in the app. One click — your machine is activated.",
    detail: "Free license. One key per machine.",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Start Creating",
    description:
      "The AI model downloads automatically on first launch. After that, everything runs 100% offline on your GPU.",
    detail: "No internet needed after setup.",
    gradient: "from-orange-500 to-yellow-400",
  },
];

export function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section id="how-it-works" className="relative px-6 py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Up and Running in{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              3 Easy Steps
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            No complex setup. No cloud accounts. Just download, activate, and
            create — all on your local machine.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative"
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Connector line (between cards on desktop) */}
              {index < steps.length - 1 && (
                <div className="absolute top-12 -right-3 hidden h-px w-6 bg-gradient-to-r from-border to-transparent md:block" />
              )}

              <div
                className={`relative rounded-2xl glass p-8 transition-all duration-500 h-full ${
                  hoveredStep === index
                    ? "scale-[1.03] shadow-xl shadow-primary/10"
                    : ""
                }`}
              >
                {/* Step number */}
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-lg transition-all duration-500 ${
                      hoveredStep === index ? "scale-110 shadow-xl" : "shadow-md"
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <p className="text-xs font-medium text-primary/70">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/download">
            <Button
              size="lg"
              className="group gap-2 rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
