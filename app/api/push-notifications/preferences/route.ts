/**
 * Push Notification Preferences API
 * PATCH /api/push-notifications/preferences - Update subscription preferences
 * DELETE /api/push-notifications/preferences - Delete a specific subscription
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateSubscriptionPreferences, deleteSubscription } from '@/lib/push-notifications'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes, validateBody } from '@/lib/api-utils'
import { z } from 'zod'

// Validation schemas
const updatePreferencesSchema = z.object({
  subscriptionId: z.string().min(1),
  preferences: z.object({
    streakReminders: z.boolean().optional(),
    practiceReminders: z.boolean().optional(),
    achievements: z.boolean().optional(),
    goalProgress: z.boolean().optional(),
    newContent: z.boolean().optional(),
    deviceName: z.string().optional(),
  }),
})

const deleteSchema = z.object({
  subscriptionId: z.string().min(1),
})

/**
 * PATCH /api/push-notifications/preferences
 * Update notification preferences for a subscription
 */
export async function PATCH(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'push-preferences')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  const validation = await validateBody(request, updatePreferencesSchema)
  if ('error' in validation) return validation.error

  const { subscriptionId, preferences } = validation.data

  try {
    // Verify the subscription belongs to the user
    const subscription = await prisma.pushSubscription.findUnique({
      where: { id: subscriptionId },
      select: { userId: true },
    })

    if (!subscription) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Subscription not found', 404)
    }

    if (subscription.userId !== session.user.id) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Not authorized to modify this subscription', 403)
    }

    const result = await updateSubscriptionPreferences(subscriptionId, preferences)

    if (!result.success) {
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        result.error || 'Failed to update preferences',
        500
      )
    }

    return successResponse({
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update preferences', 500)
  }
}

/**
 * DELETE /api/push-notifications/preferences
 * Delete a specific subscription
 */
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'push-delete')
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401)
  }

  const validation = await validateBody(request, deleteSchema)
  if ('error' in validation) return validation.error

  const { subscriptionId } = validation.data

  try {
    // Verify the subscription belongs to the user
    const subscription = await prisma.pushSubscription.findUnique({
      where: { id: subscriptionId },
      select: { userId: true },
    })

    if (!subscription) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Subscription not found', 404)
    }

    if (subscription.userId !== session.user.id) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Not authorized to delete this subscription', 403)
    }

    const result = await deleteSubscription(subscriptionId)

    if (!result.success) {
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        result.error || 'Failed to delete subscription',
        500
      )
    }

    return successResponse({
      message: 'Subscription deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to delete subscription', 500)
  }
}
