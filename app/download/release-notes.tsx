import { Tag, Sparkles, Bug, Zap, ImagePlus, Video, ScanFace, ArrowLeftRight, Wand2, Shirt } from "lucide-react";

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
    app: "Nano ImageEdit",
    icon: ImagePlus,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.2",
        date: "March 4, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "Enhanced transport-key encryption for security" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.1",
        date: "February 28, 2026",
        changes: [
          { type: "feature", text: "Text-to-image generation from text prompts" },
          { type: "feature", text: "Image-to-image generation with reference photos" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "Streaming DiT mode for GPUs with less than 12 GB VRAM" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano VideoGen",
    icon: Video,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.1.0",
        date: "March 18, 2026",
        tag: "Latest",
        changes: [
          { type: "feature", text: "Improved video quality and motion consistency" },
          { type: "improvement", text: "Faster generation with optimized inference pipeline" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.3",
        date: "March 4, 2026",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.2",
        date: "February 27, 2026",
        changes: [
          { type: "improvement", text: "Rebranded to Nano VideoGen with new installer" },
          { type: "feature", text: "Text-to-video generation with advanced AI models" },
          { type: "feature", text: "Image-to-video generation with structural control" },
          { type: "feature", text: "Keyframe interpolation — morph between two images" },
          { type: "feature", text: "Camera control LoRAs (dolly in/out/left/right, jib up/down, static)" },
          { type: "feature", text: "Spatial upscaler for 2× resolution boost" },
          { type: "feature", text: "Smart VRAM management for GPUs with limited memory" },
          { type: "feature", text: "Product-bound license activation" },
        ],
      },
    ],
  },
  {
    app: "Nano VideoEnhance",
    icon: Wand2,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.0",
        date: "March 18, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered video upscaling and enhancement" },
          { type: "feature", text: "Video stabilization and denoising" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
          { type: "feature", text: "Product-bound license activation" },
        ],
      },
    ],
  },
  {
    app: "Nano FacialEdit",
    icon: ScanFace,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.1",
        date: "March 5, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.0",
        date: "March 3, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered facial retouching and enhancement" },
          { type: "feature", text: "Face swap and expression editing" },
          { type: "feature", text: "Portrait enhancement with natural results" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano FaceSwap",
    icon: ArrowLeftRight,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.1",
        date: "March 5, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.0",
        date: "March 4, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered face swapping in photos and videos" },
          { type: "feature", text: "Realistic and natural-looking results" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano ImageEnh",
    icon: Wand2,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.0",
        date: "March 5, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered image upscaling and denoising" },
          { type: "feature", text: "Photo restoration and detail enhancement" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "7-day free trial included" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano ImageTryon",
    icon: Shirt,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.0",
        date: "March 16, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered virtual try-on with photo-realistic results" },
          { type: "feature", text: "Clothing swap from any photo" },
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
