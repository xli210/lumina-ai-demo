import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase of NanoPocket AI tools. One-time payment, lifetime access.",
  robots: { index: false },
};
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { CheckoutContent } from "./checkout-content";
import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n/locales";
import { pageStrings } from "@/lib/i18n/strings";

export default async function CheckoutPage() {
  const strings = await pageStrings((await getLocale()) as AppLocale);
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <CheckoutContent strings={strings} />
      </Suspense>
      <Footer />
    </main>
  );
}
