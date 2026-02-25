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

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="#showcase"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Gallery
          </Link>
          <Link
            href="#how-it-works"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            How It Works
          </Link>
          <Link
            href="#features"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Apps
          </Link>
          <Link
            href="/download"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Download
          </Link>
          <Link
            href="/auth/login"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Sign In
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Lumina AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
