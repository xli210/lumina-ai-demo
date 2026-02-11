import Link from "next/link";
import { Sparkles, ArrowLeft, Check, Lock } from "lucide-react";
import Checkout from "../components/checkout";
import { PRODUCTS } from "@/lib/products";

export default function CheckoutPage() {
  const product = PRODUCTS[0];

  return (
    <div className="min-h-screen px-6 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/3 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lumina AI
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Secure Checkout
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="glass-strong rounded-2xl p-8">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  Lumina AI
                </span>
              </div>

              <h2 className="mb-1 text-xl font-bold text-foreground">
                {product.name}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {product.description}
              </p>

              <div className="mb-6 border-t border-border pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    One-time purchase
                  </span>
                  <span className="text-3xl font-bold text-foreground">
                    ${(product.priceInCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stripe Checkout */}
          <div className="lg:col-span-3">
            <div className="glass-strong overflow-hidden rounded-2xl p-1">
              <Checkout productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
