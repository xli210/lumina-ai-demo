'use server'

import { stripe } from '../../lib/stripe'
import { PRODUCTS } from '../../lib/products'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function startCheckoutSession(productId: string) {
  console.log('[Stripe] startCheckoutSession called for product:', productId)

  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    console.error('[Stripe] Product not found:', productId)
    throw new Error(`Product with id "${productId}" not found`)
  }

  console.log('[Stripe] Product found:', product.name, 'price:', product.priceInCents)

  // Free products are claimed through /api/license/claim, not paid for. This is
  // a server action, so the check in the /checkout page does not protect it:
  // anyone can call it directly. Without this guard a $0 session is created and
  // the webhook issues a license that shows up as a payment.
  if (product.priceInCents <= 0) {
    console.error('[Stripe] Refusing checkout for free product:', productId)
    throw new Error(`Product "${productId}" is free and cannot be purchased`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[Stripe] User:', user?.id || 'anonymous', user?.email || 'no email')

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  console.log('[Stripe] Origin for return_url:', origin)

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        product_id: product.id,
        ...(user ? { supabase_user_id: user.id } : {}),
      },
    })

    console.log('[Stripe] Session created:', session.id, 'status:', session.status)
    return session.client_secret
  } catch (err) {
    console.error('[Stripe] Failed to create checkout session:', err)
    throw err
  }
}
