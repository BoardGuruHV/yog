/**
 * Subscription API
 * GET /api/subscription - Get current user's subscription info
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { getSubscriptionInfo } from '@/lib/stripe'

/**
 * GET /api/subscription
 * Get current user's subscription information and usage
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'subscription')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const subscriptionInfo = await getSubscriptionInfo(session.user.id)
    return successResponse(subscriptionInfo)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch subscription', 500)
  }
}
