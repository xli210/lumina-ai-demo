import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Navbar } from "../../../components/navbar";
import { Footer } from "../../../components/footer";
import { renderMarkdown } from "../../../components/markdown-content";
import { ZH_GUIDES } from "@/lib/zh-guides";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ZH_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = ZH_GUIDES.find((g) => g.slug === slug);
  if (!guide) return {};
  const url = `https://nanopocket.ai/zh-CN/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: {
      canonical: `/zh-CN/guides/${guide.slug}`,
      // The English guide with the same slug, and this one: they point at each other. A guide written
      // only for Chinese searches has no English pair.
      ...(guide.english === false
        ? {}
        : { languages: { en: `https://nanopocket.ai/blog/${guide.slug}`, "zh-CN": url } }),
    },
    openGraph: { type: "article", url, title: guide.title, description: guide.description, publishedTime: guide.date, locale: "zh_CN", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket" }] },
  };
}

export default async function ZhGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = ZH_GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();
  const url = `https://nanopocket.ai/zh-CN/guides/${guide.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      inLanguage: "zh-CN",
      datePublished: guide.date,
      dateModified: guide.date,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
      publisher: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai/zh-CN" },
        { "@type": "ListItem", position: 2, name: "中文指南", item: "https://nanopocket.ai/zh-CN/guides" },
        { "@type": "ListItem", position: 3, name: guide.title, item: url },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <article className="px-6 pb-20 pt-28 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/zh-CN/guides"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            全部指南
          </Link>
          <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            指南 · 更新于 <time dateTime={guide.date}>{guide.date}</time>
          </p>
          <h1 className="mb-6 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{guide.title}</h1>
          <div>{renderMarkdown(guide.content)}</div>

          <div className="mt-12 rounded-2xl border border-border/60 bg-muted/20 p-6">
            <h2 className="mb-2 text-lg font-bold text-foreground">{guide.cta.title}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{guide.cta.body}</p>
            <Link
              href={guide.cta.href}
              className="inline-block rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              {guide.cta.label}
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            English version:{" "}
            <Link href={`/blog/${guide.slug}`} className="text-primary underline-offset-4 hover:underline">
              /blog/{guide.slug}
            </Link>
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
