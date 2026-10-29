"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertTriangle, Coins, Loader2, Lock, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { startCreditCheckoutSession, turnOffAutoRecharge } from "../actions/credits";
import { trackEvent } from "@/lib/analytics";
import {
  AUTO_RECHARGE_EXTRA_BONUS_PERCENT,
  AUTO_RECHARGE_MAX_PER_DAY,
  AUTO_RECHARGE_MAX_PER_MONTH,
  CREDIT_PACKS,
  autoRechargeCredits,
  autoRechargeThreshold,
  bonusPercent,
  findCreditPack,
  formatPackPrice,
  totalCredits,
  type CreditPack,
} from "@/lib/credit-packs";
import {
  formatCredits,
  type CreditAccountState,
  type CreditLedgerEntry,
} from "@/lib/credits";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/** How long to wait for the webhook before telling the user to come back. */
const CONFIRM_POLL_INTERVAL_MS = 1500;
const CONFIRM_POLL_ATTEMPTS = 12;

/** Human labels for ledger kinds, so a statement does not read like SQL. */
const KIND_LABELS = new Map<string, string>([
  ["purchase", "Top-up"],
  ["bonus", "Bonus credits"],
  ["signup_grant", "Welcome credits"],
  ["promo", "Promotional credits"],
  ["spend", "Usage"],
  ["refund", "Refund"],
  ["reversal", "Payment reversed"],
  ["admin_adjust", "Manual adjustment"],
]);

function labelFor(entry: CreditLedgerEntry): string {
  if (entry.reference.source === "stripe_auto_recharge") {
    return entry.kind === "bonus" ? "Auto top-up bonus" : "Auto top-up";
  }
  return KIND_LABELS.get(entry.kind) ?? entry.kind;
}

/** What the server knows about the person's auto top-up setting. */
export interface AutoRechargeView {
  packId: string;
  enabled: boolean;
  disabledReason: string | null;
}

/** Why an auto top-up that was switched off by us, rather than by the person, was switched off. */
const PAUSED_REASONS = new Map<string, string>([
  ["card_declined", "your card was declined"],
  ["authentication_required", "your bank asked you to confirm the payment"],
  ["dispute", "a payment was disputed"],
  ["no_payment_method", "there is no saved card"],
  ["other", "the payment could not be completed"],
]);

