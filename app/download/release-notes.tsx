import Link from "next/link";
import { Tag, Sparkles, Bug, Zap, ChevronRight } from "lucide-react";
import { appReleases } from "@/lib/release-data";

const typeConfig = {
  feature: { icon: Sparkles, label: "New", className: "bg-primary/10 text-primary" },
  improvement: { icon: Zap, label: "Improved", className: "bg-green-500/10 text-green-500" },
  fix: { icon: Bug, label: "Fixed", className: "bg-orange-500/10 text-orange-500" },
};

export function ReleaseNotes() {
  return (
    <section id="release-notes" className="relative px-6 py-16 scroll-mt-24">
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
            const latestRelease = appRelease.releases[0];
            return (
              <div key={appRelease.app}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${appRelease.gradient} text-white`}>
                      <AppIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{appRelease.app}</h3>
                  </div>
                  <Link
                    href={`/release-notes/${appRelease.slug}`}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    All versions
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {latestRelease && (
                  <div className="glass rounded-2xl p-6 md:p-8">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold text-foreground">
                          v{latestRelease.version}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{latestRelease.date}</span>
                      {latestRelease.tag && (
                        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                          {latestRelease.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {latestRelease.changes.map((change) => {
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
