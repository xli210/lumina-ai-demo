"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Clock,
  ShoppingCart,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LicenseKeyRow } from "./license-key-row";

interface LicenseInfo {
  license_key: string;
  is_trial: boolean;
  trial_ends_at: string | null;
}

interface Props {
  productId: string;
  productName: string;
  priceInCents: number;
  trialDays: number;
  windowsFile: string;
  windowsSizeBytes: number;
  userEmail: string | null;
}

function daysRemaining(trialEndsAt: string): number {
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function formatMB(bytes: number): string {
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

type ClaimResult =
  | { ok: true; info: LicenseInfo }
  | { ok: false; error: string };

async function postToLicenseEndpoint(
  endpoint: string,
  productId: string,
  fallbackError: string
): Promise<ClaimResult> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      return { ok: false, error: (data?.error as string) ?? fallbackError };
    }
    return {
      ok: true,
      info: {
        license_key: String(data.license_key ?? ""),
        is_trial: Boolean(data.is_trial),
        trial_ends_at: (data.trial_ends_at as string | null) ?? null,
      },
    };
  } catch {
    return { ok: false, error: "Network error — try again" };
  }
}

const postClaim = (productId: string) =>
  postToLicenseEndpoint("/api/license/claim", productId, "Failed to start trial");

const postTestGrant = (productId: string) =>
  postToLicenseEndpoint(
    "/api/license/test-grant",
    productId,
    "Failed to grant test license"
  );

