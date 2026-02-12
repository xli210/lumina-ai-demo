"use client";

import { Sparkles, Download, Package } from "lucide-react";

export function DownloadHero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(215, 100%, 55%) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2 text-sm text-muted-foreground animate-fade-in">
          <Package className="h-4 w-4 text-primary" />
          <span>Our Products — Download &amp; Get Started</span>
        </div>

        <h1 className="mb-4 text-balance text-5xl font-bold tracking-tight text-foreground opacity-0 animate-fade-in md:text-6xl"
          style={{ animationDelay: "0.1s" }}
        >
          Download{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Our Apps
            </span>
          </span>
        </h1>

        <p className="mb-8 text-pretty text-lg text-muted-foreground opacity-0 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Explore our suite of AI-powered tools. Each app is designed to run locally
          on your machine — no cloud dependency, full privacy.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Free trials included</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Download className="h-4 w-4 text-primary" />
            <span>No account required</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4 text-primary" />
            <span>Runs 100% locally</span>
          </div>
        </div>
      </div>
    </section>
  );
}
