/**
 * Subscription Portal API
 * POST /api/subscription/portal - Create a Stripe customer portal session
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { createPortalSession } from '@/lib/stripe'
import { isStripeConfigured } from '@/lib/env'

/**
 * POST /api/subscription/portal
 * Create a Stripe customer portal session for managing subscription
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'subscription-portal')
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
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const result = await createPortalSession(session.user.id)

    if (!result.success) {
      // Handle case where user doesn't have a Stripe customer ID
      if (result.error?.includes('No subscription')) {
        return errorResponse(
          ErrorCodes.NOT_FOUND,
          'No subscription found. Please subscribe first.',
          404
        )
      }
      return errorResponse(ErrorCodes.INTERNAL_ERROR, result.error || 'Failed to create portal session', 500)
    }

    return successResponse({ url: result.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create portal session', 500)
  }
}
