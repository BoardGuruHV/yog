/**
 * Gift Redeem API
 * GET /api/gifts/redeem?code=XXX - Get gift details
 * POST /api/gifts/redeem - Redeem a gift subscription
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { getGiftByCode, redeemGift } from '@/lib/gift'

const redeemSchema = z.object({
  giftCode: z.string().min(1),
})

/**
 * GET /api/gifts/redeem?code=XXX
 * Get gift subscription details for preview
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'gifts-redeem')
  if (rateLimitResponse) return rateLimitResponse

  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Gift code is required', 400)
  }

  try {
    const gift = await getGiftByCode(code)

    if (!gift) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Gift not found', 404)
    }

    return successResponse(gift)
  } catch (error) {
    console.error('Error fetching gift:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch gift', 500)
  }
}

/**
 * POST /api/gifts/redeem
 * Redeem a gift subscription
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'gifts-redeem')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const body = await request.json()
    const validation = redeemSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Gift code is required',
        400
      )
    }

    const { giftCode } = validation.data
    const result = await redeemGift(giftCode, session.user.id)

    if (!result.success) {
      return errorResponse(ErrorCodes.NOT_FOUND, result.message, 404)
    }

    return successResponse({ message: result.message })
  } catch (error) {
    console.error('Error redeeming gift:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to redeem gift', 500)
  }
}
