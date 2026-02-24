import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "../actions";

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -left-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
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
            Set new password
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Enter your new password below. It must be at least 6 characters.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {searchParams.error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {searchParams.error}
            </div>
          )}

          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-foreground">
                New Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>

            <Button
              formAction={updatePassword}
              className="rounded-xl"
              size="lg"
            >
              Update Password
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
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
