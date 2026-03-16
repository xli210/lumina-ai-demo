import { Suspense } from "react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { CheckoutContent } from "./checkout-content";

export default function CheckoutPage() {
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
        <CheckoutContent />
      </Suspense>
      <Footer />
    </main>
  );
}
