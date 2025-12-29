/**
 * Asana Service
 *
 * Business logic for asana-related operations.
 * Separates concerns from API routes for better testability and reusability.
 */

import prisma from '@/lib/db'
import { cache, CacheKeys, CacheTTL, invalidateAsanaCache } from '@/lib/cache'
import {
  PaginationParams,
  paginatedResponse,
  getPrismaPagination,
  asanaSelectList,
  asanaSelectFull,
  SortParams,
} from '@/lib/db/pagination'
import { Category, Prisma } from '@prisma/client'

// ============================================
// Types
// ============================================

export interface AsanaFilters {
  search?: string
  categories?: Category[]
  difficulty?: number[]
  bodyParts?: string[]
}

export interface AsanaListOptions {
  filters?: AsanaFilters
  pagination: PaginationParams
  sort: SortParams
  detailed?: boolean
}

// AsanaListResult is now just an alias for PaginatedResponse
// This provides better type inference from the actual query
export type AsanaListResult<T> = import('@/lib/db/pagination').PaginatedResponse<T>

// ============================================
// Service Functions
// ============================================

/**
 * Get paginated list of asanas with filtering
 */
export async function getAsanaList(options: AsanaListOptions) {
  const { filters = {}, pagination, sort, detailed = false } = options

  // Build where clause
  const where: Prisma.AsanaWhereInput = {}

  if (filters.search) {
    where.OR = [
      { nameEnglish: { contains: filters.search, mode: 'insensitive' } },
      { nameSanskrit: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters.categories && filters.categories.length > 0) {
    where.category = { in: filters.categories }
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    where.difficulty = { in: filters.difficulty }
  }

  if (filters.bodyParts && filters.bodyParts.length > 0) {
    where.targetBodyParts = { hasSome: filters.bodyParts }
  }

  // Get total count
  const total = await prisma.asana.count({ where })

  // Fetch asanas
  const asanas = await prisma.asana.findMany({
    where,
    select: detailed
      ? {
          ...asanaSelectFull,
          contraindications: {
            select: {
              id: true,
              severity: true,
              notes: true,
              condition: { select: { id: true, name: true } },
            },
          },
          modifications: {
            select: {
              id: true,
              description: true,
              forAge: true,
              condition: { select: { id: true, name: true } },
            },
          },
        }
      : asanaSelectList,
    orderBy: { [sort.field]: sort.order },
    ...getPrismaPagination(pagination),
  })

  return paginatedResponse(asanas, total, pagination)
}

/**
 * Get a single asana by ID with full details
 */
export async function getAsanaById(id: string) {
  const cacheKey = CacheKeys.asanas.byId(id)

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.asana.findUnique({
        where: { id },
        include: {
          contraindications: {
            include: { condition: true },
          },
          modifications: {
            include: { condition: true },
          },
          tutorial: {
            include: {
              steps: { orderBy: { order: 'asc' } },
            },
          },
          pronunciation: true,
          anatomy: true,
          videos: true,
          model3D: true,
        },
      })
    },
    CacheTTL.LONG
  )
}

/**
 * Get all asanas (for AI/recommendations - cached heavily)
 */
export async function getAllAsanas() {
  const cacheKey = CacheKeys.asanas.all()

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.asana.findMany({
        select: {
          id: true,
          nameEnglish: true,
          nameSanskrit: true,
          category: true,
          difficulty: true,
          durationSeconds: true,
          targetBodyParts: true,
          benefits: true,
        },
        orderBy: { nameEnglish: 'asc' },
      })
    },
    CacheTTL.HOUR
  )
}

/**
 * Get asana count
 */
export async function getAsanaCount(): Promise<number> {
  const cacheKey = CacheKeys.asanas.count()

  return cache.getOrSet(
    cacheKey,
    async () => prisma.asana.count(),
    CacheTTL.LONG
  )
}

/**
 * Get asanas by category
 */
export async function getAsanasByCategory(category: Category) {
  return prisma.asana.findMany({
    where: { category },
    select: asanaSelectList,
    orderBy: { difficulty: 'asc' },
  })
}

/**
 * Get asanas for health conditions (with contraindications)
 */
export async function getAsanasWithHealthInfo(conditionIds: string[]) {
  if (conditionIds.length === 0) {
    return getAllAsanas()
  }

  return prisma.asana.findMany({
    select: {
      ...asanaSelectList,
      contraindications: {
        where: { conditionId: { in: conditionIds } },
        select: {
          severity: true,
          notes: true,
          condition: { select: { id: true, name: true } },
        },
      },
      modifications: {
        where: { conditionId: { in: conditionIds } },
        select: {
          description: true,
          condition: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { nameEnglish: 'asc' },
  })
}

/**
 * Search asanas by text
 */
export async function searchAsanas(query: string, limit: number = 10) {
  return prisma.asana.findMany({
    where: {
      OR: [
        { nameEnglish: { contains: query, mode: 'insensitive' } },
        { nameSanskrit: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: asanaSelectList,
    take: limit,
    orderBy: { nameEnglish: 'asc' },
  })
}

/**
 * Invalidate asana cache (call after mutations)
 */
export function clearAsanaCache(): void {
  invalidateAsanaCache()
}
