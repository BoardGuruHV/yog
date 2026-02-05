/**
 * @fileoverview Stripe Integration
 *
 * Handles all Stripe-related operations including subscription management,
 * payment processing, and webhook handling.
 *
 * @module lib/stripe
 *
 * @example
 * ```ts
 * import { createCheckoutSession, getSubscription } from '@/lib/stripe'
 *
 * // Create checkout session for premium tier
 * const session = await createCheckoutSession(userId, 'PREMIUM')
 *
 * // Get user's subscription
 * const subscription = await getSubscription(userId)
 * ```
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

// ============================================
// Configuration
// ============================================

const stripeLogger = logger.child({ service: 'stripe' })

// Lazy-loaded Stripe instance
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  return _stripe
}

// Keep stripe export for backward compatibility but make it a getter
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// Feature type export
export type Feature = keyof typeof TIER_LIMITS['FREE']

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Price IDs from Stripe Dashboard (configure these in your Stripe account)
export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
} as const

// Tier limits
export const TIER_LIMITS = {
  FREE: {
    aiChatPerDay: 10,
    programsTotal: 3,
    aiProgramGeneration: false,
    poseDetection: false,
    fullAnalytics: false,
    offlineAccess: false,
    prioritySupport: false,
  },
  PREMIUM: {
    aiChatPerDay: 50,
    programsTotal: Infinity,
    aiProgramGeneration: true,
    poseDetection: true,
    fullAnalytics: true,
    offlineAccess: true,
    prioritySupport: false,
  },
  PRO: {
    aiChatPerDay: Infinity,
    programsTotal: Infinity,
    aiProgramGeneration: true,
    poseDetection: true,
    fullAnalytics: true,
    offlineAccess: true,
    prioritySupport: true,
  },
} as const

// ============================================
// Types
// ============================================

export interface CheckoutResult {
  success: boolean
  sessionId?: string
  url?: string
  error?: string
}

export interface SubscriptionInfo {
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  limits: typeof TIER_LIMITS[keyof typeof TIER_LIMITS]
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
}

/**
 * Get or create Stripe customer for user
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Return existing customer ID if exists
  if (user.subscription?.stripeCustomerId) {
    return user.subscription.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      userId: user.id,
    },
  })

  // Create or update subscription record with customer ID
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      tier: 'FREE',
      status: 'ACTIVE',
    },
    update: {
      stripeCustomerId: customer.id,
    },
  })

  stripeLogger.info('Created Stripe customer', { userId, customerId: customer.id })
  return customer.id
}

// ============================================
// Checkout & Subscription Management
// ============================================

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  tier: 'PREMIUM' | 'PRO',
  billingInterval: 'monthly' | 'yearly' = 'monthly'
): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    return { success: false, error: 'Stripe is not configured' }
  }

  try {
    const customerId = await getOrCreateStripeCustomer(userId)

    // Get the appropriate price ID
    const priceId = tier === 'PREMIUM'
      ? (billingInterval === 'yearly' ? STRIPE_PRICES.PREMIUM_YEARLY : STRIPE_PRICES.PREMIUM_MONTHLY)
      : (billingInterval === 'yearly' ? STRIPE_PRICES.PRO_YEARLY : STRIPE_PRICES.PRO_MONTHLY)

    if (!priceId) {
      return { success: false, error: 'Price not configured for this tier' }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/subscription/cancel`,
      subscription_data: {
        trial_period_days: 7, // 7-day trial
        metadata: {
          userId,
          tier,
        },
      },
      metadata: {
        userId,
        tier,
      },
    })

    stripeLogger.info('Created checkout session', { userId, tier, sessionId: session.id })
    return { success: true, sessionId: session.id, url: session.url || undefined }
  } catch (error) {
    stripeLogger.error('Failed to create checkout session', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Create a customer portal session for managing subscription
 */
