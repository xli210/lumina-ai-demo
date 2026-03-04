"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  CheckCircle2,
  Sparkles,
  ScanText,
  ImagePlus,
  Video,
  ScanFace,
  Monitor,
  Apple,
  ShoppingCart,
  Key,
  Copy,
  Check,
  Loader2,
  Clock,
  AlertTriangle,
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

interface LicenseInfo {
  license_key: string;
  is_trial: boolean;
  trial_ends_at: string | null;
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
    version: "0.0.02",
    gradient: "from-emerald-500 to-teal-400",
    shadowColor: "shadow-emerald-500/25",
    badge: "New",
    platforms: [
      {
        platform: "Windows",
        icon: Monitor,
        fileName: "OCR_Demo0.0.02.zip",
        downloadUrl: "/api/downloads/OCR_Demo0.0.02.zip",
        size: "128 KB",
      },
    ],
  },
  {
    id: "nano-imageedit",
    productId: "nano-imageedit",
    name: "Nano ImageEdit",
    tagline: "AI Image Generation & Editing",
    description:
      "Generate and edit stunning images from text prompts with Nano ImageEdit. Supports text-to-image and image-to-image, running 100% locally on your GPU.",
    icon: ImagePlus,
    version: "1.0.6",
    gradient: "from-violet-500 to-fuchsia-400",
    shadowColor: "shadow-violet-500/25",
    badge: "Pro",
    platforms: [
      {
        platform: "Windows",
        icon: Monitor,
        fileName: "NanoImageEdit-1.0.6.zip",
        downloadUrl: "/api/downloads/NanoImageEdit-1.0.6.zip",
        size: "2.5 MB",
      },
    ],
  },
  {
    id: "nano-videogen",
    productId: "nano-videogen",
    name: "Nano VideoGen",
    tagline: "AI Video Generation",
    description:
      "Create stunning videos from text prompts or images with Nano VideoGen. Supports text-to-video, image-to-video, keyframe interpolation, and camera control LoRAs — all running 100% locally on your GPU.",
    icon: Video,
    version: "1.0.2",
    gradient: "from-orange-500 to-amber-400",
    shadowColor: "shadow-orange-500/25",
    badge: "Pro",
    platforms: [
      {
        platform: "Windows",
        icon: Monitor,
        fileName: "NanoVideoGen-1.0.2.zip",
        downloadUrl: "/api/downloads/NanoVideoGen-1.0.2.zip",
        size: "916 KB",
      },
    ],
  },
  {
    id: "nano-facialedit",
    productId: "nano-facialedit",
    name: "Nano FacialEdit",
    tagline: "AI Facial Editing & Enhancement",
    description:
      "Retouch, enhance, and transform facial features with AI. Supports face swap, expression editing, and portrait retouching — all running 100% locally on your GPU.",
    icon: ScanFace,
    version: "1.0.0",
    gradient: "from-pink-500 to-rose-400",
    shadowColor: "shadow-pink-500/25",
    badge: "New",
    platforms: [
      {
        platform: "Windows",
        icon: Monitor,
        fileName: "NanoFacialEdit-1.0.0.zip",
        downloadUrl: "/api/downloads/NanoFacialEdit-1.0.0.zip",
        size: "2.3 MB",
      },
    ],
  },
];

