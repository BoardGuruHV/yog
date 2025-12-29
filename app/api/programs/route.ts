import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import {
  validateBody,
  successResponse,
  errorResponse,
  ErrorCodes,
  handlePrismaError,
  requireAuth,
} from '@/lib/api-utils'
import { createProgramSchema } from '@/lib/validation/schemas'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'programs-read')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const programs = await prisma.program.findMany({
      include: {
        asanas: {
          include: {
            asana: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return successResponse(programs)
  } catch (error) {
    console.error('Error fetching programs:', error)
    return handlePrismaError(error)
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'programs-write')
  if (rateLimitResponse) return rateLimitResponse

  // Authentication (optional - uncomment if programs should require auth)
  // const session = await auth()
  // const authResult = requireAuth(session)
  // if ('error' in authResult) return authResult.error

  // Validate request body
  const validation = await validateBody(request, createProgramSchema)
  if ('error' in validation) return validation.error

  const { name, description, asanas } = validation.data

  try {
    // Calculate total duration
    const totalDuration = asanas.reduce((sum, a) => sum + a.duration, 0)

    const program = await prisma.program.create({
      data: {
        name,
        description,
        totalDuration,
        asanas: {
          create: asanas.map((a, index) => ({
            asanaId: a.asanaId,
            order: index,
            duration: a.duration,
            notes: a.notes,
          })),
        },
      },
      include: {
        asanas: {
          include: {
            asana: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return successResponse(program, 201)
  } catch (error) {
    console.error('Error creating program:', error)
    return handlePrismaError(error)
  }
}
