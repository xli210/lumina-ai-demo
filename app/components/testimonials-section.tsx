"use client";

import { useState } from "react";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Alex R.",
    role: "Indie Game Developer",
    quote:
      "Nano ImageEdit replaced my entire cloud AI workflow. Generating concept art locally means no API costs, no rate limits, and I keep full rights to everything I create.",
    rating: 5,
    gradient: "from-blue-500 to-blue-400",
  },
  {
    name: "Sarah K.",
    role: "Content Creator",
    quote:
      "The face swap tool is incredibly fast running on my RTX 4070. What used to take minutes on cloud services happens in seconds, and I never have to worry about uploading sensitive client photos.",
    rating: 5,
    gradient: "from-slate-600 to-slate-500",
  },
  {
    name: "Marcus T.",
    role: "VFX Artist",
    quote:
      "Nano VideoGen changed my pre-visualization process. I can iterate on shots without burning through cloud credits. The camera control LoRAs are a game-changer for storyboarding.",
    rating: 5,
    gradient: "from-blue-600 to-blue-500",
  },
  {
    name: "Priya M.",
    role: "Privacy Researcher",
    quote:
      "Finally, AI tools that respect data sovereignty. I recommend Lumina AI to every colleague who handles sensitive documents. Zero data leaves the machine — exactly how it should be.",
    rating: 5,
    gradient: "from-sky-500 to-blue-400",
  },
  {
    name: "James L.",
    role: "Freelance Photographer",
    quote:
      "The facial editing tools produce natural results that don't look AI-generated. My retouching workflow went from 30 minutes per photo to under 5. Absolute time saver.",
    rating: 5,
    gradient: "from-slate-500 to-slate-400",
  },
  {
    name: "Nina W.",
    role: "Small Business Owner",
    quote:
      "The one-time pricing is refreshing in a world of subscriptions. I paid once for Nano ImageEdit and I've been using it daily for months. Free updates keep coming.",
    rating: 5,
    gradient: "from-blue-500 to-sky-400",
  },
];

export function TestimonialsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-primary/3 blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Testimonials
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
              Creators
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Hear from professionals and hobbyists who made the switch to local
            AI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className={`group relative rounded-2xl glass p-6 transition-all duration-500 hover:scale-[1.02] sm:p-8 ${
                hoveredIndex === index ? "shadow-xl shadow-primary/10" : ""
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="mb-4 flex items-center justify-between">
                <Quote className="h-8 w-8 text-primary/20" />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-primary/70 text-primary/70"
                    />
                  ))}
                </div>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
