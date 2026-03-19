import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — AI Tools, Guides & Comparisons",
  description: "Learn about local AI tools, compare NanoPocket with Runway, ComfyUI, Flux, LTX, and Topaz. Guides, tutorials, and comparisons for AI image and video generation.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="px-6 pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Blog
          </h1>
          <p className="mb-12 max-w-2xl text-muted-foreground">
            Guides, comparisons, and tutorials for running AI locally on your GPU.
          </p>

          <div className="flex flex-col gap-6">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl glass p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-xs text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h2 className="mb-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors sm:text-xl">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium text-primary"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
