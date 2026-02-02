/**
 * Cancel Subscription API
 * POST /api/subscription/cancel - Cancel current subscription
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { cancelSubscription, getSubscriptionInfo } from '@/lib/stripe'
import { isStripeConfigured } from '@/lib/env'

/**
 * POST /api/subscription/cancel
 * Cancel the user's subscription at period end
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'subscription-cancel')
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
    const result = await cancelSubscription(session.user.id)

    if (!result.success) {
      if (result.error?.includes('No active subscription')) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'No active subscription found', 404)
      }
      return errorResponse(ErrorCodes.INTERNAL_ERROR, result.error || 'Failed to cancel subscription', 500)
    }

    // Get updated subscription info for the response
    const subscriptionInfo = await getSubscriptionInfo(session.user.id)

    return successResponse({
      message: 'Subscription will be canceled at the end of the current billing period',
      cancelAt: subscriptionInfo.currentPeriodEnd,
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to cancel subscription', 500)
  }
}