function AutoRechargeCard({ setting }: { setting: AutoRechargeView | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const pack = setting ? findCreditPack(setting.packId) : undefined;

  async function turnOff() {
    setBusy(true);
    try {
      await turnOffAutoRecharge();
      trackEvent("auto_recharge_off", { pack_id: setting?.packId });
      toast.success("Auto top-up is off");
      router.refresh();
    } catch {
      toast.error("Could not turn auto top-up off. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (setting?.enabled && pack) {
    return (
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <RefreshCw className="h-4 w-4 text-primary" />
            Auto top-up is on
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            When your balance drops below {autoRechargeThreshold(pack).toLocaleString("en-US")} credits we charge your
            saved card {formatPackPrice(pack)} and add {formatCredits(autoRechargeCredits(pack))} (the {pack.name} pack
            plus {AUTO_RECHARGE_EXTRA_BONUS_PERCENT}% extra). At most {AUTO_RECHARGE_MAX_PER_DAY} a day and{" "}
            {AUTO_RECHARGE_MAX_PER_MONTH} in 30 days. Stripe emails a receipt each time.
          </p>
        </div>
        <Button type="button" variant="outline" disabled={busy} onClick={turnOff} className="rounded-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn off"}
        </Button>
      </div>
    );
  }

  const paused = setting && !setting.enabled ? PAUSED_REASONS.get(setting.disabledReason ?? "") : undefined;
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <RefreshCw className="h-4 w-4 text-primary" />
        Auto top-up
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Off
        </span>
      </p>
      {paused && (
        <p className="mt-1 text-xs font-medium text-amber-600">
          Auto top-up was switched off because {paused}. Tick the box when you next buy credits to turn it back on.
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Optional. Tick the box at checkout and we buy the same pack again when your balance runs low, with{" "}
        {AUTO_RECHARGE_EXTRA_BONUS_PERCENT}% extra credits on every automatic top-up. Nothing is charged
        automatically unless you turn this on, and you can turn it off here at any time.
      </p>
    </div>
  );
}

function formatWhen(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** True when this ledger entry came from the given Checkout session. */
function matchesSession(entry: CreditLedgerEntry, sessionId: string): boolean {
  return entry.reference.session_id === sessionId;
}

function BalanceCard({ account }: { account: CreditAccountState }) {
  return (
    <div className="glass-strong rounded-2xl p-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            Available to spend
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">
            {account.available.toLocaleString("en-US")}
          </p>
        </div>
        <dl className="flex gap-8 text-sm">
          <div>
            <dt className="text-muted-foreground">Balance</dt>
            <dd className="mt-1 font-medium tabular-nums text-foreground">
              {account.balance.toLocaleString("en-US")}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" />
              Reserved
            </dt>
            <dd className="mt-1 font-medium tabular-nums text-foreground">
              {account.held.toLocaleString("en-US")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Spent to date</dt>
            <dd className="mt-1 font-medium tabular-nums text-foreground">
              {account.lifetime_spent.toLocaleString("en-US")}
            </dd>
          </div>
        </dl>
      </div>
      {account.held > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Reserved credits are held by jobs still running. They are returned
          automatically if a job fails, and only the metered cost is charged
          when one finishes.
        </p>
      )}
    </div>
  );
}

function PackCard({
  pack,
  disabled,
  onSelect,
  recommended,
}: {
  pack: CreditPack;
  disabled: boolean;
  onSelect: (pack: CreditPack) => void;
  /** The pack a tool's "not enough credits" message pointed to. */
  recommended: boolean;
}) {
  const bonus = bonusPercent(pack);
  const marked = recommended || pack.highlight;

  return (
    <div
      id={recommended ? "recommended-pack" : undefined}
      className={`relative flex flex-col rounded-2xl p-6 ${
        recommended
          ? "glass-strong ring-2 ring-primary"
          : pack.highlight
            ? "glass-strong ring-1 ring-primary/40"
            : "glass"
      }`}
    >
      {marked && (
        <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          {recommended ? "Recommended for you" : "Most popular"}
        </span>
      )}
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-foreground">{pack.name}</h3>
        <span className="text-2xl font-bold text-foreground">
          {formatPackPrice(pack)}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">
        {formatCredits(totalCredits(pack))}
      </p>
      {bonus > 0 && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          {bonus}% extra free
        </p>
      )}
      <p className="mt-3 flex-1 text-xs text-muted-foreground">{pack.blurb}</p>
      <Button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(pack)}
        variant={marked ? "default" : "outline"}
        className="mt-5 rounded-full"
      >
        Buy credits
      </Button>
    </div>
  );
}

function Statement({ entries }: { entries: CreditLedgerEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing here yet. Your top-ups and usage will appear as they happen.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {labelFor(entry)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatWhen(entry.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-sm font-semibold tabular-nums ${
                entry.amount > 0 ? "text-emerald-500" : "text-foreground"
              }`}
            >
              {entry.amount > 0 ? "+" : ""}
              {entry.amount.toLocaleString("en-US")}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {entry.balance_after.toLocaleString("en-US")} after
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CreditConsole({
  account: initialAccount,
  initialLedger,
  recommendedPackId,
  autoRecharge,
  autoRechargeReady,
}: {
  account: CreditAccountState;
  initialLedger: CreditLedgerEntry[];
  recommendedPackId?: string;
  autoRecharge: AutoRechargeView | null;
  /** False until migration 018 exists in the database: then the feature is not offered at all. */
  autoRechargeReady: boolean;
}) {
  const router = useRouter();
  const [account, setAccount] = useState(initialAccount);
  const [ledger, setLedger] = useState(initialLedger);
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  // The auto top-up box at checkout. Never ticked for the person.
  const [autoOn, setAutoOn] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const confirmStarted = useRef(false);

  const refresh = useCallback(async (): Promise<CreditLedgerEntry[]> => {
    const [balanceRes, ledgerRes] = await Promise.all([
      fetch("/api/credits/balance", { cache: "no-store" }),
      fetch("/api/credits/ledger?limit=10", { cache: "no-store" }),
    ]);

    if (balanceRes.ok) {
      // Merged rather than replaced: the endpoint returns the figures only,
      // not the user id the server handed us on first render.
      const balance = await balanceRes.json();
      setAccount((prev) => ({ ...prev, ...balance }));
    }

    if (!ledgerRes.ok) return [];
    const body = await ledgerRes.json();
    const entries: CreditLedgerEntry[] = body.entries ?? [];
    setLedger(entries);
    return entries;
  }, []);

  // Stripe returns the browser here the moment payment succeeds, but the
  // credits are written by the webhook, which is a separate round trip.
  // Poll until this session's own ledger entry shows up rather than
  // guessing at a delay or trusting a balance that may be stale.
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (!sessionId || confirmStarted.current) return;
    confirmStarted.current = true;

    let cancelled = false;
    setConfirming(true);

    (async () => {
      for (let attempt = 0; attempt < CONFIRM_POLL_ATTEMPTS; attempt++) {
        if (cancelled) return;
        const entries = await refresh();
        if (entries.some((entry) => matchesSession(entry, sessionId))) {
          if (cancelled) return;
          setConfirming(false);
          toast.success("Credits added to your balance");
          router.replace("/credits");
          return;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIRM_POLL_INTERVAL_MS)
        );
      }

      if (cancelled) return;
      setConfirming(false);
      toast.info(
        "Payment received. Your credits will appear here shortly — reload if they have not."
      );
      router.replace("/credits");
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh, router]);

  // Arriving from a "not enough credits" link: bring the recommended pack into view (it is below the fold on a phone).
  useEffect(() => {
    if (!recommendedPackId) return;
    document.getElementById("recommended-pack")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [recommendedPackId]);

  const fetchClientSecret = useCallback(async () => {
    if (!selectedPack) throw new Error("No pack selected");
    try {
      const secret = await startCreditCheckoutSession(selectedPack.id, autoRechargeReady && autoOn);
      trackEvent("begin_checkout", {
        auto_recharge: autoOn,
        currency: "USD",
        value: selectedPack.priceInCents / 100,
        items: [
          {
            item_id: selectedPack.id,
            item_name: `${selectedPack.name} credit pack`,
            item_category: "credits",
            price: selectedPack.priceInCents / 100,
            quantity: 1,
          },
        ],
      });
      return secret;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not start checkout";
      setCheckoutError(message);
      throw err;
    }
  }, [selectedPack, autoOn, autoRechargeReady]);

  function closeCheckout() {
    setSelectedPack(null);
    setCheckoutError(null);
    setAutoOn(false);
  }

  return (
    <div className="flex flex-col gap-10">
      {confirming && (
        <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm text-foreground">
            Confirming your payment and adding credits…
          </p>
        </div>
      )}

      <BalanceCard account={account} />

      {autoRechargeReady && <AutoRechargeCard setting={autoRecharge} />}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Add credits
        </h2>
        {stripePromise === null ? (
          <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              Payments are not configured on this deployment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CREDIT_PACKS.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                disabled={confirming}
                onSelect={setSelectedPack}
                recommended={pack.id === recommendedPackId}
              />
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          1 credit = $0.01. Credits pay for hosted cloud processing only —
          desktop app licenses remain a one-time purchase and are unaffected.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Recent activity
        </h2>
        <div className="glass rounded-2xl px-6 py-2">
          <Statement entries={ledger} />
        </div>
      </section>

      <Dialog
        open={selectedPack !== null}
        onOpenChange={(open) => {
          if (!open) closeCheckout();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPack
                ? `${selectedPack.name} — ${formatCredits(totalCredits(selectedPack))}`
                : "Checkout"}
            </DialogTitle>
          </DialogHeader>

          {checkoutError !== null && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-sm font-medium text-foreground">
                Unable to start checkout
              </p>
              <p className="text-xs text-muted-foreground">{checkoutError}</p>
              <Button
                type="button"
                variant="outline"
                onClick={closeCheckout}
                className="mt-2 rounded-full"
              >
                Close
              </Button>
            </div>
          )}

          {checkoutError === null && selectedPack !== null && stripePromise && (
            <>
              {autoRechargeReady && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card/40 p-3 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoOn}
                  onChange={(e) => {
                    setAutoOn(e.target.checked);
                    if (e.target.checked) trackEvent("auto_recharge_opt_in", { pack_id: selectedPack.id });
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  <span className="font-medium text-foreground">Auto top-up (optional).</span> When my balance drops
                  below {autoRechargeThreshold(selectedPack).toLocaleString("en-US")} credits, charge this card{" "}
                  {formatPackPrice(selectedPack)} for another {selectedPack.name} pack and add{" "}
                  {formatCredits(autoRechargeCredits(selectedPack))} ({AUTO_RECHARGE_EXTRA_BONUS_PERCENT}% extra). At most{" "}
                  {AUTO_RECHARGE_MAX_PER_DAY} a day and {AUTO_RECHARGE_MAX_PER_MONTH} in 30 days. I can turn it off at
                  any time on this page. See the{" "}
                  <a href="/terms#billing" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    terms
                  </a>
                  .
                </span>
              </label>
              )}
              <EmbeddedCheckoutProvider
                // Remounting per pack and per auto top-up choice is required: the
                // provider caches the client secret it was created with, so a change
                // without a new key would pay for the previous one.
                key={`${selectedPack.id}:${autoOn}`}
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
