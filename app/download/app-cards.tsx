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
  ShoppingCart,
  Key,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";

interface PlatformDownload {
  platform: string;
  icon: LucideIcon;
  fileName: string;
  downloadUrl: string;
  size: string;
}

interface AppInfo {
  id: string;
  productId: string;
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
    productId: "lumina-ai",
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
    productId: "ocr-demo",
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
  const [claimingApp, setClaimingApp] = useState<string | null>(null);
  const [licenseKeys, setLicenseKeys] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleGetLicense(appId: string) {
    setClaimingApp(appId);
    setErrors((prev) => ({ ...prev, [appId]: "" }));

    try {
      const res = await fetch("/api/license/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: appId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          [appId]: data.error || "Failed to claim license",
        }));
        return;
      }

      setLicenseKeys((prev) => ({ ...prev, [appId]: data.license_key }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        [appId]: "Network error. Please try again.",
      }));
    } finally {
      setClaimingApp(null);
    }
  }

  async function handleCopyKey(appId: string) {
    const key = licenseKeys[appId];
    if (!key) return;
    await navigator.clipboard.writeText(key);
    setCopiedKey(appId);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleDownload(appId: string, platform: PlatformDownload) {
    const key = `${appId}-${platform.platform}`;
    setDownloading(key);
    window.location.href = platform.downloadUrl;
    setTimeout(() => setDownloading(null), 3000);
  }

  function getProduct(productId: string) {
    return PRODUCTS.find((p) => p.id === productId);
  }

  function formatPrice(priceInCents: number) {
    if (priceInCents === 0) return "Free";
    return `$${(priceInCents / 100).toFixed(2)}`;
  }

  return (
    <section className="relative px-6 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8">
          {apps.map((app) => {
            const Icon = app.icon;
            const product = getProduct(app.productId);
            const price = product?.priceInCents ?? 0;
            const hasLicense = !!licenseKeys[app.id];
            const isClaiming = claimingApp === app.id;
            const error = errors[app.id];

            return (
              <div
                key={app.id}
                className="glass-strong rounded-3xl p-8 md:p-10 border border-border/50 transition-all duration-300 hover:border-primary/20"
              >
                {/* App Header */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-6">
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
                  {/* Price Badge */}
                  <div className="shrink-0 text-right">
                    <div
                      className={`inline-block rounded-2xl px-5 py-2 ${
                        price === 0
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <span className="text-2xl font-bold">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="block text-xs opacity-75">
                          one-time
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* License Key Section */}
                {!hasLicense ? (
                  <div className="border-t border-border/50 pt-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {price === 0
                            ? "Get your free activation license"
                            : "Purchase to get your activation license"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Each license activates on 1 machine. You&apos;ll
                          receive a license key to activate the app.
                        </p>
                      </div>
                      {price === 0 ? (
                        <Button
                          className={`gap-2 rounded-full px-8 shrink-0 bg-gradient-to-r ${app.gradient} text-white border-0 hover:opacity-90 shadow-md ${app.shadowColor}`}
                          onClick={() => handleGetLicense(app.id)}
                          disabled={isClaiming}
                        >
                          {isClaiming ? (
                            <>
                              <Key className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4" />
                              Get Free License
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          className={`gap-2 rounded-full px-8 shrink-0 bg-gradient-to-r ${app.gradient} text-white border-0 hover:opacity-90 shadow-md ${app.shadowColor}`}
                          onClick={() =>
                            (window.location.href = `/checkout?product=${app.productId}`)
                          }
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Purchase — {formatPrice(price)}
                        </Button>
                      )}
                    </div>
                    {error && (
                      <p className="mt-3 text-sm text-red-500">{error}</p>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-border/50 pt-6 mb-6">
                    <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-500">
                          License Activated
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            Your License Key (save this!)
                          </p>
                          <code className="text-lg font-mono font-bold tracking-wider text-foreground">
                            {licenseKeys[app.id]}
                          </code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-full shrink-0"
                          onClick={() => handleCopyKey(app.id)}
                        >
                          {copiedKey === app.id ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy Key
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Enter this key in the app after installation to activate
                        it on your machine.
                      </p>
                    </div>
                  </div>
                )}

                {/* Platform Downloads — only visible once license is obtained */}
                {hasLicense && (
                  <div className="border-t border-border/50 pt-6">
                    <p className="mb-4 text-sm font-medium text-muted-foreground">
                      Download for your platform
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
