/**
 * Program Service
 *
 * Business logic for program-related operations.
 */

import prisma from '@/lib/db'
import { cache, CacheKeys, CacheTTL, invalidateProgramCache, invalidateProgramById } from '@/lib/cache'
import {
  PaginationParams,
  paginatedResponse,
  getPrismaPagination,
  programSelectList,
} from '@/lib/db/pagination'
import { Prisma } from '@prisma/client'

// ============================================
// Types
// ============================================

export interface ProgramFilters {
  search?: string
  userId?: string
  isPublic?: boolean
  instructorId?: string
}

export interface CreateProgramInput {
  name: string
  description?: string
  userId?: string
  isPublic?: boolean
  asanas: {
    asanaId: string
    duration: number
    notes?: string
  }[]
}

export interface UpdateProgramInput {
  name?: string
  description?: string
  isPublic?: boolean
  asanas?: {
    asanaId: string
    duration: number
    notes?: string
  }[]
}

// ============================================
// Service Functions
// ============================================

/**
 * Get paginated list of programs
 */
export async function getProgramList(
  filters: ProgramFilters = {},
  pagination: PaginationParams
) {
  const cacheKey = CacheKeys.programs.list(
    JSON.stringify({ filters, pagination })
  )

  const cached = cache.get<ReturnType<typeof paginatedResponse>>(cacheKey)
  if (cached) {
    return cached
  }

  const where: Prisma.ProgramWhereInput = {}

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters.userId) {
    where.userId = filters.userId
  }

  if (filters.isPublic !== undefined) {
    where.isPublic = filters.isPublic
  }

  if (filters.instructorId) {
    where.instructorId = filters.instructorId
  }

  const [total, programs] = await Promise.all([
    prisma.program.count({ where }),
    prisma.program.findMany({
      where,
      select: {
        ...programSelectList,
        user: {
          select: { id: true, name: true, image: true },
        },
        instructor: {
          select: { id: true, name: true, photoUrl: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      ...getPrismaPagination(pagination),
    }),
  ])

  const result = paginatedResponse(programs, total, pagination)

  cache.set(cacheKey, result, CacheTTL.MEDIUM)

  return result
}

/**
 * Get a single program by ID
 */
export async function getProgramById(id: string) {
  const cacheKey = CacheKeys.programs.byId(id)

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.program.findUnique({
        where: { id },
        include: {
          asanas: {
            include: {
              asana: {
                select: {
                  id: true,
                  nameEnglish: true,
                  nameSanskrit: true,
                  category: true,
                  difficulty: true,
                  svgPath: true,
                  targetBodyParts: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
          user: {
            select: { id: true, name: true, image: true },
          },
          instructor: {
            select: { id: true, name: true, photoUrl: true },
          },
        },
      })
    },
    CacheTTL.MEDIUM
  )
}

/**
 * Create a new program
 */
export async function createProgram(input: CreateProgramInput) {
  const { name, description, userId, isPublic = false, asanas } = input

  // Calculate total duration
  const totalDuration = asanas.reduce((sum, a) => sum + a.duration, 0)

  const program = await prisma.program.create({
    data: {
      name,
      description,
      totalDuration,
      userId,
      isPublic,
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
        include: { asana: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  // Invalidate cache
  invalidateProgramCache()

  return program
}

/**
 * Update a program
 */
export async function updateProgram(id: string, input: UpdateProgramInput) {
  const { name, description, isPublic, asanas } = input

  // Start building update data
  const updateData: Prisma.ProgramUpdateInput = {}

  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (isPublic !== undefined) updateData.isPublic = isPublic

  // If asanas are being updated, recalculate duration
  if (asanas !== undefined) {
    updateData.totalDuration = asanas.reduce((sum, a) => sum + a.duration, 0)

    // Delete existing asanas and create new ones
    await prisma.programAsana.deleteMany({ where: { programId: id } })

    updateData.asanas = {
      create: asanas.map((a, index) => ({
        asanaId: a.asanaId,
        order: index,
        duration: a.duration,
        notes: a.notes,
      })),
    }
  }

  const program = await prisma.program.update({
    where: { id },
    data: updateData,
    include: {
      asanas: {
        include: { asana: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  // Invalidate cache
  invalidateProgramById(id)

  return program
}

/**
 * Delete a program
 */
export async function deleteProgram(id: string) {
  await prisma.program.delete({ where: { id } })

  // Invalidate cache
  invalidateProgramById(id)
}

/**
 * Get user's programs
 */
export async function getUserPrograms(userId: string) {
  return prisma.program.findMany({
    where: { userId },
    select: programSelectList,
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * Get public programs (for discovery)
 */
export async function getPublicPrograms(pagination: PaginationParams) {
  return getProgramList({ isPublic: true }, pagination)
}

/**
 * Get program templates
 */
export async function getProgramTemplates() {
  const cacheKey = CacheKeys.programs.templates()

  return cache.getOrSet(
    cacheKey,
    async () => {
      // Note: asanas field is JSON, not a relation
      return prisma.programTemplate.findMany({
        orderBy: { name: 'asc' },
      })
    },
    CacheTTL.TEMPLATES
  )
}

/**
 * Duplicate a program
 */
export async function duplicateProgram(id: string, userId: string, newName?: string) {
  // Query directly to get proper types
  const original = await prisma.program.findUnique({
    where: { id },
    include: {
      asanas: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!original) {
    throw new Error('Program not found')
  }

  return createProgram({
    name: newName || `${original.name} (Copy)`,
    description: original.description || undefined,
    userId,
    isPublic: false,
    asanas: original.asanas.map((a) => ({
      asanaId: a.asanaId,
      duration: a.duration,
      notes: a.notes || undefined,
    })),
  })
}

/**
 * Check if user owns a program
 */
export async function userOwnsProgram(programId: string, userId: string): Promise<boolean> {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { userId: true },
  })

  return program?.userId === userId
}

/**
 * Clear program cache
 */
export function clearProgramCache(): void {
  invalidateProgramCache()
}
