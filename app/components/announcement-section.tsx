"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ThumbsUp,
  ThumbsDown,
  ScanFace,
  Wand2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  DEMOS as REGISTRY,
  demoRedirectPath,
  isUnderMaintenance,
} from "@/lib/demos";
import { FACESTUDIO_MAX_FACES } from "@/lib/facestudio";
import { FACE_SWAP_CREDITS } from "@/lib/face-studio-facts";
import {
  IMAGEEDIT_CREDITS_PER_EDIT,
  IMAGEEDIT_NAME,
} from "@/lib/imageedit";

/*
 * The homepage "try it" section.
 *
 * Design rules, so it stays consistent with the rest of the page:
 *   - semantic tokens only (foreground, muted-foreground, primary, border);
 *     one accent colour, the site's blue, and no gradients of its own;
 *   - cards use the same `glass-strong rounded-3xl` surface as the pricing
 *     section, with the same eyebrow / heading / lede rhythm above them;
 *   - products that work today get the space; demos that are offline get a
 *     single quiet line each, so the page never advertises what cannot be used.
 *
 * Which demos are offline comes from lib/demos.ts, not from this file.
 */

type Vote = "like" | "dislike";

const FACESTUDIO_ID = "image-faceswap-pro"; // feedback id; keep stable for vote history

const FACESTUDIO_POINTS = [
  `Up to ${FACESTUDIO_MAX_FACES} faces in one photo`,
  "Whole-head swap",
  "Keep hair, hands and glasses",
  "Full resolution, no watermark",
];

const IMAGEEDIT_POINTS = [
  "Add, remove or replace objects",
  "Change the text on signs",
  "Relight, restyle, change the season",
  "Everything else stays pixel-identical",
];

const PRO_POINTS = [
  "Multi-face swap",
  "Mask & expression edit",
  "Face Vivid & upscale",
  "Light adjust & crop",
];

/** Demos that are not online yet, shown as one compact line each. */
const SOON = [
  {
    registryId: "video" as const,
    title: "Video FaceSwap Pro",
    description: "Face swap on video clips with temporal consistency.",
    icon: Video,
  },
  {
    registryId: "vivid" as const,
    title: "NanoFace Vivid",
    description: "Restores natural skin detail on over-smoothed AI portraits.",
    icon: Wand2,
  },
].map((d) => ({
  ...d,
  offline: isUnderMaintenance(REGISTRY.find((r) => r.id === d.registryId)!),
  href: demoRedirectPath(d.registryId),
}));

/** The pill above a card title. Same shape as the pricing section's. */
function Pill({
  children,
  live = false,
}: {
  children: React.ReactNode;
  live?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {live && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
      )}
      {children}
    </span>
  );
}

function PointList({ points }: { points: string[] }) {
  return (
    <ul className="space-y-2.5">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-3 text-sm text-foreground">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-3 w-3 text-primary" />
          </span>
          {point}
        </li>
      ))}
    </ul>
  );
}

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30";
const textLink =
  "inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80";

