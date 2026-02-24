import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If Supabase sent an error directly (e.g. access_denied)
  if (errorParam) {
    const msg = errorDescription || errorParam;
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
    // Code exchange failed — give a useful message
    const msg =
      error.message.toLowerCase().includes("expired")
        ? "Your link has expired. Please try again."
        : error.message;
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
