"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Lock, ImagePlus, Video, Sparkles } from "lucide-react";
import Checkout from "../components/checkout";
import { PRODUCTS } from "@/lib/products";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product") || PRODUCTS[0].id;
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];

  // Pick an icon based on the product id
  const iconMap: Record<string, typeof Sparkles> = {
    "nano-imageedit": ImagePlus,
    "nano-videogen": Video,
  };
  const ProductIcon = iconMap[product.id] || Sparkles;

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
            href="/download"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Downloads
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
                  <ProductIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {product.name}
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
                {product.trialDays && product.trialDays > 0 && (
                  <p className="mt-2 text-xs text-emerald-500">
                    Includes upgrade from your free trial — same license key
                  </p>
                )}
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