/** A product that works today. Both online products use this one layout. */
function ProductCard({
  icon: Icon,
  pill,
  live,
  title,
  lede,
  points,
  priceLine,
  cta,
  learnMore,
  children,
}: {
  icon: typeof Wand2;
  pill: string;
  live?: boolean;
  title: string;
  lede: string;
  points: string[];
  priceLine: string;
  cta: { href: string; label: string };
  learnMore: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-strong flex h-full flex-col rounded-3xl border border-primary/10 p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Pill live={live}>{pill}</Pill>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {lede}
      </p>

      <PointList points={points} />

      <div className="mt-auto pt-8">
        <p className="mb-4 text-xs text-muted-foreground">{priceLine}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButton}
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link href={learnMore.href} className={textLink}>
            {learnMore.label}
            <span aria-hidden>→</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

/** The paid desktop bundle: one wide card under the two online products. */
function ProSpotlight() {
  return (
    <div className="glass-strong rounded-3xl border border-primary/10 p-6 sm:p-8 md:p-10">
      <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-12">
        <div>
          <div className="mb-5">
            <Pill>Desktop · Windows now</Pill>
          </div>
          <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Nano FaceStudio Pro 1.0
          </h3>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The full local bundle: seven face-editing tools on the same
            diffusion identity stack, every model running on your own GPU.
            Buy once, keep it for good.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {PRO_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </span>
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="md:border-l md:border-border md:pl-12">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-foreground">
              $49.90
            </span>
            <span className="text-lg text-muted-foreground line-through">
              $69.90
            </span>
          </div>
          <p className="mb-6 text-xs text-muted-foreground">
            Launch price through 2026-10-31 · one-time · macOS to follow
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/download#nano-facestudio-pro" className={primaryButton}>
              Buy for Windows
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/apps/nano-facestudio-pro" className={textLink}>
              See the feature tour
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Demos that are not online: one quiet line each, nothing to click. */
function ComingSoon() {
  return (
    <div className="mt-8">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Also in the works
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SOON.map(({ title, description, icon: Icon, offline, href }) => {
          const body = (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {offline ? "Coming soon" : "Live"}
                  </span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {description}
                </span>
              </span>
            </>
          );
          const cls =
            "flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card/40 px-4 py-3";
          return offline ? (
            <div key={title} className={cls}>
              {body}
            </div>
          ) : (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cls} transition-colors hover:border-primary/30`}
            >
              {body}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function FeedbackBlock({
  isLoggedIn,
  existingVote,
  onSubmit,
}: {
  isLoggedIn: boolean;
  existingVote: Vote | null;
  onSubmit: (vote: Vote) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState<Vote | null>(null);

  async function handle(vote: Vote) {
    if (existingVote || submitting) return;
    setSubmitting(vote);
    try {
      await onSubmit(vote);
    } finally {
      setSubmitting(null);
    }
  }

  if (!isLoggedIn) return null;

  if (existingVote) {
    return (
      <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        {existingVote === "like" ? (
          <ThumbsUp className="h-3.5 w-3.5 text-primary" />
        ) : (
          <ThumbsDown className="h-3.5 w-3.5" />
        )}
        {existingVote === "like"
          ? "Thanks for the thumbs up. We'll keep building."
          : "Thanks for the honest feedback. We're working on it."}
      </p>
    );
  }

  const vote =
    "flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="mt-5 flex items-center gap-3">
      <p className="shrink-0 text-xs text-muted-foreground">Tried it?</p>
      <button
        type="button"
        onClick={() => handle("like")}
        disabled={!!submitting}
        aria-label="Like this demo"
        className={vote}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        {submitting === "like" ? "Saving..." : "Like"}
      </button>
      <button
        type="button"
        onClick={() => handle("dislike")}
        disabled={!!submitting}
        aria-label="Dislike this demo"
        className={vote}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
        {submitting === "dislike" ? "Saving..." : "Dislike"}
      </button>
    </div>
  );
}

export function AnnouncementSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [votes, setVotes] = useState<Record<string, Vote>>({});

  const refreshVotes = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { votes?: Record<string, Vote> };
      setVotes(data.votes ?? {});
    } catch {
      // best-effort: ignore network errors
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) void refreshVotes();
    });
  }, [refreshVotes]);

  const submitVote = useCallback(
    async (demoId: string, vote: Vote) => {
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demo_id: demoId, vote }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          status?: string;
        };

        if (res.ok) {
          setVotes((prev) => ({ ...prev, [demoId]: vote }));
          toast.success(
            vote === "like" ? "Thanks for the thumbs up!" : "Thanks for the feedback."
          );
          return;
        }

        if (res.status === 409) {
          toast.error(data.error ?? "You've already voted for this demo.");
          await refreshVotes();
          return;
        }
        if (res.status === 401) {
          toast.error("Please sign in to submit feedback.");
          return;
        }
        toast.error(data.error ?? "Could not save feedback. Please try again.");
      } catch {
        toast.error("Network error. Please try again.");
      }
    },
    [refreshVotes]
  );

  return (
    <section id="announcement" className="relative scroll-mt-24 px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute -bottom-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Try it now
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Start creating in your browser.
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Face swap and photo editing on NanoPocket&apos;s GPUs. No install,
            no subscription, and free credits to get you started.
          </p>
          <Link href="/docs/face-swap-pipeline" className={`mt-4 ${textLink}`}>
            How our diffusion face-swap pipeline works
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ProductCard
            icon={ScanFace}
            pill="Live"
            live
            title="Nano FaceStudio Online"
            lede="Swap faces, or a whole head, in a photo. Diffusion-grade identity at the full resolution you upload."
            points={FACESTUDIO_POINTS}
            priceLine={`${FACE_SWAP_CREDITS} credits per face`}
            cta={{ href: demoRedirectPath("image"), label: "Try Nano FaceStudio Online" }}
            learnMore={{ href: "/face-studio", label: "Learn more" }}
          >
            <FeedbackBlock
              isLoggedIn={isLoggedIn}
              existingVote={votes[FACESTUDIO_ID] ?? null}
              onSubmit={(vote) => submitVote(FACESTUDIO_ID, vote)}
            />
          </ProductCard>

          <ProductCard
            icon={Wand2}
            pill="New"
            title={IMAGEEDIT_NAME}
            lede="Describe the change and get your photo back at full resolution. Add, remove, replace, restyle or restore."
            points={IMAGEEDIT_POINTS}
            priceLine={`${IMAGEEDIT_CREDITS_PER_EDIT} credits per edit`}
            cta={{ href: "/image-edit/launch", label: "Open the editor" }}
            learnMore={{ href: "/image-edit", label: "Learn more" }}
          />
        </div>

        <div className="mt-6">
          <ProSpotlight />
        </div>

        <ComingSoon />
      </div>
    </section>
  );
}
