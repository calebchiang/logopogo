import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { addCredits20 } from '@/lib/stripe/webhookHandler'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' })

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') || ''
  const rawBody = await req.arrayBuffer()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(rawBody), sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status === 'paid') {
      const userId = session.metadata?.user_id || ''
      if (userId) {
        await addCredits20({ userId })
      }
    }
  }

  return NextResponse.json({ received: true })
}
