import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateBody, successResponse, errorResponse, ErrorCodes, handlePrismaError } from '@/lib/api-utils'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
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
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.register, 'mobile-register')
  if (rateLimitResponse) return rateLimitResponse

  // Validate request body
  const validation = await validateBody(request, registerSchema)
  if ('error' in validation) return validation.error

  const { email, password, name } = validation.data

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse(
        ErrorCodes.ALREADY_EXISTS,
        'An account with this email already exists',
        409
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    })

    // Create default profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        experienceLevel: 'beginner',
        goals: [],
        conditions: [],
      },
    })

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, user.email)

    return successResponse(
      {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      201
    )
  } catch (error) {
    console.error('Mobile registration error:', error)
    return handlePrismaError(error)
  }
}
