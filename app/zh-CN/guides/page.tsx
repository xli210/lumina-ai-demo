import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { ZH_GUIDES } from "@/lib/zh-guides";

const TITLE = "AI 换脸中文指南:视频换脸教程、工具选择、隐私与成本";
const DESCRIPTION =
  "NanoPocket 的中文指南:视频怎么换脸、视频换脸工具怎么选、为什么换脸会在手挡脸和侧脸时出问题、本地换脸还是在线换脸。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/zh-CN/guides", languages: { en: "https://nanopocket.ai/blog", "zh-CN": "https://nanopocket.ai/zh-CN/guides" } },
  openGraph: { type: "website", url: "https://nanopocket.ai/zh-CN/guides", title: TITLE, description: DESCRIPTION, locale: "zh_CN" },
};

export default function ZhGuidesIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: "https://nanopocket.ai/zh-CN/guides",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "zh-CN",
    hasPart: ZH_GUIDES.map((g) => ({ "@type": "Article", headline: g.title, url: `https://nanopocket.ai/zh-CN/guides/${g.slug}` })),
  };
  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">中文指南</p>
          <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">AI 换脸中文指南</h1>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            视频换脸怎么做、怎么选工具、困难镜头为什么会出问题,以及在自己电脑上换脸和在线换脸怎么取舍。所有数据都来自产品页面上公开的内容,
            不夸大,也说明限制。另见{" "}
            <Link href="/zh-CN/faq" className="text-primary underline-offset-4 hover:underline">常见问题</Link>。
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {ZH_GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/zh-CN/guides/${g.slug}`}
                className="group flex flex-col rounded-2xl border border-border/60 bg-card/40 p-6 transition-colors hover:border-primary/40"
              >
                <h2 className="mb-2 text-lg font-bold text-foreground">{g.title}</h2>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{g.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  阅读 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
