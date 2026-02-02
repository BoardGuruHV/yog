/**
 * Subscription Checkout API
 * POST /api/subscription/checkout - Create a Stripe checkout session
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { createCheckoutSession } from '@/lib/stripe'
import { isStripeConfigured } from '@/lib/env'

const checkoutSchema = z.object({
  tier: z.enum(['PREMIUM', 'PRO']),
  billingInterval: z.enum(['monthly', 'yearly']).optional().default('monthly'),
})

/**
 * POST /api/subscription/checkout
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'subscription-checkout')
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
    const validation = checkoutSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request data',
        400,
        validation.error.flatten().fieldErrors
      )
    }

    const { tier, billingInterval } = validation.data

    const result = await createCheckoutSession(
      session.user.id,
      tier,
      billingInterval
    )

    if (!result.success) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, result.error || 'Failed to create checkout session', 500)
    }

    return successResponse({ url: result.url, sessionId: result.sessionId })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create checkout session', 500)
  }
}
