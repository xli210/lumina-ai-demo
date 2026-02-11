import Image from "next/image";
import { Play } from "lucide-react";

const gallery = [
  {
    src: "/images/hero-showcase-1.svg",
    alt: "AI cosmic landscape",
    label: "Cosmic Dreamscape",
    type: "image" as const,
  },
  {
    src: "/images/video-thumb-1.svg",
    alt: "AI aurora dragon video",
    label: "Aurora Dragon",
    type: "video" as const,
  },
  {
    src: "/images/hero-showcase-2.svg",
    alt: "AI glass portrait",
    label: "Liquid Glass Portrait",
    type: "image" as const,
  },
  {
    src: "/images/hero-showcase-3.svg",
    alt: "AI futuristic city",
    label: "Neo Tokyo 2099",
    type: "image" as const,
  },
  {
    src: "/images/video-thumb-2.svg",
    alt: "AI underwater scene video",
    label: "Crystal Depths",
    type: "video" as const,
  },
  {
    src: "/images/hero-showcase-4.svg",
    alt: "AI fluid art",
    label: "Liquid Gold",
    type: "image" as const,
  },
];

export function ShowcaseSection() {
  return (
    <section id="showcase" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Showcase
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See What Lumina Can Create
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            From photorealistic portraits to cinematic video scenes, explore the
            boundless possibilities of AI-powered creativity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <div
              key={item.src}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl glass"
            >
              <Image
                src={item.src || "/placeholder.svg"}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full glass-strong transition-transform group-hover:scale-110">
                    <Play className="h-7 w-7 text-foreground ml-1" />
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 glass-strong p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.type} generation
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    AI Generated
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
