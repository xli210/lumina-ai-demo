import Link from "next/link";
import { Sparkles, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "../actions";

export default async function ForgotPasswordPage(props: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Lumina AI
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Reset your password
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {searchParams.error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {searchParams.error}
            </div>
          )}

          {searchParams.success ? (
            /* Success state */
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Check your email
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                If an account exists with that email, we&apos;ve sent a password
                reset link. Please check your inbox and spam folder.
              </p>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="rounded-xl"
                  />
                </div>

                <Button
                  formAction={forgotPassword}
                  className="rounded-xl"
                  size="lg"
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
