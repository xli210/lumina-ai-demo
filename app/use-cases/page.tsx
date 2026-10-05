import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { IMAGE_EDIT_NAME, IMAGE_EDIT_URL } from "@/lib/image-edit-facts";
import { IMAGE_EDIT_EXAMPLES } from "@/lib/image-edit-examples";
import { IMAGE_EDIT_USE_CASES } from "@/lib/image-edit-use-cases";

const TITLE = "AI Photo Editing Use Cases";
const DESCRIPTION = `What ${IMAGE_EDIT_NAME} is used for: real estate listings, old family photos, signs and posters, travel and street photos. Each page shows real edits and says what the tool will not do.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/use-cases" },
  openGraph: { type: "website", url: "https://nanopocket.ai/use-cases", title: `${TITLE} | ${IMAGE_EDIT_NAME}`, description: DESCRIPTION },
};

const eyebrow = "mb-3 text-sm font-medium uppercase tracking-widest text-primary";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default function UseCasesIndex() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: "https://nanopocket.ai/use-cases",
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
      about: { "@type": "SoftwareApplication", "@id": `${IMAGE_EDIT_URL}#software`, name: IMAGE_EDIT_NAME, url: IMAGE_EDIT_URL },
      hasPart: IMAGE_EDIT_USE_CASES.map((u) => ({
        "@type": "WebPage",
        name: u.title,
        url: `https://nanopocket.ai/use-cases/${u.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
        { "@type": "ListItem", position: 2, name: IMAGE_EDIT_NAME, item: IMAGE_EDIT_URL },
        { "@type": "ListItem", position: 3, name: "Use cases", item: "https://nanopocket.ai/use-cases" },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className={eyebrow}>{IMAGE_EDIT_NAME}</p>
            <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Who uses it, and for what.
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              An AI photo editor that changes only what you describe and says how much changed. These pages show real
              edits for four kinds of work, with the limits stated.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {IMAGE_EDIT_USE_CASES.map((u) => {
              const e = IMAGE_EDIT_EXAMPLES.find((x) => x.id === u.exampleIds[0]);
              return (
                <Link
                  key={u.slug}
                  href={`/use-cases/${u.slug}`}
                  className="glass-strong group overflow-hidden rounded-3xl border border-primary/10 transition-shadow hover:shadow-xl"
                >
                  {e && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.after}
                      alt={e.alt}
                      width={e.width}
                      height={e.height}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">{u.eyebrow}</p>
                    <h2 className="mb-2 text-xl font-bold text-foreground">{u.name}</h2>
                    <p className="mb-3 text-sm text-muted-foreground">{u.whoFor}</p>
                    <span className={`${textLink} inline-flex items-center gap-1 text-sm`}>
                      Read more <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