export function TestPanel({
  productId,
  productName,
  priceInCents,
  trialDays,
  windowsFile,
  windowsSizeBytes,
  userEmail,
}: Props) {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLicense = useCallback(async () => {
    try {
      const res = await fetch("/api/license/my-licenses");
      if (res.ok) {
        const data = await res.json();
        const info: LicenseInfo | undefined = data?.licenses?.[productId];
        if (info) setLicense(info);
      }
    } catch {
      // silent — the claim button remains available
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadLicense();
  }, [loadLicense]);

  async function handleStartTrial() {
    setClaiming(true);
    setError(null);
    const result = await postClaim(productId);
    if (result.ok) setLicense(result.info);
    else setError(result.error);
    setClaiming(false);
  }

  async function handleCopyKey() {
    if (!license?.license_key) return;
    await navigator.clipboard.writeText(license.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    setDownloading(true);
    window.location.href = `/api/downloads/${windowsFile}`;
    setTimeout(() => setDownloading(false), 3000);
  }

  // On the internal preview page the Buy action skips Stripe entirely
  // and mints a real permanent license instantly via /api/license/test-grant.
  // The endpoint is admin-only, so this shortcut is safe to expose here.
  async function handleBuy() {
    setClaiming(true);
    setError(null);
    const result = await postTestGrant(productId);
    if (result.ok) setLicense(result.info);
    else setError(result.error);
    setClaiming(false);
  }

  const state = deriveState(license);
  const priceStr = `$${(priceInCents / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const showDownload = state === "trial_active" || state === "permanent";

  return (
    <div className="space-y-6">
      {userEmail && (
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">
          Signed in as <span className="text-white/70">{userEmail}</span>
        </p>
      )}
      {renderStatePanel({
        state,
        license,
        productName,
        priceStr,
        priceInCents,
        trialDays,
        claiming,
        copied,
        error,
        onStartTrial: handleStartTrial,
        onBuy: handleBuy,
        onCopy: handleCopyKey,
      })}
      {showDownload && (
        <DownloadPanel
          windowsFile={windowsFile}
          windowsSizeBytes={windowsSizeBytes}
          downloading={downloading}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

interface DispatchProps {
  state: PanelState;
  license: LicenseInfo | null;
  productName: string;
  priceStr: string;
  priceInCents: number;
  trialDays: number;
  claiming: boolean;
  copied: boolean;
  error: string | null;
  onStartTrial: () => void;
  onBuy: () => void;
  onCopy: () => void;
}

function renderStatePanel(p: DispatchProps) {
  if (p.state === "none") {
    return (
      <NoLicensePanel
        trialDays={p.trialDays}
        priceStr={p.priceStr}
        priceInCents={p.priceInCents}
        claiming={p.claiming}
        error={p.error}
        onStartTrial={p.onStartTrial}
        onBuy={p.onBuy}
      />
    );
  }
  if (p.state === "trial_expired") {
    return (
      <TrialExpiredPanel productName={p.productName} priceStr={p.priceStr} onBuy={p.onBuy} />
    );
  }
  if (!p.license) return null;
  if (p.state === "trial_active") {
    return (
      <TrialActivePanel
        license={p.license}
        productName={p.productName}
        priceStr={p.priceStr}
        copied={p.copied}
        onCopy={p.onCopy}
        onBuy={p.onBuy}
      />
    );
  }
  return (
    <PermanentPanel
      license={p.license}
      productName={p.productName}
      copied={p.copied}
      onCopy={p.onCopy}
    />
  );
}

// ────────────────────────────────────────────────────────────────
// State derivation

type PanelState = "none" | "trial_active" | "trial_expired" | "permanent";

function deriveState(license: LicenseInfo | null): PanelState {
  if (!license) return "none";
  if (!license.is_trial) return "permanent";
  const daysLeft = license.trial_ends_at
    ? daysRemaining(license.trial_ends_at)
    : 0;
  return daysLeft > 0 ? "trial_active" : "trial_expired";
}

// ────────────────────────────────────────────────────────────────
// Sub-panels

function NoLicensePanel({
  trialDays,
  priceStr,
  priceInCents,
  claiming,
  error,
  onStartTrial,
  onBuy,
}: {
  trialDays: number;
  priceStr: string;
  priceInCents: number;
  claiming: boolean;
  error: string | null;
  onStartTrial: () => void;
  onBuy: () => void;
}) {
  const hasTrial = trialDays > 0;
  const isPaid = priceInCents > 0;
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold">Get access</h2>
      <p className="mb-6 text-sm leading-relaxed text-white/60">
        {hasTrial ? (
          <>
            Start a {trialDays}-day free trial to test the full desktop app,
            or purchase a permanent one-time license now. Either path gives
            you an activation key and unlocks the Windows download below.
          </>
        ) : (
          <>
            Admin-only shortcut: press <em>Grant test license</em> to mint a
            real, permanent license row for your account without going
            through Stripe. Use it to exercise the license → download →
            activation loop end-to-end. The button is wired to{" "}
            <code className="rounded bg-white/10 px-1 font-mono text-xs">
              /api/license/test-grant
            </code>{" "}
            (admin-gated).
          </>
        )}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {hasTrial && (
          <TrialButton trialDays={trialDays} claiming={claiming} onClick={onStartTrial} />
        )}
        {isPaid && (
          <BuyButton priceStr={priceStr} claiming={claiming} onClick={onBuy} />
        )}
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function TrialButton({
  trialDays,
  claiming,
  onClick,
}: {
  trialDays: number;
  claiming: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={claiming}
      className="gap-2 rounded-full bg-white px-6 text-black hover:bg-white/90"
    >
      {claiming ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Starting…
        </>
      ) : (
        <>
          <Clock className="h-4 w-4" />
          Start {trialDays}-day free trial
        </>
      )}
    </Button>
  );
}

function BuyButton({
  priceStr,
  claiming,
  onClick,
}: {
  priceStr: string;
  claiming: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={claiming}
      className="gap-2 rounded-full bg-white px-6 text-black hover:bg-white/90"
    >
      {claiming ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Granting…
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Grant test license — {priceStr}
        </>
      )}
    </Button>
  );
}

function TrialActivePanel({
  license,
  productName,
  priceStr,
  copied,
  onCopy,
  onBuy,
}: {
  license: LicenseInfo;
  productName: string;
  priceStr: string;
  copied: boolean;
  onCopy: () => void;
  onBuy: () => void;
}) {
  const daysLeft = license.trial_ends_at ? daysRemaining(license.trial_ends_at) : 0;
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
          <Clock className="h-4 w-4" />
          Trial · {daysLeft} day{daysLeft === 1 ? "" : "s"} remaining
        </div>
        <Button
          size="sm"
          onClick={onBuy}
          className="gap-1.5 rounded-full bg-white px-5 text-black hover:bg-white/90"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Upgrade — {priceStr}
        </Button>
      </div>
      <LicenseKeyRow
        licenseKey={license.license_key}
        copied={copied}
        onCopy={onCopy}
        note={`Enter this key inside ${productName} after installation.`}
      />
    </div>
  );
}

function TrialExpiredPanel({
  productName,
  priceStr,
  onBuy,
}: {
  productName: string;
  priceStr: string;
  onBuy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.05] p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-400">
          <AlertTriangle className="h-4 w-4" />
          Trial expired
        </div>
        <Button
          size="sm"
          onClick={onBuy}
          className="gap-1.5 rounded-full bg-white px-5 text-black hover:bg-white/90"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Purchase — {priceStr}
        </Button>
      </div>
      <p className="text-sm text-white/60">
        Purchase to keep using {productName}. Your existing license key will be
        upgraded automatically.
      </p>
    </div>
  );
}

function PermanentPanel({
  license,
  productName,
  copied,
  onCopy,
}: {
  license: LicenseInfo;
  productName: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5">
      <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        Licensed · Full version
      </div>
      <LicenseKeyRow
        licenseKey={license.license_key}
        copied={copied}
        onCopy={onCopy}
        note={`Enter this key inside ${productName} after installation.`}
      />
    </div>
  );
}

function DownloadPanel({
  windowsFile,
  windowsSizeBytes,
  downloading,
  onDownload,
}: {
  windowsFile: string;
  windowsSizeBytes: number;
  downloading: boolean;
  onDownload: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="mb-4 text-sm font-medium text-white/60">Download</p>
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Windows</p>
          <p className="truncate text-xs text-white/50">
            {formatMB(windowsSizeBytes)} · {windowsFile}
          </p>
        </div>
        <Button
          onClick={onDownload}
          disabled={downloading}
          size="sm"
          className="gap-1.5 rounded-full bg-white px-5 text-black hover:bg-white/90"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download
            </>
          )}
        </Button>
      </div>
      <p className="mt-4 text-xs text-white/40">
        The download endpoint verifies your license before streaming the file.
        If activation fails after install, sign back in and copy the key from
        this page again.
      </p>
    </div>
  );
}