function getDaysRemaining(trialEndsAt: string): number {
  const now = new Date();
  const end = new Date(trialEndsAt);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function AppCards() {
  const [claimingApp, setClaimingApp] = useState<string | null>(null);
  const [licenseData, setLicenseData] = useState<Record<string, LicenseInfo>>(
    {}
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingLicenses, setLoadingLicenses] = useState(true);

  // Load existing licenses on mount so they survive page refreshes
  const loadExistingLicenses = useCallback(async () => {
    try {
      const res = await fetch("/api/license/my-licenses");
      if (res.ok) {
        const data = await res.json();
        if (data.licenses) {
          setLicenseData(data.licenses);
        }
      }
    } catch {
      // Silently fail — user can still claim manually
    } finally {
      setLoadingLicenses(false);
    }
  }, []);

  useEffect(() => {
    loadExistingLicenses();
  }, [loadExistingLicenses]);

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

      setLicenseData((prev) => ({
        ...prev,
        [appId]: {
          license_key: data.license_key,
          is_trial: data.is_trial ?? false,
          trial_ends_at: data.trial_ends_at ?? null,
        },
      }));
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
    const key = licenseData[appId]?.license_key;
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

  if (loadingLicenses) {
    return (
      <section className="relative px-6 pb-16">
        <div className="mx-auto max-w-5xl flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-6 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8">
          {apps.map((app) => {
            const Icon = app.icon;
            const product = getProduct(app.productId);
            const price = product?.priceInCents ?? 0;
            const trialDays = product?.trialDays ?? 0;
            const licInfo = licenseData[app.id];
            const hasLicense = !!licInfo;
            const isTrial = licInfo?.is_trial ?? false;
            const trialEndsAt = licInfo?.trial_ends_at;
            const daysRemaining = trialEndsAt
              ? getDaysRemaining(trialEndsAt)
              : 0;
            const trialExpired = isTrial && daysRemaining <= 0;
            const isClaiming = claimingApp === app.id;
            const error = errors[app.id];
            // A "paid" product that supports trial
            const isPaidWithTrial = price > 0 && trialDays > 0;

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
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                              app.badge === "Pro"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
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
                    {isPaidWithTrial && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {trialDays}-day free trial
                      </p>
                    )}
                  </div>
                </div>

                {/* License Key Section — no license yet */}
                {!hasLicense && (
                  <div className="border-t border-border/50 pt-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1">
                        {isPaidWithTrial ? (
                          <>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Start your {trialDays}-day free trial
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Try the full app for free. No payment required
                              upfront. Purchase anytime to keep using after the
                              trial.
                            </p>
                          </>
                        ) : price === 0 ? (
                          <>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Get your free activation license
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Each license activates on 1 machine. You&apos;ll
                              receive a license key to activate the app.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Purchase to get your activation license
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Each license activates on 1 machine. You&apos;ll
                              receive a license key to activate the app.
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        {isPaidWithTrial ? (
                          <>
                            <Button
                              className={`gap-2 rounded-full px-8 bg-gradient-to-r ${app.gradient} text-white border-0 hover:opacity-90 shadow-md ${app.shadowColor}`}
                              onClick={() => handleGetLicense(app.id)}
                              disabled={isClaiming}
                            >
                              {isClaiming ? (
                                <>
                                  <Key className="h-4 w-4 animate-spin" />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4" />
                                  Start Free Trial
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2 rounded-full px-6"
                              onClick={() =>
                                (window.location.href = `/checkout?product=${app.productId}`)
                              }
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Buy — {formatPrice(price)}
                            </Button>
                          </>
                        ) : price === 0 ? (
                          <Button
                            className={`gap-2 rounded-full px-8 bg-gradient-to-r ${app.gradient} text-white border-0 hover:opacity-90 shadow-md ${app.shadowColor}`}
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
                            className={`gap-2 rounded-full px-8 bg-gradient-to-r ${app.gradient} text-white border-0 hover:opacity-90 shadow-md ${app.shadowColor}`}
                            onClick={() =>
                              (window.location.href = `/checkout?product=${app.productId}`)
                            }
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Purchase — {formatPrice(price)}
                          </Button>
                        )}
                      </div>
                    </div>
                    {error && (
                      <p className="mt-3 text-sm text-red-500">{error}</p>
                    )}
                  </div>
                )}

                {/* License active — trial (not expired) */}
                {hasLicense && isTrial && !trialExpired && (
                  <div className="border-t border-border/50 pt-6 mb-6">
                    <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-5">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-amber-500" />
                          <span className="text-sm font-semibold text-amber-500">
                            Free Trial — {daysRemaining} day
                            {daysRemaining !== 1 ? "s" : ""} remaining
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="gap-1.5 rounded-full px-5 bg-gradient-to-r from-primary to-purple-500 text-white border-0 hover:opacity-90"
                          onClick={() =>
                            (window.location.href = `/checkout?product=${app.productId}`)
                          }
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Upgrade — {formatPrice(price)}
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            Your Trial License Key (save this!)
                          </p>
                          <code className="text-lg font-mono font-bold tracking-wider text-foreground">
                            {licInfo.license_key}
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
                        Enter this key in the app after installation. Purchase
                        anytime to keep using after the trial ends.
                      </p>
                    </div>
                  </div>
                )}

                {/* License — trial expired */}
                {hasLicense && trialExpired && (
                  <div className="border-t border-border/50 pt-6 mb-6">
                    <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-5">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span className="text-sm font-semibold text-red-500">
                            Trial Expired
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="gap-1.5 rounded-full px-6 bg-gradient-to-r from-primary to-purple-500 text-white border-0 hover:opacity-90 shadow-md"
                          onClick={() =>
                            (window.location.href = `/checkout?product=${app.productId}`)
                          }
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Purchase — {formatPrice(price)}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your {trialDays}-day free trial has ended. Purchase a
                        full license to continue using {app.name}. Your existing
                        license key will be upgraded automatically.
                      </p>
                    </div>
                  </div>
                )}

                {/* License active — permanent (free or purchased) */}
                {hasLicense && !isTrial && (
                  <div className="border-t border-border/50 pt-6 mb-6">
                    <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-500">
                          {price > 0
                            ? "Licensed — Full Version"
                            : "License Activated"}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            Your License Key (save this!)
                          </p>
                          <code className="text-lg font-mono font-bold tracking-wider text-foreground">
                            {licInfo.license_key}
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

                {/* Platform Downloads — visible if license exists and not trial-expired */}
                {hasLicense && !trialExpired && (
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
