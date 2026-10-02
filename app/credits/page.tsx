import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureSignupGrant, listCreditLedger } from "@/lib/credits-server";
import { getFreeClaimOutcome } from "@/lib/free-claim";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { CreditConsole } from "./credit-console";

export const dynamic = "force-dynamic";

/**
 * Credit wallet: balance, top-up, and statement.
 *
 * Credits pay for hosted cloud AI services only. Desktop app licenses stay
 * one-time and perpetual — see docs/credit-system.md §1 for that split.
 */
export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/credits");
  }

  // Rendering server-side means the balance is correct on first paint,
  // including the welcome grant for an account that has never been read.
  // Sequential on purpose: run in parallel, a brand-new user's statement
  // would be read before the grant that funds it had been written.
  const account = await ensureSignupGrant(user.id);
  const ledger = await listCreditLedger({ userId: user.id, limit: 10 });
  // Why an account has no free credits, if that is the case. Never fatal.
  const claim = await getFreeClaimOutcome(user.id).catch(() => null);
  const refused =
    claim === "blocked_ip" || claim === "blocked_device"
      ? claim
      : null;

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Credits</h1>
          <p className="mt-1 text-muted-foreground">
            Top up once, spend on any hosted AI service. Credits never expire.
          </p>
        </div>
        {refused && account.lifetime_purchased === 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Free credits were already claimed from this{" "}
              {refused === "blocked_device" ? "browser" : "network"}.
            </p>
            <p className="mt-1">
              Free credits are limited to one account per person. If this is
              your first account and you share a connection with someone else,
              buying any credit pack unlocks your account for free credits too.
            </p>
          </div>
        )}
        <CreditConsole account={account} initialLedger={ledger} />
      </div>
      <Footer />
    </main>
  );
}
