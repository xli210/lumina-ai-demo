import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { BeforeAfterSlider } from "@/app/components/before-after-slider";
import { BLOG_POSTS } from "@/lib/blog-posts";
import {
  IMAGE_EDIT_NAME,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_PRICE_USD_TEXT,
  IMAGE_EDIT_TOOLS,
  IMAGE_EDIT_URL,
} from "@/lib/image-edit-facts";
import { IMAGE_EDIT_EXAMPLES } from "@/lib/image-edit-examples";
import { IMAGE_EDIT_USE_CASES, getUseCase } from "@/lib/image-edit-use-cases";

/**
 * /use-cases/<slug>: one page per audience for Nano ImageEdit 2.0 Online.
 *
 * Public and indexable. The editor itself is behind sign-in at
 * /image-edit/launch. Content comes from lib/image-edit-use-cases.ts, prices
 * and tool behaviour from lib/image-edit-facts.ts, and the examples are real
 * edits from lib/image-edit-examples.ts.
 */

interface Props {
  params: Promise<{ slug: string }>;
}

const LAUNCH = "/image-edit/launch";
const abs = (path: string) => `https://nanopocket.ai${path}`;

export async function generateStaticParams() {
  return IMAGE_EDIT_USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) return {};
  const lead = IMAGE_EDIT_EXAMPLES.find((e) => e.id === u.exampleIds[0]);
  const url = abs(`/use-cases/${u.slug}`);
  return {
    title: u.title,
    description: u.description,
    keywords: [...u.searchPhrases, IMAGE_EDIT_NAME],
    alternates: { canonical: `/use-cases/${u.slug}` },
    openGraph: {
      type: "website",
      url,
      title: `${u.title} | ${IMAGE_EDIT_NAME}`,
      description: u.description,
      ...(lead ? { images: [{ url: abs(lead.after), width: lead.width, height: lead.height, alt: lead.alt }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${u.title} | ${IMAGE_EDIT_NAME}`,
      description: u.description,
      ...(lead ? { images: [abs(lead.after)] } : {}),
    },
  };
}

const eyebrow = "mb-3 text-sm font-medium uppercase tracking-widest text-primary";
const h2 = "mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl";
const lede = "max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) notFound();

  const url = abs(`/use-cases/${u.slug}`);
  const examples = u.exampleIds
    .map((id) => IMAGE_EDIT_EXAMPLES.find((e) => e.id === id))
    .filter((e): e is (typeof IMAGE_EDIT_EXAMPLES)[number] => Boolean(e));
  const tools = u.toolIds
    .map((id) => IMAGE_EDIT_TOOLS.find((t) => t.id === id))
    .filter((t): t is (typeof IMAGE_EDIT_TOOLS)[number] => Boolean(t));
  const guides = u.guideSlugs
    .map((g) => BLOG_POSTS.find((p) => p.slug === g))
    .filter((p): p is (typeof BLOG_POSTS)[number] => Boolean(p));
  const others = IMAGE_EDIT_USE_CASES.filter((o) => o.slug !== u.slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: u.title,
      description: u.description,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
      about: { "@type": "SoftwareApplication", "@id": `${IMAGE_EDIT_URL}#software`, name: IMAGE_EDIT_NAME, url: IMAGE_EDIT_URL },
      ...(examples[0] ? { primaryImageOfPage: abs(examples[0].after) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: u.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
        { "@type": "ListItem", position: 2, name: IMAGE_EDIT_NAME, item: IMAGE_EDIT_URL },
        { "@type": "ListItem", position: 3, name: u.name, item: url },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
      <Navbar />

      <section className="px-6 pb-14 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className={eyebrow}>{u.eyebrow}</p>
          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{u.h1}</h1>
          {u.intro.map((p) => (
            <p key={p} className={`${lede} mx-auto mb-4`}>
              {p}
            </p>
          ))}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href={LAUNCH} className={primaryButton}>
              Open the editor <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#examples" className={textLink}>
              See real examples ↓
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            {IMAGE_EDIT_PRICE_CREDITS} credits ({IMAGE_EDIT_PRICE_USD_TEXT}) per edit · free credits for new accounts ·
            failed edits refunded · no subscription
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Why it fits</p>
          <h2 className={h2}>What matters for this work.</h2>
          <ul className="mt-6 space-y-3">
            {u.why.map((w) => (
              <li key={w} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="examples" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className={eyebrow}>Real results</p>
            <h2 className={h2}>Drag to compare. Every one is a real edit.</h2>
            <p className={`${lede} mx-auto`}>
              Each pair is a photo edited with the instruction under it, unretouched. Where the editor reports a
              percentage, that is how much of the image it says changed.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {examples.map((e, i) => (
              <figure
                key={e.id}
                className={`glass-strong overflow-hidden rounded-3xl border border-primary/10 ${
                  i === examples.length - 1 && examples.length % 2 === 1 ? "md:col-span-2" : ""
                }`}
              >
                <BeforeAfterSlider before={e.before} after={e.after} alt={e.alt} width={e.width} height={e.height} />
                <figcaption className="p-5 sm:p-6">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/image-edit#${e.toolId}`}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {e.toolName}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {e.editedPct !== undefined
                        ? `${e.editedPct}% of the image changed · the rest identical`
                        : "Changes the whole photo"}
                    </span>
                  </div>
                  <p className="mb-2 text-sm font-medium text-foreground">&ldquo;{e.prompt}&rdquo;</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Photo:{" "}
                    <a href={e.credit.url} target="_blank" rel="noopener noreferrer" className={textLink}>
                      {e.credit.title}
                    </a>
                    , {e.credit.license}.
                    {e.credit.license.startsWith("CC BY-SA") && " The edited version is shared under the same licence."}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <p className={eyebrow}>Tools for this</p>
          <h2 className={h2}>Which tool to use.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {tools.map((t) => (
              <div key={t.id} className="glass-strong rounded-3xl border border-primary/10 p-5">
                <h3 className="mb-1 text-base font-semibold text-foreground">{t.name}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{t.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {t.scope === "region"
                    ? "Everything outside the edited area stays identical."
                    : "Changes the whole photo, so it is not pixel-identical."}
                </p>
                <Link href={`/image-edit#${t.id}`} className={`${textLink} mt-3 inline-block text-sm`}>
                  More about {t.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Honest limits</p>
          <h2 className={h2}>Read this before you rely on it.</h2>
          <ul className="mt-6 space-y-3">
            {u.limits.map((l) => (
              <li key={l} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Questions</p>
          <h2 className={h2}>Frequently asked.</h2>
          <div className="mt-6 divide-y divide-border rounded-3xl border border-primary/10">
            {u.faq.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  <h3 className="text-base">{f.q}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <p className={eyebrow}>Keep reading</p>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Guides and the full tool</h2>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <Link href="/image-edit" className={textLink}>
                  {IMAGE_EDIT_NAME}: all eight tools, key facts and FAQ
                </Link>
              </li>
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/blog/${g.slug}`} className={textLink}>
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={eyebrow}>Other uses</p>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Built for other work too</h2>
            <ul className="space-y-3 text-sm sm:text-base">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/use-cases/${o.slug}`} className={textLink}>
                    {o.name}
                  </Link>
                  <span className="text-muted-foreground"> · {o.whoFor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="glass-strong mx-auto max-w-3xl rounded-3xl border border-primary/10 p-8 text-center sm:p-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Try it on your own photo.</h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground sm:text-base">
            Sign in, drop in a photo and describe the change. {IMAGE_EDIT_PRICE_CREDITS} credits (
            {IMAGE_EDIT_PRICE_USD_TEXT}) per edit; an edit that fails costs nothing.
          </p>
          <Link href={LAUNCH} className={primaryButton}>
            Open the editor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
