"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REFERRAL_FRIEND_CREDITS, REFERRAL_REWARD_CREDITS } from "@/lib/referral";

/** The invite link, with copy and (on phones) the system share sheet. */
export function InviteFriends({
  link,
  signups,
  rewarded,
}: {
  link: string;
  signups: number;
  rewarded: number;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  // Read after mount so the server render and the first client render agree.
  useEffect(() => setCanShare(typeof navigator.share === "function"), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the field is selectable by hand.
    }
  }

  async function share() {
    try {
      await navigator.share({
        title: "NanoPocket",
        text: "AI face swap for photos and videos. Sign up free with my link:",
        url: link,
      });
    } catch {
      // Cancelled.
    }
  }

  return (
    <section id="invite" className="mb-8 rounded-2xl border border-border/60 bg-muted/30 p-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Gift className="h-5 w-5 text-primary" /> Invite friends, get {REFERRAL_REWARD_CREDITS} credits each
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Share your link. A friend who opens a new account through it gets the usual free sign-up credits,
        and when they first buy credits they get {REFERRAL_FRIEND_CREDITS} extra and you get{" "}
        {REFERRAL_REWARD_CREDITS}. One reward per friend; accounts opened on your own browser or network
        do not count.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="font-mono text-sm" />
        <Button type="button" onClick={copy} className="shrink-0">
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        {canShare && (
          <Button type="button" variant="outline" onClick={share} className="shrink-0">
            <Share2 className="mr-1.5 h-4 w-4" /> Share
          </Button>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {signups} friend{signups === 1 ? "" : "s"} signed up · {rewarded} rewarded
      </p>
    </section>
  );
}
