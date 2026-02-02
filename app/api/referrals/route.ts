/**
 * Referrals API
 * GET /api/referrals - Get referral stats and list
 * POST /api/referrals - Generate or get referral code
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import {
  getReferralStats,
  generateReferralCode,
  getReferralLink,
  REFERRAL_REWARDS,
} from '@/lib/referral'

/**
 * GET /api/referrals
 * Get user's referral statistics and referral list
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'referrals')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const referralCode = await generateReferralCode(session.user.id)
    const stats = await getReferralStats(session.user.id)
    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL || ''

    return successResponse({
      code: referralCode,
      link: getReferralLink(referralCode, baseUrl),
      rewards: REFERRAL_REWARDS,
      ...stats,
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch referrals', 500)
  }
}

/**
 * POST /api/referrals
 * Generate a new referral code (if user doesn't have one)
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'referrals')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const referralCode = await generateReferralCode(session.user.id)
    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL || ''

    return successResponse({
      code: referralCode,
      link: getReferralLink(referralCode, baseUrl),
    })
  } catch (error) {
    console.error('Error generating referral code:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to generate referral code', 500)
  }
}
