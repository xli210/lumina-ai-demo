/**
 * The short English notes that go next to a price while an offer runs (lib/black-friday.ts).
 * Price wording stays in English on every locale, like the rest of the billing text.
 */
import type { Product } from "@/lib/products";
import { BLACK_FRIDAY_ENDS_LABEL, BLACK_FRIDAY_LAST_DAY, formatUsdCents } from "@/lib/black-friday";
import { formatPackListPrice, packPercentOff, type CreditPack } from "@/lib/credit-packs";

function untilLabel(day: string | undefined): string {
  return !day || day === BLACK_FRIDAY_LAST_DAY ? BLACK_FRIDAY_ENDS_LABEL : day;
}

/**
 * " (Black Friday price until Dec 24, 11:59 pm PT; regular $69.90)" for a discount from a price the
 * product has sold at, " (launch price until Dec 24, 11:59 pm PT; $119.90 after)" for a new
 * product's opening price, "" when there is no offer.
 */
export function productPriceNote(p: Product): string {
  if (!p.originalPriceInCents || p.originalPriceInCents <= p.priceInCents) return "";
  const until = untilLabel(p.promoValidUntil);
  const other = formatUsdCents(p.originalPriceInCents);
  return p.promoKind === "launch"
    ? ` (launch price until ${until}; ${other} after)`
    : ` (Black Friday price until ${until}; regular ${other})`;
}

/** " (Black Friday: 20% off $20 until Dec 24, 11:59 pm PT)", or "" when the pack is not on sale. */
export function packPriceNote(pack: CreditPack, now: number = Date.now()): string {
  const off = packPercentOff(pack, now);
  return off > 0 ? ` (Black Friday: ${off}% off ${formatPackListPrice(pack)} until ${BLACK_FRIDAY_ENDS_LABEL})` : "";
}
