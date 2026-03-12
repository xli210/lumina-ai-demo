import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { NavbarUserMenu } from "./navbar-user-menu";
import { Wordmark } from "./wordmark";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center">
          <Wordmark className="h-5 w-auto text-foreground sm:h-6" />
        </Link>

        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          <Link
            href="/#demo"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Demo
          </Link>
          <Link
            href="/#showcase"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Gallery
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Apps
          </Link>
          <Link
            href="/#faq"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
          <Link
            href="/download"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Download
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <NavbarUserMenu user={user} isAdmin={isAdmin} />
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground sm:text-sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="text-xs sm:text-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