export async function createPortalSession(userId: string): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    return { success: false, error: 'Stripe is not configured' }
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription?.stripeCustomerId) {
      return { success: false, error: 'No subscription found' }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${APP_URL}/settings/subscription`,
    })

    return { success: true, url: session.url }
  } catch (error) {
    stripeLogger.error('Failed to create portal session', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription?.stripeSubscriptionId) {
      return { success: false, error: 'No active subscription found' }
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    await prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    })

    stripeLogger.info('Subscription cancelled', { userId })
    return { success: true }
  } catch (error) {
    stripeLogger.error('Failed to cancel subscription', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription?.stripeSubscriptionId) {
      return { success: false, error: 'No subscription found' }
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    })

    await prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: false },
    })

    stripeLogger.info('Subscription resumed', { userId })
    return { success: true }
  } catch (error) {
    stripeLogger.error('Failed to resume subscription', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

// ============================================
// Subscription Info & Limits
// ============================================

/**
 * Get user's current subscription info
 */
export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const tier = subscription?.tier || 'FREE'
  const status = subscription?.status || 'ACTIVE'

  return {
    tier,
    status,
    currentPeriodEnd: subscription?.currentPeriodEnd || null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    limits: TIER_LIMITS[tier],
  }
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof typeof TIER_LIMITS['FREE']
): Promise<boolean> {
  const { limits } = await getSubscriptionInfo(userId)
  const value = limits[feature]
  return typeof value === 'boolean' ? value : value > 0
}

/**
 * Check and increment AI chat usage
 */
export async function checkAIChatUsage(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const tier = subscription?.tier || 'FREE'
  const limit = TIER_LIMITS[tier].aiChatPerDay

  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity }
  }

  const now = new Date()
  const resetDate = subscription?.aiChatUsageReset || new Date(0)

  // Check if we need to reset the counter (new day)
  if (now.getDate() !== resetDate.getDate() || now.getMonth() !== resetDate.getMonth()) {
    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, aiChatUsageToday: 1, aiChatUsageReset: now },
      update: { aiChatUsageToday: 1, aiChatUsageReset: now },
    })
    return { allowed: true, remaining: limit - 1 }
  }

  const currentUsage = subscription?.aiChatUsageToday || 0

  if (currentUsage >= limit) {
    return { allowed: false, remaining: 0 }
  }

  await prisma.subscription.update({
    where: { userId },
    data: { aiChatUsageToday: currentUsage + 1 },
  })

  return { allowed: true, remaining: limit - currentUsage - 1 }
}

/**
 * Check if user can create more programs
 */
export async function checkProgramLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const tier = subscription?.tier || 'FREE'
  const limit = TIER_LIMITS[tier].programsTotal

  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity }
  }

  const programCount = await prisma.program.count({
    where: { userId },
  })

  const remaining = limit - programCount
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) }
}

// ============================================
// Webhook Handling
// ============================================

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdate(subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentSucceeded(invoice)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }

    default:
      stripeLogger.debug('Unhandled webhook event', { type: event.type })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId
  if (!userId) return

  stripeLogger.info('Checkout completed', { userId, sessionId: session.id })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!dbSubscription) {
    stripeLogger.warn('Subscription not found for customer', { customerId })
    return
  }

  // Determine tier from price
  const priceId = subscription.items.data[0]?.price.id
  let tier: SubscriptionTier = 'FREE'
  if (priceId === STRIPE_PRICES.PREMIUM_MONTHLY || priceId === STRIPE_PRICES.PREMIUM_YEARLY) {
    tier = 'PREMIUM'
  } else if (priceId === STRIPE_PRICES.PRO_MONTHLY || priceId === STRIPE_PRICES.PRO_YEARLY) {
    tier = 'PRO'
  }

  // Map Stripe status to our status
  let status: SubscriptionStatus = 'ACTIVE'
  switch (subscription.status) {
    case 'active':
      status = 'ACTIVE'
      break
    case 'past_due':
      status = 'PAST_DUE'
      break
    case 'canceled':
      status = 'CANCELED'
      break
    case 'trialing':
      status = 'TRIALING'
      break
    case 'paused':
      status = 'PAUSED'
      break
  }

  // Access subscription properties with type safety
  const currentPeriodStart = (subscription as unknown as { current_period_start?: number }).current_period_start
  const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
  const trialStart = (subscription as unknown as { trial_start?: number | null }).trial_start
  const trialEnd = (subscription as unknown as { trial_end?: number | null }).trial_end

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      tier,
      status,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: trialStart ? new Date(trialStart * 1000) : null,
      trialEnd: trialEnd ? new Date(trialEnd * 1000) : null,
    },
  })

  stripeLogger.info('Subscription updated', { userId: dbSubscription.userId, tier, status })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!dbSubscription) return

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      tier: 'FREE',
      status: 'CANCELED',
      stripeSubscriptionId: null,
      stripePriceId: null,
    },
  })

  stripeLogger.info('Subscription cancelled', { userId: dbSubscription.userId })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!dbSubscription) return

  // Access payment_intent with type safety for different API versions
  const paymentIntent = (invoice as unknown as { payment_intent?: string | null }).payment_intent

  await prisma.paymentHistory.create({
    data: {
      userId: dbSubscription.userId,
      stripePaymentId: paymentIntent || `inv_${invoice.id}`,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: invoice.description || 'Subscription payment',
      receiptUrl: invoice.hosted_invoice_url || undefined,
      invoicePdf: invoice.invoice_pdf || undefined,
    },
  })

  stripeLogger.info('Payment succeeded', { userId: dbSubscription.userId, amount: invoice.amount_paid })
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!dbSubscription) return

  // Access payment_intent with type safety for different API versions
  const paymentIntent = (invoice as unknown as { payment_intent?: string | null }).payment_intent

  await prisma.paymentHistory.create({
    data: {
      userId: dbSubscription.userId,
      stripePaymentId: paymentIntent || `failed_${invoice.id}`,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: 'Payment failed',
    },
  })

  stripeLogger.warn('Payment failed', { userId: dbSubscription.userId })
}

// ============================================
// Payment History
// ============================================

/**
 * Get user's payment history
 */
export async function getPaymentHistory(userId: string, limit = 10): Promise<{
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    description: string | null
    receiptUrl: string | null
    createdAt: Date
  }>
}> {
  const payments = await prisma.paymentHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      description: true,
      receiptUrl: true,
      createdAt: true,
    },
  })

  return { payments }
}
