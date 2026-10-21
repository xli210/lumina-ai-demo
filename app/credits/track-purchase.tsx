"use client";

import { useEffect } from "react";
import { once, trackEvent } from "@/lib/analytics";

/**
 * Sends GA4's `purchase` for a credit pack that was just paid. The server page has
 * already checked with Stripe that the session is paid and belongs to this user, so
 * this component only reports what it is given. The transaction id is Stripe's
 * payment intent, so GA4 also drops a repeat of the same one.
 */
export function TrackPurchase(props: {
  transactionId: string;
  valueUsd: number;
  packId: string;
  packName: string;
}) {
  useEffect(() => {
    once(`ga_purchase_${props.transactionId}`, () =>
      trackEvent("purchase", {
        transaction_id: props.transactionId,
        value: props.valueUsd,
        currency: "USD",
        items: [
          {
            item_id: props.packId,
            item_name: `${props.packName} credit pack`,
            item_category: "credits",
            price: props.valueUsd,
            quantity: 1,
          },
        ],
      })
    );
  }, [props.transactionId, props.valueUsd, props.packId, props.packName]);

  return null;
}
