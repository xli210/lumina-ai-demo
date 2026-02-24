"use client";

import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Loading spinner (shared by Suspense fallback & code-exchange)     */
/* ------------------------------------------------------------------ */
function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -left-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      <div className="relative flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main form (needs useSearchParams → must be inside Suspense)       */
/* ------------------------------------------------------------------ */
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // On mount — handle Supabase auth code or verify existing session
  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    if (errorParam) setError(errorParam);

    if (code) {
      // Supabase redirected here with a PKCE auth code — exchange it
      const supabase = createClient();
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: exchangeError }) => {
          if (exchangeError) {
            setError(
              "The password reset link has expired or is invalid. " +
                "Please request a new one."
            );
          }
          setReady(true);
          // Clean the code from the URL (cosmetic)
          window.history.replaceState({}, "", "/auth/reset-password");
        })
        .catch(() => {
          setError("Something went wrong. Please request a new reset link.");
          setReady(true);
        });
    } else {
      // No code — maybe the user arrived via /auth/callback, check session
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setReady(true);
        } else {
          setError(
            "No active session. Please use the password reset link from " +
              "your email, or request a new one."
          );
          setReady(true);
        }
      });
    }
  }, [searchParams]);

  // Handle the hash-fragment flow (implicit mode fallback)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      // Supabase sent recovery tokens as hash fragments — the client
      // library auto-detects this via onAuthStateChange
      const supabase = createClient();
      const { data: listener } = supabase.auth.onAuthStateChange(
        (event) => {
          if (event === "PASSWORD_RECOVERY") {
            setReady(true);
            window.history.replaceState({}, "", "/auth/reset-password");
          }
        }
      );
      return () => listener.subscription.unsubscribe();
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Success — redirect to login
    router.push(
      "/auth/login?message=Password+updated+successfully.+Please+sign+in."
    );
  }

  // Show spinner while exchanging the auth code
  if (!ready) {
    return <LoadingSpinner text="Verifying reset link..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -left-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Lumina AI
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Set new password
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Enter your new password below. It must be at least 6 characters.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
              {error.includes("expired") || error.includes("No active") ? (
                <div className="mt-2">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-primary hover:underline"
                  >
                    Request a new reset link
                  </Link>
                </div>
              ) : null}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-foreground">
                New Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper with Suspense (required for useSearchParams)         */
/* ------------------------------------------------------------------ */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
