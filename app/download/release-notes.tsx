import { Tag, Sparkles, Bug, Zap, ScanText, ImagePlus } from "lucide-react";

interface ReleaseChange {
  type: "feature" | "improvement" | "fix";
  text: string;
}

interface Release {
  version: string;
  date: string;
  tag?: string;
  changes: ReleaseChange[];
}

interface AppRelease {
  app: string;
  icon: typeof Sparkles;
  gradient: string;
  releases: Release[];
}

const appReleases: AppRelease[] = [
  {
    app: "Lumina AI",
    icon: Sparkles,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "3.2.1",
        date: "February 8, 2026",
        tag: "Latest",
        changes: [
          { type: "feature", text: "New cinematic video generation mode with 4K output" },
          { type: "feature", text: "Added 25 new creative style presets (Manga, Baroque, etc.)" },
          { type: "improvement", text: "2x faster rendering on Apple Silicon devices" },
          { type: "improvement", text: "Improved prompt understanding for complex scenes" },
          { type: "fix", text: "Fixed image export quality on high-DPI displays" },
        ],
      },
      {
        version: "3.1.0",
        date: "January 15, 2026",
        changes: [
          { type: "feature", text: "Batch generation: create up to 10 variations at once" },
          { type: "improvement", text: "Reduced app startup time by 40%" },
          { type: "fix", text: "Fixed crash when switching between light and dark mode" },
        ],
      },
    ],
  },
  {
    app: "OCR Demo",
    icon: ScanText,
    gradient: "from-emerald-500 to-teal-400",
    releases: [
      {
        version: "0.0.02",
        date: "February 24, 2026",
        tag: "Latest",
        changes: [
          { type: "feature", text: "Product-bound license activation — licenses are now tied to each product" },
          { type: "improvement", text: "Enhanced license security with per-product master keys" },
          { type: "improvement", text: "Improved error messages during activation and model download" },
          { type: "fix", text: "Fixed cross-product license activation vulnerability" },
        ],
      },
      {
        version: "0.0.01",
        date: "February 12, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "Extract text from images (PNG, JPG, BMP, TIFF)" },
          { type: "feature", text: "PDF document text extraction with page selection" },
          { type: "feature", text: "Multi-language support (English, Chinese, Japanese, Korean, and more)" },
          { type: "feature", text: "Runs entirely offline — no data leaves your machine" },
          { type: "improvement", text: "Optimized for low-resource devices" },
        ],
      },
    ],
  },
  {
    app: "FLUX.2 Klein",
    icon: ImagePlus,
    gradient: "from-violet-500 to-fuchsia-400",
    releases: [
      {
        version: "1.0.1",
        date: "February 25, 2026",
        tag: "Update",
        changes: [
          { type: "feature", text: "Text-to-image generation with FLUX.2 Klein 4B model" },
          { type: "feature", text: "Image-to-image generation with reference photos" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "Streaming DiT mode for GPUs with less than 12 GB VRAM" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
];

const typeConfig = {
  feature: { icon: Sparkles, label: "New", className: "bg-primary/10 text-primary" },
  improvement: { icon: Zap, label: "Improved", className: "bg-green-500/10 text-green-500" },
  fix: { icon: Bug, label: "Fixed", className: "bg-orange-500/10 text-orange-500" },
};

export function ReleaseNotes() {
  return (
    <section className="relative px-6 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Release Notes
          </h2>
          <p className="text-muted-foreground">
            {"What's new across all our apps"}
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {appReleases.map((appRelease) => {
            const AppIcon = appRelease.icon;
            return (
              <div key={appRelease.app}>
                {/* App title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${appRelease.gradient} text-white`}>
                    <AppIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{appRelease.app}</h3>
                </div>

                {/* Releases for this app */}
                <div className="flex flex-col gap-6">
                  {appRelease.releases.map((release) => (
                    <div key={release.version} className="glass rounded-2xl p-6 md:p-8">
                      <div className="mb-5 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="text-lg font-bold text-foreground">
                            v{release.version}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{release.date}</span>
                        {release.tag && (
                          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                            {release.tag}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        {release.changes.map((change) => {
                          const config = typeConfig[change.type];
                          const Icon = config.icon;
                          return (
                            <div key={change.text} className="flex items-start gap-3">
                              <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </span>
                              <span className="text-sm text-foreground/80">{change.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
