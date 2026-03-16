'use server'

import { stripe } from '../../lib/stripe'
import { PRODUCTS } from '../../lib/products'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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

  return session.client_secret
}
