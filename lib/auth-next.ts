/**
 * Where to send someone after they sign in or sign up.
 *
 * Middleware sends an anonymous visitor to /auth/login?next=<where they were
 * going>, but the login and sign-up flows used to drop `next`: email login,
 * Google, GitHub and the email-confirmation link all ended at /account. A
 * visitor who clicked "Open the editor" signed up and landed on a settings
 * page, and the welcome credits are only granted when the tool page loads, so
 * they never arrived. Keep `next` through the whole round trip.
 *
 * OAuth and the confirmation email leave the site, so `next` is also kept in a
 * short-lived cookie rather than in the redirect URL: Supabase checks the
 * redirect URL against an allow-list, and a changed query string can make it
 * fall back to the Site URL and break the sign-in.
 */

export const NEXT_COOKIE = "np_next";
/** An hour: long enough to find the confirmation email and click it. */
export const NEXT_COOKIE_MAX_AGE_S = 60 * 60;

/** Same-origin relative paths only, and never back into the auth pages. */
export function safeNext(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return null;
  if (v.length > 300 || /[\u0000-\u001f]/.test(v)) return null;
  if (v === "/auth" || v.startsWith("/auth/")) return null;
  return v;
}
