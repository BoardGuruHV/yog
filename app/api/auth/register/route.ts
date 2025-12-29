import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateBody, successResponse, errorResponse, ErrorCodes, handlePrismaError } from '@/lib/api-utils'
import { registerSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.register, 'register')
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
        createdAt: true,
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

    return successResponse(
      {
        message: 'Account created successfully',
        user,
      },
      201
    )
  } catch (error) {
    console.error('Registration error:', error)
    return handlePrismaError(error)
  }
}
