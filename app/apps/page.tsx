import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { PRODUCTS } from "@/lib/products";
import { appReleases } from "@/lib/release-data";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";
import { IMAGE_EDIT_NAME } from "@/lib/image-edit-facts";

/**
 * The catalogue of every desktop app, with its price, latest version and release notes.
 * /apps used to be a 404, so the app pages hung off nothing: nothing linked them together
 * and Search Console reported several of them as crawled but not indexed. Everything here
 * is read from lib/products.ts and lib/release-data.ts, so it cannot drift from the apps.
 */

const TITLE = "Free and Pro Desktop AI Apps for Windows";
const DESCRIPTION =
  "Every NanoPocket desktop app with its price and latest version: free face swap, portrait editing and virtual try-on, plus Pro image and video apps. Runs on your own NVIDIA GPU.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/apps" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket" }], type: "website", url: "https://nanopocket.ai/apps", title: TITLE, description: DESCRIPTION },
};

/** Where each licence id lives: its product page and its release notes. */
const WHERE: Record<string, { page: string; notes: string; line: string }> = {
  "nano-facialedit": {
    page: "/apps/nano-facialedit",
    notes: "nano-facialedit",
    line: "Identity-preserving expression editing and portrait retouching, run offline on your GPU.",
  },
  "nano-faceswap": {
    page: "/apps/nano-faceswap",
    notes: "nano-faceswap",
    line: "Swap faces in photos and videos on your own GPU. Your source media stays on your computer.",
  },
  "nano-image-tryon": {
    page: "/apps/nano-imagetryon",
    notes: "nano-imagetryon",
    line: "Put a garment from a reference photo on a subject, keeping body shape, pose and lighting.",
  },
  "nano-imageedit": {
    page: "/apps/nano-imageedit",
    notes: "nano-imageedit",
    line: "A local Flux.1 image generator and editor: text-to-image and image-to-image on your own GPU.",
  },
  "nano-videoenhance": {
    page: "/apps/nano-videoenhance",
    notes: "nano-videoenhance",
    line: "Upscale, stabilize and enhance video.",
  },
  nnanoimageenh: {
    page: "/apps/nano-imageenh-pro",
    notes: "nano-imageenh",
    line: "Upscale, denoise and restore images.",
  },
  "nano-facestudio-pro": {
    page: "/apps/nano-facestudio-pro",
    notes: "nano-facestudio-pro",
    line: "Face swap, mask edit, expression editing, upscale and light adjust in one desktop app.",
  },
  "nano-videogen": {
    page: "/apps/nano-videogen",
    notes: "nano-videogen",
    line: "Create video from text prompts or images.",
  },
};

const money = (cents: number) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

function AppCard({ id }: { id: string }) {
  const p = PRODUCTS.find((x) => x.id === id);
  const w = WHERE[id];
  if (!p || !w) return null;
  const latest = appReleases.find((a) => a.slug === w.notes)?.releases[0];
  return (
    <div className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-6">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-foreground">
          <Link href={w.page} className="hover:underline">{p.name}</Link>
        </h3>
        <span className="shrink-0 rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground">
          {p.priceInCents === 0 ? "Free" : `${money(p.priceInCents)}, one-time`}
        </span>
      </div>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{w.line}</p>
      <p className="mb-4 text-xs text-muted-foreground">
        {latest ? `Latest: version ${latest.version}, ${latest.date}.` : ""}
        {(p.trialDays ?? 0) > 0 ? ` ${p.trialDays}-day free trial.` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <Link href={w.page} className={textLink}>Details <ArrowRight className="inline h-3.5 w-3.5" /></Link>
        <Link href={`/release-notes/${w.notes}`} className={textLink}>Release notes</Link>
      </div>
    </div>
  );
}

export default function AppsIndex() {
  const free = PRODUCTS.filter((p) => p.priceInCents === 0).map((p) => p.id);
  const pro = PRODUCTS.filter((p) => p.priceInCents > 0).map((p) => p.id);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: "https://nanopocket.ai/apps",
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
      hasPart: PRODUCTS.map((p) => ({
        "@type": "SoftwareApplication",
        name: p.name,
        url: `https://nanopocket.ai${WHERE[p.id]?.page ?? "/apps"}`,
        operatingSystem: "Windows",
        applicationCategory: "MultimediaApplication",
        offers: { "@type": "Offer", price: (p.priceInCents / 100).toFixed(2), priceCurrency: "USD" },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
        { "@type": "ListItem", position: 2, name: "Apps", item: "https://nanopocket.ai/apps" },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <header className="mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Apps</p>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            NanoPocket desktop apps.
          </h1>
          <p className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Face swap, portrait editing, virtual try-on, image and video tools that run on your own NVIDIA GPU on Windows, so your
            photos and videos stay on your computer and nothing is a subscription. Three are free; the Pro apps are a one-time
            licence. Prices and the latest version of each are below, and everything is on the{" "}
            <Link href="/pricing" className={textLink}>pricing page</Link>. Downloads and licence keys are on the{" "}
            <Link href="/download" className={textLink}>download page</Link>.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">Free apps</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {free.map((id) => <AppCard key={id} id={id} />)}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">Pro apps: one-time licence</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pro.map((id) => <AppCard key={id} id={id} />)}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">Prefer the browser?</h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The online tools need nothing installed. They run on NanoPocket&apos;s GPUs, so your upload is processed on NanoPocket&apos;s
            servers, and they are paid per use in credits.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/face-studio" className={textLink}>Nano FaceStudio Online</Link>: photo face swap and head swap, up to six faces.</li>
            <li><Link href="/facestudio-v" className={textLink}>{FACESTUDIO_V_NAME} {FACESTUDIO_V_VERSION}</Link>: video face swap that changes only the person you choose.</li>
            <li><Link href="/image-edit" className={textLink}>{IMAGE_EDIT_NAME}</Link>: edit a photo by describing the change, with every pixel outside the edit kept identical.</li>
          </ul>
        </section>
      </div>
      <Footer />
    </main>
  );
}
