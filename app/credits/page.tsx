import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureSignupGrant, listCreditLedger } from "@/lib/credits-server";
import { getFreeClaimOutcome } from "@/lib/free-claim";
import { getStripe } from "@/lib/stripe";
import { findCreditPack } from "@/lib/credit-packs";
import { getAutoRecharge } from "@/lib/auto-recharge";
import Link from "next/link";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { CreditConsole } from "./credit-console";
import { TrackPurchase } from "./track-purchase";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export const dynamic = "force-dynamic";

/**
 * Credit wallet: balance, top-up, and statement.
 *
 * Credits pay for hosted cloud AI services only. Desktop app licenses stay
 * one-time and perpetual — see docs/credit-system.md §1 for that split.
 */
/**
 * The Stripe checkout that just finished, as far as it can be trusted for analytics:
 * the session must be paid, be a credit top-up, and belong to this user. Anything
 * else (no session id, someone else's session, a Stripe error) reports nothing.
 */
async function paidCheckout(sessionId: string | undefined, userId: string) {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;
    if (session.metadata?.kind !== "credit_topup") return null;
    if (session.metadata?.supabase_user_id !== userId) return null;
    const pack = findCreditPack(session.metadata?.pack_id);
    const intent =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (!pack || !intent || session.amount_total == null) return null;
    return { transactionId: intent, valueUsd: session.amount_total / 100, packId: pack.id, packName: pack.name };
  } catch {
    return null;
  }
}

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; pack?: string }>;
}) {
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
    claim === "blocked_ip" || claim === "blocked_device" || claim === "blocked_email"
      ? claim
      : null;
  // The auto top-up setting. If it cannot be read (migration 018 not run yet) the feature is not offered.
  let autoRecharge: Awaited<ReturnType<typeof getAutoRecharge>> = null;
  let autoRechargeReady = true;
  try {
    autoRecharge = await getAutoRecharge(user.id);
  } catch {
    autoRechargeReady = false;
  }
  const params = await searchParams;
  const purchase = await paidCheckout(params.session_id, user.id);
  // Set by a tool's "not enough credits" link: the pack its message recommended.
  const recommended = findCreditPack(params.pack)?.id;
  const t = await getTranslations("Ui.credits");

  return (
    <main className="relative min-h-screen">
      {purchase && <TrackPurchase {...purchase} />}
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        {refused && account.lifetime_purchased === 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
            {refused === "blocked_email" ? (
              <>
                <p className="font-medium text-foreground">
                  {t("refusedEmailTitle")}
                </p>
                <p className="mt-1">
                  {t("refusedEmailBody")}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">
                  {refused === "blocked_device" ? t("refusedBrowserTitle") : t("refusedNetworkTitle")}
                </p>
                <p className="mt-1">
                  {t("refusedBody")}
                </p>
              </>
            )}
          </div>
        )}
        <CreditConsole
          account={account}
          initialLedger={ledger}
          recommendedPackId={recommended}
          autoRecharge={autoRecharge}
          autoRechargeReady={autoRechargeReady}
        />
        <div className="mt-8 rounded-2xl border border-border bg-card/40 p-5">
          <p className="text-sm font-semibold text-foreground">{t("freeAppsTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("freeAppsBody")}
          </p>
          <Link href="/download" className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
            {t("freeAppsLink")}
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
