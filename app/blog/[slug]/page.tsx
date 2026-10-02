import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { BLOG_POSTS } from "@/lib/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      ...(post.image
        ? {
            images: [
              {
                url: post.image.src,
                width: post.image.width,
                height: post.image.height,
                alt: post.image.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: post.image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      ...(post.image ? { images: [post.image.src] } : {}),
    },
  };
}

/**
 * Inline markup: **bold** and [label](url). The renderer used to strip both,
 * which meant a post could not link to anything: no internal links, so no
 * route for a reader or a crawler from a guide to the product it describes.
 * Site paths use next/link; anything else opens as an ordinary external link.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${n++}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      );
    } else {
      const href = match[3];
      const cls = "font-medium text-primary underline-offset-4 hover:underline";
      out.push(
        href.startsWith("/") ? (
          <Link key={`${keyPrefix}-l${n++}`} href={href} className={cls}>
            {match[2]}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l${n++}`}
            href={href}
            className={cls}
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[2]}
          </a>
        )
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  function flushTable() {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const body = tableRows.slice(2);
    elements.push(
      <div key={`table-${tableKey++}`} className="my-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-border/50 px-3 py-2 text-muted-foreground">
                    {renderInline(cell.trim(), `c${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|")) {
      inTable = true;
      const cells = line.split("|").filter(Boolean);
      tableRows.push(cells);
      continue;
    }
    if (inTable) {
      flushTable();
      inTable = false;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mt-10 mb-4 text-xl font-bold text-foreground sm:text-2xl">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.*?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <li key={i} className="ml-4 mb-2 text-sm text-muted-foreground list-disc">
            <strong className="text-foreground">{match[1]}</strong>
            {match[2] ? <>: {renderInline(match[2], `li${i}`)}</> : null}
          </li>
        );
      }
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 mb-2 text-sm text-muted-foreground list-disc">
          {renderInline(line.slice(2), `li${i}`)}
        </li>
      );
    } else if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\.\s*/, "");
      elements.push(
        <li key={i} className="ml-4 mb-2 text-sm text-muted-foreground list-decimal">
          {renderInline(text, `ol${i}`)}
        </li>
      );
    } else if (line.trim() === "") {
      continue;
    } else {
      elements.push(
        <p key={i} className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {renderInline(line, `p${i}`)}
        </p>
      );
    }
  }
  if (inTable) flushTable();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const url = `https://nanopocket.ai/blog/${post.slug}`;
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.image ? { image: [`https://nanopocket.ai${post.image.src}`] } : {}),
    keywords: post.keywords.join(", "),
    author: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
    publisher: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://nanopocket.ai/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <Navbar />
      <article className="px-6 pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <p className="mb-3 text-xs text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {post.title}
          </h1>

          <div className="mb-8 flex flex-wrap gap-2">
            {post.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-primary/8 px-3 py-1 text-[10px] font-medium text-primary"
              >
                {kw}
              </span>
            ))}
          </div>

          {post.image && (
            <figure className="mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image.src}
                alt={post.image.alt}
                width={post.image.width}
                height={post.image.height}
                className="w-full rounded-2xl border border-border"
                fetchPriority="high"
              />
            </figure>
          )}

          <div className="prose-nano">{renderMarkdown(post.content)}</div>

          <div className="mt-12 rounded-2xl glass p-8 text-center">
            <h3 className="mb-2 text-lg font-bold text-foreground">
              {post.cta?.title ?? "Ready to try NanoPocket?"}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {post.cta?.body ??
                "Download our AI tools and start creating locally — free apps and 7-day trials available."}
            </p>
            <Link
              href={post.cta?.href ?? "/download"}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {post.cta?.label ?? "Download Free"}
            </Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
