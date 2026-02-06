import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import prisma from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateBody, successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, 'mobile-login')
  if (rateLimitResponse) return rateLimitResponse

  // Validate request body
  const validation = await validateBody(request, loginSchema)
  if ('error' in validation) return validation.error

  const { email, password } = validation.data

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
      },
    })

    if (!user || !user.password) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Invalid email or password',
        401
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Invalid email or password',
        401
      )
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, user.email)

    // Store refresh token hash in database (optional but recommended)
    // For simplicity, we'll trust the JWT signature

    return successResponse({
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    })
  } catch (error) {
    console.error('Mobile login error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An error occurred during login',
      500
    )
  }
}
