import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Download } from "lucide-react";
import { PRODUCTS } from "@/lib/products";

export function PricingSection() {
  return (
    <section id="pricing" className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute -bottom-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="glass-strong rounded-3xl p-6 border border-primary/10 flex flex-col sm:p-8"
            >
              <span className="mb-4 inline-block self-start rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary sm:text-sm">
                {product.priceInCents === 0
                  ? "Free License"
                  : "Lifetime Access"}
              </span>

              <h3 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
                {product.name}
              </h3>

              <p className="mb-4 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {product.description}
              </p>

              <div className="mb-2 flex items-baseline gap-1">
                {product.priceInCents === 0 ? (
                  <span className="text-4xl font-bold tracking-tight text-emerald-500 sm:text-5xl">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                      ${Math.floor(product.priceInCents / 100)}
                    </span>
                    <span className="text-base text-muted-foreground sm:text-lg">
                      .{String(product.priceInCents % 100).padStart(2, "0")}
                    </span>
                  </>
                )}
              </div>

              <p className="mb-6 text-xs text-muted-foreground">
                {product.priceInCents === 0
                  ? "One license key per machine"
                  : "One-time payment, no recurring charges"}
              </p>

              <div className="mb-8 flex flex-col gap-2.5 flex-1 sm:gap-3">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs text-foreground sm:text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/download" className="w-full mt-auto">
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all text-sm"
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
