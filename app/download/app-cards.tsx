"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  CheckCircle2,
  Sparkles,
  ScanText,
  Monitor,
  Apple,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

interface PlatformDownload {
  platform: string;
  icon: LucideIcon;
  fileName: string;
  downloadUrl: string;
  size: string;
}

interface AppInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  version: string;
  gradient: string;
  shadowColor: string;
  badge?: string;
  platforms: PlatformDownload[];
}

const apps: AppInfo[] = [
  {
    id: "lumina-ai",
    name: "Lumina AI",
    tagline: "AI Creative Studio",
    description:
      "Transform your ideas into stunning visuals with AI-powered creative tools. Generate breathtaking images and videos with one tap.",
    icon: Sparkles,
    version: "3.2.1",
    gradient: "from-primary to-blue-400",
    shadowColor: "shadow-primary/25",
    badge: "Flagship",
    platforms: [
      {
        platform: "Windows",
        icon: Monitor,
        fileName: "LuminaAI-3.2.1.zip",
        downloadUrl: "/api/downloads/LuminaAI-3.2.1.zip",
        size: "1.4 MB",
      },
      {
        platform: "macOS",
        icon: Apple,
        fileName: "LuminaAI-3.2.1.zip",
        downloadUrl: "/api/downloads/LuminaAI-3.2.1.zip",
        size: "1.4 MB",
      },
      {
        platform: "Linux",
        icon: Monitor,
        fileName: "LuminaAI-3.2.1.zip",
        downloadUrl: "/api/downloads/LuminaAI-3.2.1.zip",
        size: "1.4 MB",
      },
    ],
  },
  {
    id: "ocr-demo",
    name: "OCR Demo",
    tagline: "Intelligent Text Recognition",
    description:
      "Extract text from images, PDFs, and scanned documents with state-of-the-art OCR powered by local AI models. Fast, private, and accurate.",
    icon: ScanText,
    version: "0.0.01",
    gradient: "from-emerald-500 to-teal-400",
    shadowColor: "shadow-emerald-500/25",
    badge: "New",
    platforms: [
      {
        platform: "Windows",
        icon: Monitor,
        fileName: "OCR_Demo0.0.01.zip",
        downloadUrl: "/api/downloads/OCR_Demo0.0.01.zip",
        size: "1.2 MB",
      },
    ],
  },
];

export function AppCards() {
  const [downloading, setDownloading] = useState<string | null>(null);

  function handleDownload(appId: string, platform: PlatformDownload) {
    const key = `${appId}-${platform.platform}`;
    setDownloading(key);
    // Use window.location to trigger the authenticated download
    window.location.href = platform.downloadUrl;
    setTimeout(() => {
      setDownloading(null);
    }, 3000);
  }

  return (
    <section className="relative px-6 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                className="glass-strong rounded-3xl p-8 md:p-10 border border-border/50 transition-all duration-300 hover:border-primary/20"
              >
                {/* App Header */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
                  <div className="flex items-start gap-5">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.gradient} text-white shadow-lg ${app.shadowColor}`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-2xl font-bold text-foreground">
                          {app.name}
                        </h3>
                        {app.badge && (
                          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                            {app.badge}
                          </span>
                        )}
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          v{app.version}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary mb-1">
                        {app.tagline}
                      </p>
                      <p className="text-muted-foreground max-w-xl">
                        {app.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Platform Downloads */}
                <div className="border-t border-border/50 pt-6">
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    Available for
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {app.platforms.map((platform) => {
                      const PlatformIcon = platform.icon;
                      const downloadKey = `${app.id}-${platform.platform}`;
                      const isDownloading = downloading === downloadKey;

                      return (
                        <div
                          key={platform.platform}
                          className="group flex items-center justify-between gap-4 rounded-2xl glass px-5 py-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                              <PlatformIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {platform.platform}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {platform.size} · {platform.fileName}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className={`gap-1.5 rounded-full px-5 shrink-0 transition-all bg-gradient-to-r ${app.gradient} text-white border-0 hover:opacity-90 shadow-md ${app.shadowColor}`}
                            onClick={() => handleDownload(app.id, platform)}
                            disabled={isDownloading}
                          >
                            {isDownloading ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 animate-pulse" />
                                Done
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                Download
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
