import Link from "next/link";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

export default function CheckoutSuccessPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="flex min-h-[70vh] items-center justify-center px-6 pt-24 pb-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-lg text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            Payment Successful!
          </h1>

          <p className="mb-8 text-muted-foreground">
            Your license has been activated. You can now download the app and
            start using it with your license key. Check your downloads page for
            the license key.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/download">
              <Button className="gap-2 rounded-full px-8">
                <Download className="h-4 w-4" />
                Go to Downloads
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline" className="gap-2 rounded-full px-8">
                <ArrowRight className="h-4 w-4" />
                View Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
