'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { AlertTriangle } from 'lucide-react'

import { startCheckoutSession } from '../actions/stripe'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

export default function Checkout({ productId }: { productId: string }) {
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const secret = await startCheckoutSession(productId)
      if (!secret) throw new Error('No client secret returned')
      return secret
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start checkout'
      setError(msg)
      throw err
    }
  }, [productId])

  if (!stripePromise) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm font-medium text-foreground">Payment system not configured</p>
        <p className="text-xs text-muted-foreground">
          Stripe publishable key is missing. Please contact support.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm font-medium text-foreground">Unable to load checkout</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={() => setError(null)}
          className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
