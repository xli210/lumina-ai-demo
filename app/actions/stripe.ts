'use server'

import { stripe } from '../../lib/stripe'
import { PRODUCTS } from '../../lib/products'
import { createClient } from '@/lib/supabase/server'

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Get the current user's Supabase ID so the webhook can link the license
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
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
