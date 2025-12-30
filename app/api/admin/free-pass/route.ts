/**
 * Admin Free Pass API
 * GET /api/admin/free-pass - List all Free Pass requests with filtering
 * POST /api/admin/free-pass - Admin actions (approve, reject)
 */

import { NextRequest } from 'next/server'
import { FreePassStatus } from '@prisma/client'
import {
  getFreePassRequests,
  getFreePassRequest,
  approveFreePassRequest,
  rejectFreePassRequest,
  getFreePassAnalytics,
} from '@/lib/db/free-pass'
import { requireAdmin, withAdmin, type AuthContext } from '@/lib/middleware/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import {
  successResponse,
  errorResponse,
  ErrorCodes,
  validateBody,
} from '@/lib/api-utils'
import { parsePagination } from '@/lib/db/pagination'
import { z } from 'zod'
import {
  sendFreePassApprovalEmail,
  sendFreePassRejectionEmail,
  isEmailConfigured,
} from '@/lib/email'
import { logger } from '@/lib/logger'

// Validation schema for admin actions
const adminActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  requestId: z.string().min(1),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
})

/**
 * GET /api/admin/free-pass
 * List Free Pass requests with optional filtering
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'admin-freepass-read')
  if (rateLimitResponse) return rateLimitResponse

  // Check admin authorization
  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as FreePassStatus | null
    const pagination = parsePagination(searchParams)
    const includeAnalytics = searchParams.get('analytics') === 'true'

    const data = await getFreePassRequests({
      status: status || undefined,
      page: pagination.page,
      limit: pagination.limit,
    })

    let analytics = null
    if (includeAnalytics) {
      analytics = await getFreePassAnalytics()
    }

    return successResponse({
      ...data,
      analytics,
    })
  } catch (error) {
    console.error('Error fetching Free Pass requests:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch Free Pass requests',
      500
    )
  }
}

/**
 * POST /api/admin/free-pass
 * Admin actions: approve or reject requests
 */
export const POST = withAdmin(
  async (request: NextRequest, { user }: AuthContext) => {
    // Rate limiting
    const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'admin-freepass-write')
    if (rateLimitResponse) return rateLimitResponse

    // Validate request body
    const validation = await validateBody(request, adminActionSchema)
    if ('error' in validation) return validation.error

    const { action, requestId, rejectionReason, adminNotes } = validation.data

    try {
      // Get the request first
      const freePassRequest = await getFreePassRequest(requestId)
      if (!freePassRequest) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'Free Pass request not found', 404)
      }

      if (freePassRequest.status !== FreePassStatus.PENDING) {
        return errorResponse(
          ErrorCodes.CONFLICT,
          'This request has already been processed',
          400
        )
      }

      let result
      switch (action) {
        case 'approve':
          result = await approveFreePassRequest(requestId, user.id, adminNotes)

          logger.info('Free Pass approved', {
            id: result.id,
            email: result.email,
            expiresAt: result.accessExpiresAt,
            approvedBy: user.id,
          })

          // Send approval email with login link
          if (isEmailConfigured() && result.accessExpiresAt) {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
            const loginLink = `${baseUrl}/free-pass/login?email=${encodeURIComponent(result.email)}`

            const emailResult = await sendFreePassApprovalEmail({
              to: result.email,
              loginLink,
              expiresAt: result.accessExpiresAt,
            })

            if (!emailResult.success) {
              logger.error('Failed to send approval email', {
                requestId: result.id,
                error: emailResult.error,
              })
            }
          }

          return successResponse({
            message: 'Free Pass approved successfully',
            request: result,
          })

        case 'reject':
          result = await rejectFreePassRequest(
            requestId,
            user.id,
            rejectionReason,
            adminNotes
          )

          logger.info('Free Pass rejected', {
            id: result.id,
            email: result.email,
            reason: rejectionReason,
            rejectedBy: user.id,
          })

          // Send rejection email
          if (isEmailConfigured()) {
            const emailResult = await sendFreePassRejectionEmail({
              to: result.email,
              reason: rejectionReason,
            })

            if (!emailResult.success) {
              logger.error('Failed to send rejection email', {
                requestId: result.id,
                error: emailResult.error,
              })
            }
          }

          return successResponse({
            message: 'Free Pass rejected',
            request: result,
          })

        default:
          return errorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'Invalid action. Must be "approve" or "reject"',
            400
          )
      }
    } catch (error) {
      console.error('Error processing Free Pass action:', error)

      if (error instanceof Error) {
        return errorResponse(ErrorCodes.INVALID_INPUT, error.message, 400)
      }

      return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to process request', 500)
    }
  }
)
