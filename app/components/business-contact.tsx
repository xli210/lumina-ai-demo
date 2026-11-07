import { Building2, Mail } from "lucide-react";
import { tr, type Strings } from "@/lib/i18n/strings";

/** Where business and volume enquiries go (the same address as /contact, /about and the terms). */
export const SALES_EMAIL = "sales@nanopocket.ai";

const MAILTO = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("Business enquiry")}`;

/**
 * "Buying for a team or a business?" with the sales address, beside the places people buy: /pricing,
 * /credits, /download and /checkout (the way Topaz Labs puts "Contact sales" next to its plans).
 * It names what can be asked about and promises nothing: there is no business plan or API yet.
 * The button leads to /business, whose form records what was asked for; the address stays beside it.
 * The words come from messages/pages/<locale>.json "strings" (English is the key), so pass the
 * page's strings; /pricing is English only and passes none.
 */
export function BusinessContact({
  strings = {},
  compact = false,
  className = "",
}: {
  strings?: Strings;
  compact?: boolean;
  className?: string;
}) {
  const t = (text: string) => tr(strings, text);
  const title = t("Buying for a team or a business?");
  const body = t(
    "Larger credit volumes, licences for several people, custom work or an API: tell us what you need and we will reply by email.",
  );

  if (compact) {
    return (
      <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
        <a href="/business" className="font-medium text-foreground underline-offset-4 hover:underline">
          {title}
        </a>{" "}
        {body}{" "}
        <a href={MAILTO} className="font-medium text-primary underline-offset-4 hover:underline">
          {SALES_EMAIL}
        </a>
      </p>
    );
  }

  return (
    <div
      id="business"
      className={`flex flex-col gap-4 rounded-2xl border border-border bg-card/40 p-5 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-3">
        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {body}{" "}
            <a href={MAILTO} className="font-medium text-primary underline-offset-4 hover:underline">
              {SALES_EMAIL}
            </a>
          </p>
        </div>
      </div>
      <a
        href="/business"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        <span>{t("Contact sales")}</span>
      </a>
    </div>
  );
}
