import Link from "next/link";
import { Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            Lumina AI
          </span>
        </Link>

        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Check Your Email
          </h1>
          <p className="mb-8 text-muted-foreground">
            {
              "We've sent a confirmation link to your email address. Click the link to verify your account and get started."
            }
          </p>

          <Link href="/auth/login">
            <Button variant="outline" className="rounded-xl bg-transparent">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
