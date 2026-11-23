import { FACESTUDIO_PRO_REGULAR_PRICE_CENTS, PRODUCTS } from "@/lib/products";
import { BLACK_FRIDAY_ENDS_LABEL } from "@/lib/black-friday";

/**
 * Nano FaceStudio Pro's price as the pages show it, read from the product's getters in
 * lib/products.ts at the moment of use. During Black Friday (lib/black-friday.ts) that is $49.90
 * with the regular $69.90 beside it; otherwise $69.90. $69.90 is the price it has sold at since
 * 1 November, so the sale is a real discount.
 */
export interface FacestudioProPrice {
  /** True while the Black Friday price applies. */
  sale: boolean;
  /** "49.90" or "69.90": what checkout charges now. */
  price: string;
  /** "69.90": the regular price. */
  regular: string;
  priceCents: number;
  regularCents: number;
  /** "2026-12-24" during the sale (for JSON-LD priceValidUntil), else undefined. */
  validUntil?: string;
  /** "Dec 24, 11:59 pm PT". */
  endsLabel: string;
}

const dollars = (cents: number) => (cents / 100).toFixed(2);

export function facestudioProPrice(): FacestudioProPrice {
  const p = PRODUCTS.find((x) => x.id === "nano-facestudio-pro");
  const priceCents = p?.priceInCents ?? FACESTUDIO_PRO_REGULAR_PRICE_CENTS;
  const regularCents = p?.originalPriceInCents ?? priceCents;
  const sale = p?.promoKind === "sale" && regularCents > priceCents;
  return {
    sale,
    price: dollars(priceCents),
    regular: dollars(regularCents),
    priceCents,
    regularCents,
    validUntil: sale ? p?.promoValidUntil : undefined,
    endsLabel: BLACK_FRIDAY_ENDS_LABEL,
  };
}
