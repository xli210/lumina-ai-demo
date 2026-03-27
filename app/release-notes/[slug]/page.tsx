import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Tag, Sparkles, Bug, Zap, ArrowLeft } from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { appReleases } from "@/lib/release-data";

const typeConfig = {
  feature: { icon: Sparkles, label: "New", className: "bg-primary/10 text-primary" },
  improvement: { icon: Zap, label: "Improved", className: "bg-green-500/10 text-green-500" },
  fix: { icon: Bug, label: "Fixed", className: "bg-orange-500/10 text-orange-500" },
};

export function generateStaticParams() {
  return appReleases.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = appReleases.find((a) => a.slug === slug);
  if (!app) return { title: "Not Found" };

  const latest = app.releases[0];
  return {
    title: `${app.app} Release Notes — v${latest.version}`,
    description: `Release notes and changelog for ${app.app}. See what's new in v${latest.version} and previous versions.`,
    alternates: { canonical: `/release-notes/${slug}` },
  };
}

export default async function AppReleaseNotesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = appReleases.find((a) => a.slug === slug);
  if (!app) notFound();

  const AppIcon = app.icon;

  return (
    <main className="relative min-h-screen">
      <Navbar />

      <section className="relative px-6 pt-28 pb-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <Link
            href="/download#release-notes"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Downloads
          </Link>

          <div className="flex items-center gap-4 mb-10">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${app.gradient} text-white shadow-lg`}>
              <AppIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {app.app}
              </h1>
              <p className="text-muted-foreground">Release Notes & Changelog</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {app.releases.map((release) => (
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
      </section>

      <Footer />
    </main>
  );
}
