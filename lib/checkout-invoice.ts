import "server-only";

import type Stripe from "stripe";

/**
 * Checkout settings for a buyer who ticked "I need an invoice" (credits on /credits, licences on
 * /checkout). Stripe then asks for the billing address and, optionally, a company VAT or tax number,
 * and after payment emails a numbered, paid invoice PDF with them; the receipt links to it too.
 *
 * Only for those who ask: Stripe charges a small fee for each invoice made this way, and most
 * buyers are individuals who do not need one. The seller details printed on the invoice come from
 * the Stripe account (Settings → Business → Public details) and its invoice template, not from here.
 *
 * `hasCustomer` is true when the session passes an existing Stripe customer (credit checkout):
 * Stripe then requires `customer_update` so the name, address and tax id can be saved onto it.
 */
export function invoiceCheckoutParams(
  description: string,
  hasCustomer: boolean,
): Partial<Stripe.Checkout.SessionCreateParams> {
  return {
    invoice_creation: {
      enabled: true,
      invoice_data: { description },
    },
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    ...(hasCustomer ? { customer_update: { name: "auto", address: "auto" } } : {}),
  };
}
