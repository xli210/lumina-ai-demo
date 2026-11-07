"use client";

/**
 * "I need an invoice" above an embedded Stripe checkout (/credits and the licence checkout).
 * Ticking it starts a new checkout that asks for the billing address and any company tax number
 * and emails a numbered invoice after payment (lib/checkout-invoice.ts). Billing text, so it stays
 * English like the auto top-up box (scripts/i18n-left-in-english.txt).
 */
export function InvoiceToggle({
  checked,
  onChange,
  className = "",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card/40 p-3 text-xs text-muted-foreground ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      />
      <span>
        <span className="font-medium text-foreground">I need an invoice (optional).</span> You will be asked for a
        billing address and can add a company name and VAT or tax number. A numbered invoice is emailed after payment.
      </span>
    </label>
  );
}
