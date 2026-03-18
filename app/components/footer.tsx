import Link from "next/link";
import { Wordmark } from "./wordmark";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <Link href="/" className="flex items-center">
          <Wordmark className="h-4 w-auto text-foreground sm:h-5" />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/#demo"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Demo
          </Link>
          <Link
            href="/#showcase"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Gallery
          </Link>
          <Link
            href="/#how-it-works"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Apps
          </Link>
          <Link
            href="/#faq"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            FAQ
          </Link>
          <Link
            href="/download"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Download
          </Link>
          <Link
            href="/contact"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Contact
          </Link>
          <Link
            href="/auth/login"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Sign In
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} NanoPocket. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
