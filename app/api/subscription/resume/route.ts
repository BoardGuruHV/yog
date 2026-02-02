/**
 * Resume Subscription API
 * POST /api/subscription/resume - Resume a canceled subscription
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { resumeSubscription, getSubscriptionInfo } from '@/lib/stripe'
import { isStripeConfigured } from '@/lib/env'

/**
 * POST /api/subscription/resume
 * Resume a subscription that was set to cancel at period end
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'subscription-resume')
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
    const result = await resumeSubscription(session.user.id)

    if (!result.success) {
      if (result.error?.includes('No subscription')) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'No subscription found to resume', 404)
      }
      return errorResponse(ErrorCodes.INTERNAL_ERROR, result.error || 'Failed to resume subscription', 500)
    }

    // Get updated subscription info for the response
    const subscriptionInfo = await getSubscriptionInfo(session.user.id)

    return successResponse({
      message: 'Subscription resumed successfully',
      nextBillingDate: subscriptionInfo.currentPeriodEnd,
    })
  } catch (error) {
    console.error('Error resuming subscription:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to resume subscription', 500)
  }
}
