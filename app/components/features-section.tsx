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
  },
  {
    icon: Film,
    title: "Video Creation",
    description:
      "Generate cinematic video clips with smooth motion and incredible detail. From nature scenes to abstract art in motion.",
  },
  {
    icon: Palette,
    title: "100+ Style Presets",
    description:
      "Choose from over 100 curated styles including oil painting, watercolor, cyberpunk, anime, and photographic realism.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get results in seconds, not minutes. Our optimized pipeline delivers high-quality outputs with minimal wait time.",
  },
  {
    icon: Shield,
    title: "Commercial License",
    description:
      "Every creation is yours to use commercially. No restrictions on how you use your AI-generated content.",
  },
  {
    icon: Download,
    title: "HD Export",
    description:
      "Export your creations in up to 4K resolution. Perfect for print, social media, presentations, and professional work.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-24">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Everything You Need to Create
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Professional-grade AI creative tools, designed to be simple enough
            for anyone and powerful enough for professionals.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl glass p-8 transition-all hover:scale-[1.02]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
