import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/products";

export function PricingSection() {
  const product = PRODUCTS[0];

  return (
    <section id="pricing" className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            One Price. Unlimited Creativity.
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            No subscriptions, no hidden fees. Pay once and unlock the full power
            of Lumina AI forever.
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Lifetime Access
            </span>

            <h3 className="mb-2 text-2xl font-bold text-foreground">
              {product.name}
            </h3>

            <div className="mb-2 flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tight text-foreground">
                ${(product.priceInCents / 100).toFixed(0)}
              </span>
              <span className="text-lg text-muted-foreground">.99</span>
            </div>

            <p className="mb-8 text-muted-foreground">
              One-time payment, no recurring charges
            </p>

            <div className="mb-10 grid w-full gap-3 text-left sm:grid-cols-2">
              {product.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/checkout" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 rounded-full px-12 sm:w-auto">
                Purchase Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <p className="mt-4 text-xs text-muted-foreground">
              Secure payment powered by Stripe. 30-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
