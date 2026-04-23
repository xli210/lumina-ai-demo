"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogIn,
  Image as ImageIcon,
  Video,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Vote = "like" | "dislike";

interface DemoConfig {
  id: string;
  title: string;
  description: string;
  url: string;
  password: string;
  icon: typeof ImageIcon;
  accent: string;
}

const DEMOS: DemoConfig[] = [
  {
    id: "image-faceswap-pro",
    title: "Image FaceSwap Pro",
    description:
      "Higher fidelity, better lighting adaptation, and more natural face swap on photos.",
    url: "https://migration-beach-availability-lawyers.trycloudflare.com/static/index.html",
    password: "nanopocket",
    icon: ImageIcon,
    accent: "indigo",
  },
  {
    id: "video-faceswap-pro",
    title: "Video FaceSwap Pro",
    description:
      "Professional-grade face swap on videos with temporal consistency and smooth motion.",
    url: "https://yacht-surrounding-draft-charity.trycloudflare.com",
    password: "nanopocket-video",
    icon: Video,
    accent: "purple",
  },
];

function FeedbackBlock({
  demoId,
  isLoggedIn,
  existingVote,
  onSubmit,
}: {
  demoId: string;
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

  if (!isLoggedIn) {
    return null;
  }

  if (existingVote) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
        <p className="text-xs text-slate-300">
          {existingVote === "like" ? (
            <>
              <span className="text-emerald-400">Thanks for the thumbs up!</span>{" "}
              We&apos;ll keep building.
            </>
          ) : (
            <>
              <span className="text-rose-400">Got it — thanks for the honest feedback.</span>{" "}
              We&apos;re working on it.
            </>
          )}
        </p>
        {existingVote === "like" ? (
          <ThumbsUp className="h-4 w-4 shrink-0 text-emerald-400" />
        ) : (
          <ThumbsDown className="h-4 w-4 shrink-0 text-rose-400" />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-200">
          Tried it? How was it?
        </p>
        <p className="text-[10px] text-slate-500">One vote per account</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handle("like")}
          disabled={!!submitting}
          aria-label="Like this demo"
          className="group flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/20 transition-all hover:bg-emerald-500/20 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ThumbsUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          {submitting === "like" ? "Saving..." : "Like it"}
        </button>
        <button
          type="button"
          onClick={() => handle("dislike")}
          disabled={!!submitting}
          aria-label="Dislike this demo"
          className="group flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/20 transition-all hover:bg-rose-500/20 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ThumbsDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
          {submitting === "dislike" ? "Saving..." : "Dislike it"}
        </button>
      </div>
    </div>
  );
}

function DemoCard({
  demo,
  isLoggedIn,
  loading,
  existingVote,
  onSubmitVote,
}: {
  demo: DemoConfig;
  isLoggedIn: boolean;
  loading: boolean;
  existingVote: Vote | null;
  onSubmitVote: (demoId: string, vote: Vote) => Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = demo.icon;

  const accentClasses =
    demo.accent === "purple"
      ? {
          badge: "bg-purple-500/10 text-purple-300 ring-purple-500/20",
          iconBg: "from-purple-500 to-fuchsia-500",
          button:
            "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30 text-white",
          numberBg: "bg-purple-500/20 text-purple-300",
          link: "text-purple-400 hover:text-purple-300",
        }
      : {
          badge: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/20",
          iconBg: "from-indigo-500 to-blue-500",
          button:
            "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/30 text-white",
          numberBg: "bg-indigo-500/20 text-indigo-300",
          link: "text-indigo-400 hover:text-indigo-300",
        };

  async function handleCopy() {
    await navigator.clipboard.writeText(demo.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
      <div
        className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${accentClasses.badge}`}
      >
        <Sparkles className="h-3 w-3" />
        Coming Soon
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentClasses.iconBg} text-white shadow-lg`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-white">{demo.title}</h3>
      </div>

      <p className="mb-5 text-sm text-slate-300 leading-relaxed">
        {demo.description}
      </p>

      {isLoggedIn ? (
        <div className="mt-auto flex flex-col gap-4">
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="mb-2 text-xs font-medium text-slate-200">
              How to try it:
            </p>
            <ol className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${accentClasses.numberBg}`}
                >
                  1
                </span>
                <span>Click the button to open the demo server</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${accentClasses.numberBg}`}
                >
                  2
                </span>
                <span>Enter the access password</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${accentClasses.numberBg}`}
                >
                  3
                </span>
                <span>Upload your media and try the Pro model</span>
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <span className="text-xs text-slate-400">Password:</span>
            <code className="flex-1 truncate font-mono text-xs font-bold text-white tracking-wider">
              {showPassword ? demo.password : "••••••••••"}
            </code>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-white transition-colors"
              title={showPassword ? "Hide" : "Show"}
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white transition-colors"
              title="Copy"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <Button
            asChild
            className={`w-full gap-2 rounded-full shadow-lg ${accentClasses.button}`}
          >
            <a href={demo.url} target="_blank" rel="noopener noreferrer">
              Try Pro Demo
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <FeedbackBlock
            demoId={demo.id}
            isLoggedIn={isLoggedIn}
            existingVote={existingVote}
            onSubmit={(vote) => onSubmitVote(demo.id, vote)}
          />
        </div>
      ) : (
        !loading && (
          <div className="mt-auto rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="mb-3 text-xs text-slate-300">
              Sign in to your NanoPocket account to get free access to this demo.
            </p>
            <Button
              asChild
              className="w-full gap-2 rounded-full bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/20"
              size="sm"
            >
              <Link href="/auth/login">
                <LogIn className="h-4 w-4" />
                Sign In to Try Free
              </Link>
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export function AnnouncementSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
      if (user) {
        void refreshVotes();
      }
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
    <section id="announcement" className="relative scroll-mt-24 px-6 py-12">
      <div className="relative mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-6 sm:p-8 md:p-10 shadow-2xl shadow-indigo-500/10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-purple-500/10 blur-[80px]" />
          </div>

          <div className="relative mb-6 text-center md:mb-8">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Try Nano FaceSwap Pro — Free
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base">
              Two professional-grade face swap demos for images and videos. Try
              them online before our local desktop release.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {DEMOS.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                isLoggedIn={isLoggedIn}
                loading={loading}
                existingVote={votes[demo.id] ?? null}
                onSubmitVote={submitVote}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
