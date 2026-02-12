"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
} from "lucide-react";

interface PlatformInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  version: string;
  size: string;
  fileName: string;
  downloadUrl: string;
  badge?: string;
}

const DOWNLOAD_URL = "/downloads/LuminaAI-3.2.1.zip";

const platforms: PlatformInfo[] = [
  {
    id: "windows",
    name: "Windows",
    icon: <Monitor className="h-8 w-8" />,
    description: "Windows 10 / 11 (64-bit)",
    version: "3.2.1",
    size: "1.4 MB",
    fileName: "LuminaAI-3.2.1.zip",
    downloadUrl: DOWNLOAD_URL,
    badge: "Most Popular",
  },
  {
    id: "macos",
    name: "macOS",
    icon: <Apple className="h-8 w-8" />,
    description: "macOS 13 Ventura or later",
    version: "3.2.1",
    size: "1.4 MB",
    fileName: "LuminaAI-3.2.1.zip",
    downloadUrl: DOWNLOAD_URL,
  },
  {
    id: "linux",
    name: "Linux",
    icon: <Monitor className="h-8 w-8" />,
    description: "Ubuntu 22.04+ / Fedora 38+",
    version: "3.2.1",
    size: "1.4 MB",
    fileName: "LuminaAI-3.2.1.zip",
    downloadUrl: DOWNLOAD_URL,
  },
  {
    id: "ios",
    name: "iOS",
    icon: <Smartphone className="h-8 w-8" />,
    description: "iPhone & iPad (iOS 17+)",
    version: "3.2.1",
    size: "1.4 MB",
    fileName: "LuminaAI-3.2.1.zip",
    downloadUrl: DOWNLOAD_URL,
  },
  {
    id: "android",
    name: "Android",
    icon: <Smartphone className="h-8 w-8" />,
    description: "Android 12+ (API 31)",
    version: "3.2.1",
    size: "1.4 MB",
    fileName: "LuminaAI-3.2.1.zip",
    downloadUrl: DOWNLOAD_URL,
  },
];

function detectPlatform(): string {
  if (typeof window === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") && !ua.includes("android")) return "linux";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("android")) return "android";
  return "windows";
}

export function PlatformCards() {
  const [detectedPlatform, setDetectedPlatform] = useState("windows");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setDetectedPlatform(detectPlatform());
  }, []);

  // Sort platforms: detected platform first
  const sortedPlatforms = [...platforms].sort((a, b) => {
    if (a.id === detectedPlatform) return -1;
    if (b.id === detectedPlatform) return 1;
    return 0;
  });

  function handleDownload(platform: PlatformInfo) {
    setDownloading(platform.id);
    // Create a temporary anchor to trigger the download
    const link = document.createElement("a");
    link.href = platform.downloadUrl;
    link.download = platform.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setDownloading(null);
    }, 2000);
  }

  return (
    <section className="relative px-6 pb-16">
      <div className="mx-auto max-w-5xl">
        {/* Recommended platform - large card */}
        {sortedPlatforms.length > 0 && (
          <div className="mb-8">
            <p className="mb-4 text-sm font-medium text-muted-foreground text-center">
              Recommended for your system
            </p>
            <div className="glass-strong rounded-3xl p-8 md:p-10 border border-primary/20">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-400 text-white shadow-lg shadow-primary/25">
                    {sortedPlatforms[0].icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-foreground">
                        Lumina AI for {sortedPlatforms[0].name}
                      </h3>
                      {sortedPlatforms[0].badge && (
                        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                          {sortedPlatforms[0].badge}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {sortedPlatforms[0].description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>v{sortedPlatforms[0].version}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span>{sortedPlatforms[0].size}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span>{sortedPlatforms[0].fileName}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="gap-2 rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all shrink-0"
                  onClick={() => handleDownload(sortedPlatforms[0])}
                  disabled={downloading === sortedPlatforms[0].id}
                >
                  {downloading === sortedPlatforms[0].id ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 animate-pulse" />
                      Starting Download...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Other platforms */}
        <p className="mb-4 text-sm font-medium text-muted-foreground text-center">
          Also available on
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sortedPlatforms.slice(1).map((platform) => (
            <div
              key={platform.id}
              className="group glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
                  {platform.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{platform.name}</h4>
                  <p className="text-xs text-muted-foreground">{platform.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                <span>v{platform.version}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{platform.size}</span>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 rounded-xl bg-transparent transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                onClick={() => handleDownload(platform)}
                disabled={downloading === platform.id}
              >
                {downloading === platform.id ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 animate-pulse" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
