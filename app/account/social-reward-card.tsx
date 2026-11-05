"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitSocialPost } from "@/app/actions/social-reward";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORM_LABELS, SOCIAL_REWARD_CREDITS, type SocialRejectReason, type SocialSubmitError } from "@/lib/social-reward";
import { START_PATH } from "@/lib/start-tools";

const REASON_KEYS = {
  not_found: "reasonNotFound",
  disclosure: "reasonDisclosure",
  off_topic: "reasonOffTopic",
  rules: "reasonRules",
} as const satisfies Record<SocialRejectReason, string>;

const ERROR_KEYS = {
  invalid: "errorInvalid",
  platform: "errorPlatform",
  reddit: "errorReddit",
  used: "errorUsed",
  done: "errorDone",
  not_eligible: "errorNotEligible",
  failed: "errorFailed",
} as const satisfies Record<SocialSubmitError, string>;

/** Paste a link to a public post about NanoPocket; credits follow once someone has checked it. */
export function SocialRewardCard({
  status,
  url,
  rejectReason,
  triesLeft,
  eligible,
}: {
  status: "none" | "pending" | "approved" | "rejected";
  url: string | null;
  rejectReason: SocialRejectReason | null;
  triesLeft: number;
  eligible: boolean;
}) {
  const t = useTranslations("Ui.socialReward");
  const router = useRouter();
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SocialSubmitError | null>(null);
  const [copied, setCopied] = useState(false);
  const credits = SOCIAL_REWARD_CREDITS;
  const canSubmit = status === "none" || (status === "rejected" && triesLeft > 0);

  async function copyDisclosure() {
    try {
      await navigator.clipboard.writeText(t("disclosure"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the text is selectable by hand.
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const result = await submitSocialPost(link).catch(() => ({ error: "failed" as const }));
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setLink("");
    router.refresh();
  }

  return (
    <section id="post-reward" className="mb-8 rounded-2xl border border-border/60 bg-muted/30 p-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Megaphone className="h-5 w-5 text-primary" /> {t("title", { credits })}
      </h2>

      {status === "approved" ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{t("approved", { credits })}</p>
      ) : status === "pending" ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("pending")}{" "}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary hover:underline">
              {url}
            </a>
          )}
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{t("intro", { credits })}</p>
          <ul className="mb-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>{t("ruleReal")}</li>
            <li>{t("ruleDisclose")}</li>
            <li>{t("ruleFaces")}</li>
            <li>{t("rulePlatforms", { platforms: Object.values(SOCIAL_PLATFORM_LABELS).join(", ") })}</li>
          </ul>
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
            <span className="flex-1 text-sm text-foreground">{t("disclosure")}</span>
            <Button type="button" size="sm" variant="ghost" onClick={copyDisclosure}>
              {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? t("copied") : t("copy")}
            </Button>
          </div>

          {status === "rejected" && rejectReason && (
            <p className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {t("rejected", { reason: t(REASON_KEYS[rejectReason]) })} {canSubmit ? t("triesLeft", { tries: triesLeft }) : t("noTriesLeft")}
            </p>
          )}

          {!eligible ? (
            <p className="text-sm text-muted-foreground">
              {t("needUse")}{" "}
              <Link href={START_PATH} className="font-medium text-primary hover:underline">
                {t("seeTools")}
              </Link>
            </p>
          ) : canSubmit ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <Label htmlFor="post-link" className="mb-2 block text-foreground">
                {t("linkLabel")}
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="post-link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://"
                  required
                  maxLength={600}
                  disabled={busy}
                />
                <Button type="submit" className="shrink-0" disabled={busy || !link.trim()}>
                  {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  {t("submit")}
                </Button>
              </div>
              {error && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {t(ERROR_KEYS[error])}
                </p>
              )}
            </form>
          ) : null}
        </>
      )}
    </section>
  );
}
