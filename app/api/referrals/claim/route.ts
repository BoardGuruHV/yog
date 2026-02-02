/**
 * Claim Referral Rewards API
 * POST /api/referrals/claim - Claim pending referral rewards
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { claimReferralRewards } from '@/lib/referral'

/**
 * POST /api/referrals/claim
 * Claim all pending referral rewards
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'referrals-claim')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const result = await claimReferralRewards(session.user.id)

    if (!result.success) {
      return errorResponse(ErrorCodes.NOT_FOUND, result.message, 404)
    }

    return successResponse({
      message: result.message,
      daysAdded: result.daysAdded,
    })
  } catch (error) {
    console.error('Error claiming referral rewards:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to claim rewards', 500)
  }
}
