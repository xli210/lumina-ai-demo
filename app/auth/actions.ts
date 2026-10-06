"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { NEXT_COOKIE, NEXT_COOKIE_MAX_AGE_S, safeNext } from "@/lib/auth-next";

// ──────────────────────────────────────────────────────────────────
// Site-URL detection
// ──────────────────────────────────────────────────────────────────
async function getSiteUrl(): Promise<string> {
  // 1. Explicit env var (most reliable — ALWAYS set this in Vercel)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  // 2. Derive from the incoming request headers
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || "https";
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`;
    }
  } catch {
    // headers() may fail in some edge contexts
  }

  // 3. Vercel auto-set env var (deployment URL, not custom domain)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 4. Local dev fallback
  return "http://localhost:3000";
}

// ──────────────────────────────────────────────────────────────────
// Friendly error messages  (maps Supabase errors → user-facing text)
// ──────────────────────────────────────────────────────────────────
const ERROR_MAP: Array<{ test: (s: string) => boolean; msg: string }> = [
  { test: (s) => s.includes("rate limit") || s.includes("too many"),
    msg: "Too many attempts. Please wait a few minutes and try again." },
  { test: (s) => s.includes("invalid login"),
    msg: "Incorrect email or password. Please try again." },
  { test: (s) => s.includes("email not confirmed"),
    msg: "Your email hasn't been confirmed yet. Please check your inbox." },
  { test: (s) => s.includes("user already registered"),
    msg: "An account with this email already exists. Try signing in instead." },
  { test: (s) => s.includes("password") && s.includes("at least"),
    msg: "Password must be at least 6 characters." },
  { test: (s) => s.includes("signup is disabled"),
    msg: "Sign-up is currently disabled. Please contact the administrator." },
  { test: (s) => s.includes("provider is not enabled"),
    msg: "This sign-in method is not enabled. Please use a different method." },
];

function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  return ERROR_MAP.find((e) => e.test(lower))?.msg ?? raw;
}

// ──────────────────────────────────────────────────────────────────
// Email / Password Login
// ──────────────────────────────────────────────────────────────────
// Remember where the visitor was going, for the trip through the provider or the
// confirmation email (see lib/auth-next.ts). Clears any stale value when none.
async function rememberNext(raw: unknown): Promise<string | null> {
  const next = safeNext(raw);
  const jar = await cookies();
  if (next) {
    jar.set(NEXT_COOKIE, next, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: NEXT_COOKIE_MAX_AGE_S,
    });
  } else {
    jar.delete(NEXT_COOKIE);
  }
  return next;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/auth/login?error=Please+fill+in+all+fields");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(friendlyError(error.message))}`);
  }

  redirect(safeNext(formData.get("next")) ?? "/account");
}

// ──────────────────────────────────────────────────────────────────
// Email / Password Sign-Up
// ──────────────────────────────────────────────────────────────────
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!email || !password) {
    redirect("/auth/sign-up?error=Please+fill+in+all+fields");
  }

  if (password.length < 6) {
    redirect("/auth/sign-up?error=Password+must+be+at+least+6+characters");
  }

  const siteUrl = await getSiteUrl();
  await rememberNext(formData.get("next"));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        display_name: displayName || email.split("@")[0],
      },
    },
  });

  if (error) {
    redirect(`/auth/sign-up?error=${encodeURIComponent(friendlyError(error.message))}`);
  }

  if (data.user && data.user.identities?.length === 0) {
    redirect(
      "/auth/sign-up?error=" +
        encodeURIComponent(
          "An account with this email already exists. Please sign in instead."
        )
    );
  }

  redirect("/auth/sign-up-success");
}

// ──────────────────────────────────────────────────────────────────
// Forgot Password
// ──────────────────────────────────────────────────────────────────
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    redirect("/auth/forgot-password?error=Please+enter+your+email+address");
  }

  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  if (error) {
    redirect(
      `/auth/forgot-password?error=${encodeURIComponent(friendlyError(error.message))}`
    );
  }

  // Always show success (even if email doesn't exist — prevents email
  // enumeration attacks).  Supabase already does this server-side.
  redirect("/auth/forgot-password?success=true");
}

// ──────────────────────────────────────────────────────────────────
// Google OAuth
// ──────────────────────────────────────────────────────────────────
export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  await rememberNext(next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(friendlyError(error.message))}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/auth/login?error=Google+sign-in+is+not+configured.+Please+contact+the+administrator.");
}

// ──────────────────────────────────────────────────────────────────
// GitHub OAuth
// ──────────────────────────────────────────────────────────────────
export async function signInWithGitHub(next?: string) {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  await rememberNext(next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(friendlyError(error.message))}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/auth/login?error=GitHub+sign-in+is+not+configured.+Please+contact+the+administrator.");
}
