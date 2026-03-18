"use client";

import Link from "next/link";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[200px]" />
        <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[250px] w-[250px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="glass-strong rounded-3xl p-10 text-center md:p-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Ready to Create{" "}
            <span className="text-primary">
              Without Limits?
            </span>
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-pretty text-lg text-muted-foreground">
            Download our AI tools today. No subscriptions, no cloud fees, no
            data sharing. Just powerful AI running on your machine.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-full bg-primary px-8 text-white shadow-lg shadow-primary/20 hover:opacity-90"
            >
              <Link href="/download">
                <Download className="h-5 w-5" />
                Download Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-8"
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Free apps available instantly. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
