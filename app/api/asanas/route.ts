import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { Category } from '@prisma/client'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, handlePrismaError } from '@/lib/api-utils'
import {
  parsePagination,
  paginatedResponse,
  getPrismaPagination,
  parseSort,
  parseArrayFilter,
  parseNumberArrayFilter,
  getSearchFilter,
  asanaSelectList,
} from '@/lib/db/pagination'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.public, 'asanas-read')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const searchParams = request.nextUrl.searchParams

    // Parse pagination
    const pagination = parsePagination(searchParams)

    // Parse sort (allowed: nameEnglish, difficulty, createdAt)
    const sort = parseSort(
      searchParams,
      ['nameEnglish', 'nameSanskrit', 'difficulty', 'createdAt'],
      'difficulty',
      'asc'
    )

    // Parse filters
    const search = searchParams.get('search') || undefined
    const categories = parseArrayFilter(searchParams, 'categories') as Category[] | undefined
    const difficulty = parseNumberArrayFilter(searchParams, 'difficulty')
    const bodyParts = parseArrayFilter(searchParams, 'bodyParts')

    // Check if detailed view is requested
    const detailed = searchParams.get('detailed') === 'true'

    // Build where clause
    const where: Record<string, unknown> = {}

    // Search filter
    const searchFilter = getSearchFilter(search, ['nameEnglish', 'nameSanskrit', 'description'])
    if (searchFilter) {
      where.OR = searchFilter.OR
    }

    // Category filter
    if (categories && categories.length > 0) {
      where.category = { in: categories }
    }

    // Difficulty filter
    if (difficulty && difficulty.length > 0) {
      where.difficulty = { in: difficulty }
    }

    // Body parts filter
    if (bodyParts && bodyParts.length > 0) {
      where.targetBodyParts = { hasSome: bodyParts }
    }

    // Get total count for pagination
    const total = await prisma.asana.count({ where })

    // Fetch asanas with pagination and optimized select
    const asanas = await prisma.asana.findMany({
      where,
      select: detailed
        ? {
            ...asanaSelectList,
            description: true,
            benefits: true,
            contraindications: {
              select: {
                id: true,
                severity: true,
                notes: true,
                condition: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            modifications: {
              select: {
                id: true,
                description: true,
                forAge: true,
                condition: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          }
        : asanaSelectList,
      orderBy: { [sort.field]: sort.order },
      ...getPrismaPagination(pagination),
    })

    return successResponse(paginatedResponse(asanas, total, pagination))
  } catch (error) {
    console.error('Error fetching asanas:', error)
    return handlePrismaError(error)
  }
}
