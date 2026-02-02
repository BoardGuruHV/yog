/**
 * Gift Subscription System
 * Allow users to purchase gift subscriptions for others
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { nanoid } from 'nanoid'

const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
})

/**
 * Gift subscription pricing (in cents)
 */
export const GIFT_PRICING = {
  PREMIUM_1_MONTH: {
    priceId: 'gift_premium_1m',
    amount: 999, // $9.99
    months: 1,
    tier: 'PREMIUM' as const,
    name: '1 Month Premium',
  },
  PREMIUM_3_MONTHS: {
    priceId: 'gift_premium_3m',
    amount: 2499, // $24.99 (save ~17%)
    months: 3,
    tier: 'PREMIUM' as const,
    name: '3 Months Premium',
  },
  PREMIUM_12_MONTHS: {
    priceId: 'gift_premium_12m',
    amount: 7999, // $79.99 (save ~33%)
    months: 12,
    tier: 'PREMIUM' as const,
    name: '12 Months Premium',
  },
  PRO_1_MONTH: {
    priceId: 'gift_pro_1m',
    amount: 1999, // $19.99
    months: 1,
    tier: 'PRO' as const,
    name: '1 Month Pro',
  },
  PRO_3_MONTHS: {
    priceId: 'gift_pro_3m',
    amount: 4999, // $49.99 (save ~17%)
    months: 3,
    tier: 'PRO' as const,
    name: '3 Months Pro',
  },
  PRO_12_MONTHS: {
    priceId: 'gift_pro_12m',
    amount: 15999, // $159.99 (save ~33%)
    months: 12,
    tier: 'PRO' as const,
    name: '12 Months Pro',
  },
}

export type GiftProductId = keyof typeof GIFT_PRICING

/**
 * Create a checkout session for a gift subscription
 */
export async function createGiftCheckout(
  purchaserId: string,
  purchaserEmail: string,
  productId: GiftProductId,
  recipientEmail: string,
  recipientName: string,
  message: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const product = GIFT_PRICING[productId]

  if (!product) {
    throw new Error('Invalid gift product')
  }

  // Get purchaser info
  const purchaser = await prisma.user.findUnique({
    where: { id: purchaserId },
    select: { name: true },
  })

  // Create a pending gift subscription record
  const giftCode = nanoid(12).toUpperCase()
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Code expires in 1 year

  const gift = await prisma.giftSubscription.create({
    data: {
      purchaserId,
      recipientEmail,
      recipientName,
      senderName: purchaser?.name || null,
      tier: product.tier,
      durationMonths: product.months,
      code: giftCode,
      message,
      amount: product.amount,
      expiresAt,
      redeemed: false,
    },
  })

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: purchaserEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Gift: ${product.name}`,
            description: `Gift subscription for ${recipientName || recipientEmail}`,
          },
          unit_amount: product.amount,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      giftId: gift.id,
      productId,
      purchaserId,
      recipientEmail,
    },
  })

  // Update gift with Stripe session ID
  await prisma.giftSubscription.update({
    where: { id: gift.id },
    data: { stripePaymentId: session.id },
  })

  return session.url!
}

/**
 * Process a completed gift purchase
 */
export async function processGiftPayment(
  giftId: string,
  stripePaymentIntentId: string
): Promise<void> {
  const gift = await prisma.giftSubscription.findUnique({
    where: { id: giftId },
  })

  if (!gift || gift.redeemed) {
    throw new Error('Gift not found or already redeemed')
  }

  // Update gift with payment ID (already created, just update payment info)
  await prisma.giftSubscription.update({
    where: { id: giftId },
    data: {
      stripePaymentId: stripePaymentIntentId,
    },
  })

  // Note: Email notification would be sent here if email service was imported
  // For now, the gift is ready to be redeemed
}

/**
 * Redeem a gift subscription
 */
export async function redeemGift(
  giftCode: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const gift = await prisma.giftSubscription.findUnique({
    where: { code: giftCode },
  })

  if (!gift) {
    return { success: false, message: 'Invalid gift code' }
  }

  if (gift.redeemed) {
    return { success: false, message: 'This gift has already been redeemed' }
  }

  if (new Date() > gift.expiresAt) {
    return { success: false, message: 'This gift code has expired' }
  }

  // Calculate subscription end date
  const now = new Date()
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const currentEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : now
  const baseDate = currentEnd > now ? currentEnd : now
  const newEnd = new Date(baseDate)
  newEnd.setMonth(newEnd.getMonth() + gift.durationMonths)

  // Update or create subscription
  if (subscription) {
    // Upgrade to higher tier if gift tier is better
    const shouldUpgrade =
      gift.tier === 'PRO' ||
      (gift.tier === 'PREMIUM' && subscription.tier === 'FREE')

    await prisma.subscription.update({
      where: { userId },
      data: {
        tier: shouldUpgrade ? gift.tier : subscription.tier,
        status: 'ACTIVE',
        currentPeriodEnd: newEnd,
      },
    })
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        tier: gift.tier,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: newEnd,
      },
    })
  }

  // Mark gift as redeemed
  await prisma.giftSubscription.update({
    where: { id: gift.id },
    data: {
      redeemed: true,
      recipientId: userId,
      redeemedAt: now,
    },
  })

  return {
    success: true,
    message: `Successfully redeemed ${gift.durationMonths} month${gift.durationMonths > 1 ? 's' : ''} of ${gift.tier} subscription!`,
  }
}

/**
 * Get gift subscription by code (for preview)
 */
export async function getGiftByCode(giftCode: string) {
  const gift = await prisma.giftSubscription.findUnique({
    where: { code: giftCode },
  })

  if (!gift) {
    return null
  }

  return {
    id: gift.id,
    status: gift.redeemed ? 'REDEEMED' : 'PURCHASED',
    tier: gift.tier,
    durationMonths: gift.durationMonths,
    message: gift.message,
    senderName: gift.senderName || 'A friend',
    recipientName: gift.recipientName,
    createdAt: gift.createdAt,
    redeemedAt: gift.redeemedAt,
    expiresAt: gift.expiresAt,
  }
}

/**
 * Get user's purchased and received gifts
 */
export async function getUserGifts(userId: string) {
  const [purchased, received] = await Promise.all([
    prisma.giftSubscription.findMany({
      where: { purchaserId: userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.giftSubscription.findMany({
      where: { recipientId: userId },
      orderBy: { redeemedAt: 'desc' },
    }),
  ])

  return {
    purchased: purchased.map((g) => ({
      id: g.id,
      recipientEmail: g.recipientEmail,
      recipientName: g.recipientName,
      tier: g.tier,
      durationMonths: g.durationMonths,
      status: g.redeemed ? 'REDEEMED' : 'PURCHASED',
      giftCode: !g.redeemed ? g.code : undefined,
      createdAt: g.createdAt,
    })),
    received: received.map((g) => ({
      id: g.id,
      senderName: g.senderName || 'A friend',
      tier: g.tier,
      durationMonths: g.durationMonths,
      message: g.message,
      redeemedAt: g.redeemedAt,
    })),
  }
}
