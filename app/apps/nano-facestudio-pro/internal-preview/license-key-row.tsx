"use client";

import { Check, Copy, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Displays a license key with a "Copy" button and a small explanatory
 * note underneath. Shared by TrialActivePanel and PermanentPanel.
 */
export function LicenseKeyRow({
  licenseKey,
  copied,
  onCopy,
  note,
}: {
  licenseKey: string;
  copied: boolean;
  onCopy: () => void;
  note: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-white/40">
        License key — save this
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <code className="rounded-md bg-white/10 px-3 py-2 font-mono text-base font-semibold tracking-wider">
          {licenseKey}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="gap-1.5 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-white/50">
        <Key className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {note}
      </p>
    </div>
  );
}
