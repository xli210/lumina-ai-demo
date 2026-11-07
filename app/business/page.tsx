import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CreditCard, Laptop, RefreshCw, Mail } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { SALES_EMAIL } from "../components/business-contact";
import { CREDIT_PACKS, formatPackPrice, totalCredits, AUTO_RECHARGE_MAX_USD_PER_DAY } from "@/lib/credit-packs";
import { BusinessForm } from "./business-form";

export const metadata: Metadata = {
  title: "NanoPocket for Business — API, Volume Credits, Invoices and Team Licences",
  description:
    "Face swap, head swap and video face swap for studios, agencies and shops. Tell us whether you need an API, larger credit volumes, invoices with your company details or licences for a team.",
  alternates: { canonical: "/business" },
};

const LARGEST_PACK = CREDIT_PACKS[CREDIT_PACKS.length - 1];

/**
 * /business: what a team can buy today, and a form to ask for what it cannot yet (an API, a monthly
 * plan, company invoices, several licences, custom work). Nothing on it promises a product that does
 * not exist; the requests are how we find out which of these to build. English only, like /pricing.
 */
export default function BusinessPage() {
  const today = [
    {
      icon: CreditCard,
      title: "Credit packs up to " + formatPackPrice(LARGEST_PACK),
      body: `The ${LARGEST_PACK.name} pack adds ${totalCredits(LARGEST_PACK).toLocaleString("en-US")} credits, the best rate per credit. Credits work across every online tool: photo face swap, head swap and video face swap.`,
      href: "/credits",
      cta: "See credit packs",
    },
    {
      icon: RefreshCw,
      title: "Auto top-up",
      body: `Tick it at checkout and the same pack is bought again when your balance runs low, up to $${AUTO_RECHARGE_MAX_USD_PER_DAY} a day, so a long batch does not stop halfway.`,
      href: "/credits",
      cta: "How it works",
    },
    {
      icon: Laptop,
      title: "Desktop apps",
      body: "Licences for Windows apps that run on your own computer, for work that should not be uploaded anywhere.",
      href: "/download",
      cta: "See the apps",
    },
  ];

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            NanoPocket for business
          </h1>
          <p className="mb-4 max-w-2xl text-muted-foreground">
            Our face swap, head swap and video tools are sold as credits and licences that a team
            can buy today, just as one person does. If your team needs more than that, such as an
            API, a monthly plan, invoices with your company details or licences for several people,
            tell us below. What businesses ask for decides what we build next.
          </p>
          <p className="mb-12 max-w-2xl text-sm text-muted-foreground">
            Use only photos and videos of people who have agreed to it.
          </p>

          <h2 className="mb-4 text-xl font-bold text-foreground">What you can use today</h2>
          <div className="mb-14 grid gap-4 sm:grid-cols-3">
            {today.map((item) => (
              <div key={item.title} className="flex flex-col rounded-2xl glass p-6">
                <item.icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                <Link href={item.href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>

          <BusinessForm />

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Prefer email? Write to{" "}
            <a href={`mailto:${SALES_EMAIL}`} className="font-medium text-primary underline-offset-4 hover:underline">
              {SALES_EMAIL}
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
