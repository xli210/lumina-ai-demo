import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Map raw Supabase/PKCE errors to user-friendly messages.
 */
function friendlyCallbackError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("pkce") || lower.includes("code verifier"))
    return "Your sign-in link is no longer valid. This can happen if you opened it in a different browser. Please try signing in again.";
  if (lower.includes("expired"))
    return "Your link has expired. Please try again.";
  if (lower.includes("already been used") || lower.includes("already used"))
    return "This link has already been used. Please sign in or request a new link.";
  if (lower.includes("rate limit") || lower.includes("too many"))
    return "Too many attempts. Please wait a few minutes and try again.";
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If Supabase sent an error directly (e.g. access_denied)
  if (errorParam) {
    const msg = friendlyCallbackError(errorDescription || errorParam);
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(msg)}`
    );
  }

  // Prevent open-redirect attacks: only allow relative paths on this origin
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    const msg = friendlyCallbackError(error.message);
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(msg)}`
    );
  }

  // No code and no error — shouldn't happen, redirect to login
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent(
      "Invalid authentication link. Please try signing in again."
    )}`
  );
}
