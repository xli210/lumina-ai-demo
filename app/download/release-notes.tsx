import { Tag, Sparkles, Bug, Zap } from "lucide-react";

const releases = [
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
      { type: "fix", text: "Resolved login session persistence on mobile" },
    ],
  },
  {
    version: "3.1.0",
    date: "January 15, 2026",
    changes: [
      { type: "feature", text: "Batch generation: create up to 10 variations at once" },
      { type: "feature", text: "Real-time preview while adjusting style parameters" },
      { type: "improvement", text: "Reduced app startup time by 40%" },
      { type: "fix", text: "Fixed crash when switching between light and dark mode" },
    ],
  },
  {
    version: "3.0.0",
    date: "December 1, 2025",
    changes: [
      { type: "feature", text: "Complete UI redesign with glassmorphism theme" },
      { type: "feature", text: "Video generation support (up to 30 seconds)" },
      { type: "feature", text: "Cross-device license sync via Supabase" },
      { type: "improvement", text: "New AI model with 3x quality improvement" },
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

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Release Notes
          </h2>
          <p className="text-muted-foreground">
            {"What's new in each version of Lumina AI"}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {releases.map((release) => (
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
                  const config = typeConfig[change.type as keyof typeof typeConfig];
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
    </section>
  );
}
