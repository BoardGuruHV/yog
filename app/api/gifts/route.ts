/**
 * Gifts API
 * GET /api/gifts - Get user's gifts (purchased and received)
 * POST /api/gifts - Purchase a gift subscription
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { isStripeConfigured } from '@/lib/env'
import {
  getUserGifts,
  createGiftCheckout,
  GIFT_PRICING,
  type GiftProductId,
} from '@/lib/gift'

const purchaseSchema = z.object({
  productId: z.enum([
    'PREMIUM_1_MONTH',
    'PREMIUM_3_MONTHS',
    'PREMIUM_12_MONTHS',
    'PRO_1_MONTH',
    'PRO_3_MONTHS',
    'PRO_12_MONTHS',
  ]),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1).max(100),
  message: z.string().max(500).optional().default(''),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

/**
 * GET /api/gifts
 * Get user's purchased and received gift subscriptions
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'gifts')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const gifts = await getUserGifts(session.user.id)

    return successResponse({
      ...gifts,
      products: GIFT_PRICING,
    })
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch gifts', 500)
  }
}

/**
 * POST /api/gifts
 * Purchase a gift subscription
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'gifts')
  if (rateLimitResponse) return rateLimitResponse

  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return errorResponse(
      ErrorCodes.SERVICE_UNAVAILABLE,
      'Payment processing is not configured',
      503
    )
  }

  const session = await auth()
  if (!session?.user?.id || !session?.user?.email) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const body = await request.json()
    const validation = purchaseSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request data',
        400,
        validation.error.flatten().fieldErrors
      )
    }

    const {
      productId,
      recipientEmail,
      recipientName,
      message,
      successUrl,
      cancelUrl,
    } = validation.data

    // Prevent gifting to yourself
    if (recipientEmail.toLowerCase() === session.user.email.toLowerCase()) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Cannot gift a subscription to yourself',
        400
      )
    }

    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL || ''

    const checkoutUrl = await createGiftCheckout(
      session.user.id,
      session.user.email,
      productId as GiftProductId,
      recipientEmail,
      recipientName,
      message || '',
      successUrl || `${baseUrl}/gift?success=true`,
      cancelUrl || `${baseUrl}/gift?canceled=true`
    )

    return successResponse({ url: checkoutUrl })
  } catch (error) {
    console.error('Error creating gift checkout:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create checkout', 500)
  }
}
