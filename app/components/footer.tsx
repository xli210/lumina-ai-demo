import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Lumina AI
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="#showcase"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Showcase
          </Link>
          <Link
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/download"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Download
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          {new Date().getFullYear()} Lumina AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
