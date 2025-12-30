/**
 * Push Notifications API
 * GET /api/push-notifications - Get user's subscriptions
 * POST /api/push-notifications - Subscribe to push notifications
 * DELETE /api/push-notifications - Unsubscribe from push notifications
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import {
  subscribeUser,
  unsubscribeUser,
  getUserSubscriptions,
  getVapidPublicKey,
  isPushConfigured,
} from '@/lib/push-notifications'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes, validateBody } from '@/lib/api-utils'
import { z } from 'zod'

// Validation schemas
const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
  deviceName: z.string().optional(),
})

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
})

/**
 * GET /api/push-notifications
 * Get user's push subscriptions and VAPID public key
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'push-read')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  try {
    const subscriptions = await getUserSubscriptions(session.user.id)

    return successResponse({
      configured: isPushConfigured(),
      vapidPublicKey: getVapidPublicKey(),
      subscriptions,
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch subscriptions', 500)
  }
}

/**
 * POST /api/push-notifications
 * Subscribe to push notifications
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'push-subscribe')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  if (!isPushConfigured()) {
    return errorResponse(
      ErrorCodes.SERVICE_UNAVAILABLE,
      'Push notifications are not configured',
      503
    )
  }

  const validation = await validateBody(request, subscribeSchema)
  if ('error' in validation) return validation.error

  const { subscription, deviceName } = validation.data

  try {
    const userAgent = request.headers.get('user-agent') || undefined

    const result = await subscribeUser(
      session.user.id,
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      { userAgent, deviceName }
    )

    if (!result.success) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, result.error || 'Failed to subscribe', 500)
    }

    return successResponse({
      message: 'Successfully subscribed to push notifications',
      subscriptionId: result.subscriptionId,
    })
  } catch (error) {
    console.error('Error subscribing:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to subscribe', 500)
  }
}

/**
 * DELETE /api/push-notifications
 * Unsubscribe from push notifications
 */
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'push-unsubscribe')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  const validation = await validateBody(request, unsubscribeSchema)
  if ('error' in validation) return validation.error

  const { endpoint } = validation.data

  try {
    const result = await unsubscribeUser(session.user.id, endpoint)

    if (!result.success) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, result.error || 'Failed to unsubscribe', 500)
    }

    return successResponse({
      message: 'Successfully unsubscribed from push notifications',
    })
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to unsubscribe', 500)
  }
}
