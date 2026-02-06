import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import prisma from '@/lib/db'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateBody, successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { z } from 'zod'

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// JWT secret - should be in env vars
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key'
)

// Token expiration times
const ACCESS_TOKEN_EXPIRES = '15m'
const REFRESH_TOKEN_EXPIRES = '30d'

async function generateTokens(userId: string, email: string) {
  const accessToken = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES)
    .setSubject(userId)
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES)
    .setSubject(userId)
    .sign(JWT_SECRET)

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, 'mobile-refresh')
  if (rateLimitResponse) return rateLimitResponse

  // Validate request body
  const validation = await validateBody(request, refreshSchema)
  if ('error' in validation) return validation.error

  const { refreshToken } = validation.data

  try {
    // Verify refresh token
    const { payload } = await jwtVerify(refreshToken, JWT_SECRET)

    // Check if it's a refresh token
    if (payload.type !== 'refresh') {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Invalid token type',
        401
      )
    }

    const userId = payload.sub as string

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    })

    if (!user) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'User not found',
        401
      )
    }

    // Generate new tokens
    const tokens = await generateTokens(user.id, user.email)

    return successResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    })
  } catch (error) {
    // Token verification failed
    return errorResponse(
      ErrorCodes.UNAUTHORIZED,
      'Invalid or expired refresh token',
      401
    )
  }
}
