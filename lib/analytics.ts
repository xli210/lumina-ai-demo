/**
 * Google Analytics 4 events, sent from the browser through the gtag snippet in
 * app/layout.tsx. Safe to call anywhere: without gtag (blocked, not loaded, server
 * render) it does nothing and never throws, so tracking can never break a page.
 *
 * Why this exists: GA4 showed zero key events, so there was no way to tell which
 * pages and search terms lead to a sign-up, a license, or a purchase. The names
 * below are GA4's recommended events, so reports understand them without setup:
 *
 *   sign_up        a new account's first sign-in (app/components/analytics-events.tsx)
 *   generate_lead  a desktop-app license claimed (app/download/app-cards.tsx)
 *   begin_checkout a credit pack checkout opened (app/credits/credit-console.tsx)
 *   purchase       a credit pack paid, verified on the server (app/credits/track-purchase.tsx)
 *
 * Mark them as key events in GA4 (Admin > Events) so they count as conversions.
 */

type Value = string | number | boolean | undefined;
export type EventParams = Record<string, Value | Array<Record<string, Value>>>;

export function trackEvent(name: string, params: EventParams = {}): void {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") gtag("event", name, params);
  } catch {
    /* tracking must never break the page */
  }
}

/** Run `fn` once per browser for this key, so a reload or re-render does not count twice. */
export function once(key: string, fn: () => void): void {
  try {
    if (localStorage.getItem(key) === "1") return;
    localStorage.setItem(key, "1");
  } catch {
    // Storage blocked: skip rather than risk counting the same thing on every visit.
    return;
  }
  fn();
}
