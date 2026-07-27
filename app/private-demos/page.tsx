import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  ImageIcon,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * /private-demos
 *
 * Internal test index for the two API-proxied demo pages
 * (NanoFace Vivid + Face Studio face-swap). Ship-behind-admin-gate
 * equivalent of the /internal-preview pattern:
 *
 *   - noindex, nofollow (search-engine invisible)
 *   - robots.txt disallow (defense in depth)
 *   - anonymous visitors redirected to /auth/login
 *   - non-admin authenticated users redirected to /account
 *   - never linked from the public navbar, footer, sitemap, or /face-swap
 *
 * The two demo apps themselves live under /private-demos/facevivid and
 * /private-demos/faceswap and are served as static HTML/JS/CSS from
 * public/private-demos/**; both call our same-origin API proxy under
 * /api/private-demos/**, which injects the upstream X-API-Key server-side.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private demo preview \u2014 admin only",
  description:
    "Internal preview of the API-driven face-swap + face-vivid demo pages. Not indexed, not linked from any public page.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: undefined },
};

async function assertAdmin(loginNext: string): Promise<{ email: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(loginNext)}`);
  }
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    redirect("/account");
  }
  return { email: user.email ?? null };
}

interface DemoCardProps {
  href: string;
  title: string;
  upstream: string;
  blurb: string;
  bullets: string[];
  Icon: typeof ImageIcon;
  accent: "violet" | "sky";
}

function DemoCard({
  href,
  title,
  upstream,
  blurb,
  bullets,
  Icon,
  accent,
}: DemoCardProps) {
  const accentBg =
    accent === "violet"
      ? "from-violet-500/20 via-violet-500/5 to-transparent"
      : "from-sky-500/20 via-sky-500/5 to-transparent";
  const accentRing =
    accent === "violet" ? "ring-violet-400/25" : "ring-sky-400/25";
  const accentChip =
    accent === "violet"
      ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
      : "border-sky-400/30 bg-sky-500/15 text-sky-200";
  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-b ${accentBg} p-6 ring-1 ${accentRing} sm:p-8`}
    >
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${accentChip}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
          proxying \u2192 {upstream}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-white/70">{blurb}</p>
      <ul className="space-y-1.5 text-sm text-white/80">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        className="mt-auto w-full gap-2 rounded-full bg-white text-black hover:bg-white/90"
      >
        <Link href={href}>
          Open preview
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export default async function PrivateDemosIndex() {
  const { email } = await assertAdmin("/private-demos");

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 pt-28 pb-16 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(139,92,246,0.10),transparent_60%),radial-gradient(circle_at_20%_120%,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-400">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            Admin preview \u00b7 Not public yet
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            API-driven demo previews
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
            The two demo UIs below no longer redirect users to Cloudflare
            tunnels. Instead they run on nanopocket.ai, calling the upstream
            models through our own <code className="rounded bg-white/10 px-1 font-mono text-xs">/api/private-demos/*</code>{" "}
            proxy which injects the secret <code className="rounded bg-white/10 px-1 font-mono text-xs">X-API-Key</code>{" "}
            server-side and enforces admin auth on every call. Test them
            end-to-end here before we roll the pattern out to /face-swap.
          </p>

          {email && (
            <p className="mt-2 text-xs text-white/40">
              Signed in as <span className="font-mono text-white/70">{email}</span> (admin)
            </p>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <DemoCard
              href="/private-demos/facevivid"
              title="NanoFace Vivid"
              upstream="sagem-julie-personnel-msg.trycloudflare.com"
              blurb="Face-detailer preview. Uploads a single image, runs the vivid pipeline on the upstream GPU, streams the PNG back through the proxy. Full masking + zoom slider is client-side."
              bullets={[
                "5 API routes: run, status, result, feedback, visit",
                "Static demo gallery (16 MB _face_crops assets bundled)",
                "Result up to a few MB \u2014 streamed, not buffered",
              ]}
              Icon={ImageIcon}
              accent="violet"
            />
            <DemoCard
              href="/private-demos/faceswap"
              title="Face Studio \u2014 multi-face swap"
              upstream="paying-colorado-ment-cingular.trycloudflare.com"
              blurb="Full multi-face swap with detection, per-face reference upload, occluder-preserve panels, and manual brush corrections. Uses the v5 API contract."
              bullets={[
                "6 API routes: detect, generate, status, result, feedback, visit",
                "12 virtual-face templates (2 MB WebP, converted from 84 MB PNG)",
                "Client-side masking + brush-back \u2014 no server round-trip",
              ]}
              Icon={Users}
              accent="sky"
            />
          </div>

          <details className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/70">
            <summary className="cursor-pointer text-sm font-medium text-white">
              How this preview is hidden
            </summary>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 leading-relaxed">
              <li>
                <span className="text-white/80">Paths</span>: <code className="rounded bg-white/10 px-1 font-mono text-xs">/private-demos/*</code> + <code className="rounded bg-white/10 px-1 font-mono text-xs">/api/private-demos/*</code>
              </li>
              <li>
                <span className="text-white/80">Search engines</span>: pages emit <code className="rounded bg-white/10 px-1 font-mono text-xs">noindex,nofollow</code>; robots.txt disallows both roots for every user agent.
              </li>
              <li>
                <span className="text-white/80">Sitemap</span>: neither URL is registered.
              </li>
              <li>
                <span className="text-white/80">Navigation</span>: never rendered by the navbar, footer, /face-swap page, or any what&apos;s-new bar. Only reachable by typing this URL directly.
              </li>
              <li>
                <span className="text-white/80">Middleware auth</span>: anonymous visitors on <code className="rounded bg-white/10 px-1 font-mono text-xs">/private-demos/*</code> are bounced to <code className="rounded bg-white/10 px-1 font-mono text-xs">/auth/login</code>; non-admin users are bounced to <code className="rounded bg-white/10 px-1 font-mono text-xs">/account</code>.
              </li>
              <li>
                <span className="text-white/80">API auth</span>: every proxy route re-verifies the admin role before touching the upstream. Bookmarking a proxy URL and hitting it as a non-admin returns 403.
              </li>
              <li>
                <span className="text-white/80">Key handling</span>: <code className="rounded bg-white/10 px-1 font-mono text-xs">X-API-Key</code> lives only in <code className="rounded bg-white/10 px-1 font-mono text-xs">FACEVIVID_API_KEY</code> + <code className="rounded bg-white/10 px-1 font-mono text-xs">FACESWAP_API_KEY</code> env vars, injected server-side on every forward. Never sent to the browser.
              </li>
            </ul>
          </details>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/50">
            <ShieldCheck className="h-4 w-4" />
            <span>To share this preview with another admin, add their profile role to &quot;admin&quot; in Supabase and send them the URL.</span>
          </div>

          <div className="mt-3 text-xs text-white/40">
            Handoff source lives at <code className="rounded bg-white/10 px-1 font-mono">site_handoff&nbsp;2/</code>. See <code className="rounded bg-white/10 px-1 font-mono">docs/private-demos.md</code> for the full env-var + Vercel setup.
          </div>

          <div className="mt-8">
            <Link
              href="https://nanopocket.ai/status"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-white/60 underline underline-offset-4 hover:text-white"
            >
              Upstream demo status <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
