"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ExternalLink, Eye, EyeOff, Copy, Check, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const DEMO_URL = "https://changeably-overintellectual-raylene.ngrok-free.dev/login";
const ACCESS_PASSWORD = "nanopocket";

export function AnnouncementSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(ACCESS_PASSWORD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="relative px-6 py-12">
      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-8 md:p-12 shadow-2xl shadow-indigo-500/10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-[200px] w-[200px] rounded-full bg-purple-500/10 blur-[80px]" />
          </div>

          <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                Coming Soon
              </div>

              <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Nano FaceSwap Pro
              </h2>

              <p className="mb-6 max-w-lg text-base text-slate-300 leading-relaxed">
                A more powerful, professional-grade face swap model with
                higher fidelity, better lighting adaptation, and more natural results
                than our free version. Try it now on our free online demo server
                before the official release.
              </p>

              {isLoggedIn ? (
                <>
                  <div className="mb-6 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                    <p className="mb-3 text-sm font-medium text-slate-200">
                      How to try it for free:
                    </p>
                    <ol className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">1</span>
                        <span>Click the &quot;Try Pro Demo&quot; button to open the demo server</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">2</span>
                        <span>Enter the access password shown below</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">3</span>
                        <span>Upload your photos and experience the Pro-level face swap</span>
                      </li>
                    </ol>
                  </div>

                  <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
                      <span className="text-xs text-slate-400">Password:</span>
                      <code className="font-mono text-sm font-bold text-white tracking-wider">
                        {showPassword ? ACCESS_PASSWORD : "**********"}
                      </code>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-1 text-slate-400 hover:text-white transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy password"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                !loading && (
                  <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                    <p className="mb-3 text-sm text-slate-300">
                      Sign in to your NanoPocket account to get free access to the Pro demo.
                    </p>
                    <Button
                      asChild
                      className="gap-2 rounded-full bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/20"
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

            <div className="flex shrink-0 flex-col items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="gap-2 rounded-full bg-indigo-500 px-8 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400"
                  >
                    <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                      Try Pro Demo
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <p className="text-xs text-slate-500">
                    Free to try - No download required
                  </p>
                </>
              ) : (
                !loading && (
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 px-6 py-4 ring-1 ring-white/10">
                    <LogIn className="h-6 w-6 text-slate-500" />
                    <p className="text-xs text-slate-500 text-center">
                      Sign in required<br />to access demo
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
