/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { handleWebhookEvent, getStripe } from '@/lib/stripe'
import { env } from '@/lib/env'

// Disable body parsing - we need the raw body for signature verification
export const runtime = 'nodejs'

/**
 * POST /api/webhooks/stripe
 * Handle incoming Stripe webhook events
 */
export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook secret not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    await handleWebhookEvent(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    // Return 200 to prevent Stripe from retrying
    // The error is logged and can be investigated
    return NextResponse.json({ received: true, error: 'Processing error logged' })
  }
}
