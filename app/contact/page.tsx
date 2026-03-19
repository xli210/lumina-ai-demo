import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — Technical Support & Enterprise AI Solutions",
  description: "Get technical support or explore custom AI solutions for your business. Contact the NanoPocket team for help with installation, activation, or enterprise partnerships.",
  alternates: { canonical: "/contact" },
};
import { Mail, Headset, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

export default function ContactPage() {
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
            Contact Us
          </h1>
          <p className="mb-12 max-w-2xl text-muted-foreground">
            Whether you need technical help or want to explore custom AI
            solutions for your business, we&apos;re here for you.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl glass p-8 sm:p-10">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Headset className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-foreground">
                Technical Support
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Having trouble with installation, activation, or running an
                app? Our technical team is ready to help you get up and
                running.
              </p>
              <Button asChild className="gap-2 rounded-full px-6">
                <a href="mailto:tech@nanopocket.ai">
                  <Mail className="h-4 w-4" />
                  tech@nanopocket.ai
                </a>
              </Button>
            </div>

            <div className="rounded-2xl glass p-8 sm:p-10">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-foreground">
                Enterprise &amp; Custom AI Solutions
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Looking to bring your AI workflows in-house? We partner with
                businesses to design and deploy fully customized, locally-run
                AI pipelines — tailored to your infrastructure, your data, and
                your goals. Whether you&apos;re looking to enhance
                productivity, automate processes, or build proprietary AI
                capabilities, we&apos;re here to make it happen.
              </p>
              <Button asChild className="gap-2 rounded-full px-6">
                <a href="mailto:sales@nanopocket.ai">
                  <Mail className="h-4 w-4" />
                  sales@nanopocket.ai
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
