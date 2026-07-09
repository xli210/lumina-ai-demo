import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/products";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { TestPanel } from "./test-panel";

/**
 * Internal preview page for Nano FaceStudio Pro 1.0 desktop.
 *
 * This route is intentionally hidden AND admin-gated:
 *   - noindex, nofollow (search-engine invisible)
 *   - NOT registered in app/sitemap.ts
 *   - NOT linked from any component (navbar, footer, download page, whatsnew)
 *   - Disallowed for every user-agent in robots.txt
 *   - Anonymous visitors redirected to /auth/login
 *   - Non-admin authenticated users redirected to /account
 *
 * The URL is one layer of security; the admin role is the other. This is
 * the page from which a real, permanent license can be minted for free
 * via /api/license/test-grant — so only admins should reach it.
 */

export const dynamic = "force-dynamic";

const PRODUCT_ID = "nano-facestudio-pro";
const WINDOWS_FILE = "NanoFaceStudioPro-1.0.8-windows.exe";
const WINDOWS_SIZE_BYTES = 105_247_578;

export const metadata: Metadata = {
  title: "Internal Preview · Nano FaceStudio Pro",
  description:
    "Internal test page for Nano FaceStudio Pro 1.0 desktop. Not linked from anywhere; not indexed.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: undefined },
};

export default async function InternalPreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/auth/login?next=${encodeURIComponent(
        "/apps/nano-facestudio-pro/internal-preview",
      )}`,
    );
  }

  // Admin gate — the test-grant flow mints real permanent licenses without
  // payment, so non-admins have no business on this page even if they know
  // the URL.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    redirect("/account");
  }

  const product = PRODUCTS.find((p) => p.id === PRODUCT_ID);
  if (!product) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-semibold">Product not registered.</h1>
          <p className="mt-3 text-white/60">
            Add {PRODUCT_ID} to lib/products.ts before using this preview page.
          </p>
        </div>
      </main>
    );
  }

  const priceUsd = (product.priceInCents / 100).toFixed(2);

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "radial-gradient(ellipse at 50% 20%, rgba(200, 100, 60, 0.18) 0%, transparent 55%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-400">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            Internal Preview · Do not share
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Nano FaceStudio Pro <span className="text-white/50">1.0.8</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Test-only page. This URL is not indexed by search engines, not
            linked from any public download list, and not registered in the
            sitemap. Only you and anyone you share the exact URL with can
            reach it.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="font-mono text-base font-semibold sm:text-lg">
                ${priceUsd}
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/50">
                Launch price · one-time
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="font-mono text-base font-semibold sm:text-lg">
                Preview online
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/50">
                Free demos at /face-swap
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="font-mono text-base font-semibold sm:text-lg">
                Windows only
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/50">
                macOS build not yet ready
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <TestPanel
              productId={PRODUCT_ID}
              productName={product.name}
              priceInCents={product.priceInCents}
              trialDays={product.trialDays ?? 0}
              windowsFile={WINDOWS_FILE}
              windowsSizeBytes={WINDOWS_SIZE_BYTES}
              userEmail={user.email ?? null}
            />
          </div>

          <details className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/70">
            <summary className="cursor-pointer text-sm font-medium text-white">
              How this preview is hidden
            </summary>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 leading-relaxed">
              <li>
                <span className="text-white/80">Path</span>: <code className="rounded bg-white/10 px-1 font-mono text-xs">/apps/nano-facestudio-pro/internal-preview</code>
              </li>
              <li>
                <span className="text-white/80">Search engines</span>: page emits <code className="rounded bg-white/10 px-1 font-mono text-xs">noindex,nofollow</code>; robots.txt also disallows the path for every user agent.
              </li>
              <li>
                <span className="text-white/80">Sitemap</span>: not registered.
              </li>
              <li>
                <span className="text-white/80">Navigation</span>: no navbar, footer, download page, or whats-new bar links to it.
              </li>
              <li>
                <span className="text-white/80">Auth</span>: anonymous visitors are redirected to <code className="rounded bg-white/10 px-1 font-mono text-xs">/auth/login</code>.
              </li>
              <li>
                <span className="text-white/80">Download gate</span>: the exe is streamed by <code className="rounded bg-white/10 px-1 font-mono text-xs">/api/downloads/[filename]</code>, which requires a valid license row for <code className="rounded bg-white/10 px-1 font-mono text-xs">{PRODUCT_ID}</code>.
              </li>
            </ul>
          </details>
        </div>
      </section>

      <Footer />
    </main>
  );
}
