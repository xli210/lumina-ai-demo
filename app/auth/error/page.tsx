import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/app/components/wordmark";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="relative w-full max-w-md text-center">
        <Link href="/" className="mb-8 inline-flex items-center">
          <Wordmark className="h-6 w-auto text-foreground" />
        </Link>

        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Authentication Error
          </h1>
          <p className="mb-8 text-muted-foreground">
            Something went wrong during authentication. Please try again.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button className="w-full rounded-xl">Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-xl bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
