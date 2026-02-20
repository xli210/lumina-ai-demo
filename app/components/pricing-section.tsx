import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Download } from "lucide-react";
import { PRODUCTS } from "@/lib/products";

export function PricingSection() {
  return (
    <section id="pricing" className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Our Apps
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Powerful AI Tools.{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Free to Start.
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Get a free activation license for each app. One license per machine
            — download, activate, and start creating.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="glass-strong rounded-3xl p-8 border border-primary/10 flex flex-col"
            >
              <span className="mb-4 inline-block self-start rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                {product.priceInCents === 0
                  ? "Free License"
                  : "Lifetime Access"}
              </span>

              <h3 className="mb-2 text-2xl font-bold text-foreground">
                {product.name}
              </h3>

              <div className="mb-2 flex items-baseline gap-1">
                {product.priceInCents === 0 ? (
                  <span className="text-5xl font-bold tracking-tight text-emerald-500">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                      ${Math.floor(product.priceInCents / 100)}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      .{String(product.priceInCents % 100).padStart(2, "0")}
                    </span>
                  </>
                )}
              </div>

              <p className="mb-6 text-sm text-muted-foreground">
                {product.priceInCents === 0
                  ? "One license key per machine"
                  : "One-time payment, no recurring charges"}
              </p>

              <div className="mb-8 flex flex-col gap-3 flex-1">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/download" className="w-full">
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  {product.priceInCents === 0 ? (
                    <>
                      <Download className="h-4 w-4" />
                      Get Free License
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
