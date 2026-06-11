import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/docs";

export const metadata: Metadata = {
  title: "Documentation | NanoPocket",
  description:
    "Technical references for NanoPocket products: face-swap pipeline (InstantID + PuLID + IP-Adapter FaceID), GEO playbook, and other primary-source documentation.",
  alternates: { canonical: "/docs" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Documentation | NanoPocket",
    description:
      "Primary-source technical references for NanoPocket products.",
    images: ["/og-image.jpg"],
  },
};

interface DocEntry {
  href: string;
  title: string;
  description: string;
}

const DOCS: DocEntry[] = [
  {
    href: "/docs/face-swap-pipeline",
    title: "Face Swap Pipeline — Technical Reference",
    description:
      "The diffusion identity stack used by NanoPocket: InstantID + PuLID + IP-Adapter FaceID on a Flux.1 base. Failure modes, composition, deployment, and primary-source citations.",
  },
];

export default function DocsIndexPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="px-6 pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Documentation
          </h1>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Primary-source technical references for NanoPocket products. Each
            page is dated, cites primary sources, and is intended to be a
            citation-ready surface for both human readers and LLM assistants.
          </p>
          <ul className="space-y-3">
            {DOCS.map((d) => (
              <li key={d.href}>
                <Link
                  href={d.href}
                  className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-background/60 p-5 hover:border-foreground/40"
                >
                  <div className="flex-1">
                    <p className="mb-1 text-base font-semibold text-foreground">
                      {d.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {d.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </main>
  );
}
