import { z } from 'zod'

// ============================================
// Pagination Types
// ============================================

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================
// Pagination Schema
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ============================================
// Pagination Utilities
// ============================================

/**
 * Parse and validate pagination parameters from query string
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const rawPage = parseInt(searchParams.get('page') || '1', 10)
  const rawLimit = parseInt(searchParams.get('limit') || '20', 10)

  // Handle NaN and ensure valid values
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
  const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(100, rawLimit)
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Create pagination metadata for response
 */
export function createPaginationMeta(
  total: number,
  params: PaginationParams
): PaginatedResponse<never>['pagination'] {
  const totalPages = Math.ceil(total / params.limit)

  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
  }
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(total, params),
  }
}

// ============================================
// Prisma Query Helpers
// ============================================

/**
 * Get Prisma pagination options (skip/take)
 */
export function getPrismaPagination(params: PaginationParams) {
  return {
    skip: params.offset,
    take: params.limit,
  }
}

/**
 * Common select fields for minimal user data
 */
export const userSelectMinimal = {
  id: true,
  email: true,
  name: true,
  image: true,
} as const

/**
 * Common select fields for asana listings
 */
export const asanaSelectList = {
  id: true,
  nameEnglish: true,
  nameSanskrit: true,
  category: true,
  difficulty: true,
  durationSeconds: true,
  svgPath: true,
  targetBodyParts: true,
} as const

/**
 * Full asana select for detail view
 */
export const asanaSelectFull = {
  id: true,
  nameEnglish: true,
  nameSanskrit: true,
  description: true,
  category: true,
  difficulty: true,
  durationSeconds: true,
  benefits: true,
  targetBodyParts: true,
  svgPath: true,
  createdAt: true,
} as const

/**
 * Common select fields for program listings
 */
export const programSelectList = {
  id: true,
  name: true,
  description: true,
  totalDuration: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { asanas: true },
  },
} as const

/**
 * Common select for practice logs
 */
export const practiceLogSelectList = {
  id: true,
  duration: true,
  moodBefore: true,
  moodAfter: true,
  energyLevel: true,
  notes: true,
  programName: true,
  tags: true,
  createdAt: true,
} as const

// ============================================
// Sort/Order Helpers
// ============================================

export type SortOrder = 'asc' | 'desc'

export interface SortParams {
  field: string
  order: SortOrder
}

/**
 * Parse sort parameters from query string
 * Format: sort=field:order (e.g., sort=createdAt:desc)
 */
export function parseSort(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField: string = 'createdAt',
  defaultOrder: SortOrder = 'desc'
): SortParams {
  const sortParam = searchParams.get('sort')

  if (!sortParam) {
    return { field: defaultField, order: defaultOrder }
  }

  const [field, order] = sortParam.split(':')

  if (!allowedFields.includes(field)) {
    return { field: defaultField, order: defaultOrder }
  }

  const validOrder = order === 'asc' || order === 'desc' ? order : defaultOrder

  return { field, order: validOrder }
}

/**
 * Create Prisma orderBy from sort params
 */
export function getPrismaOrderBy(sort: SortParams) {
  return { [sort.field]: sort.order }
}

// ============================================
// Filter Helpers
// ============================================

/**
 * Parse array filter from query string
 * Handles both repeated params (?a=1&a=2) and comma-separated (?a=1,2)
 */
export function parseArrayFilter(
  searchParams: URLSearchParams,
  key: string
): string[] | undefined {
  const values = searchParams.getAll(key)

  if (values.length === 0) {
    return undefined
  }

  // Flatten comma-separated values
  const flattened = values.flatMap((v) => v.split(',').map((s) => s.trim()))

  return flattened.length > 0 ? flattened : undefined
}

/**
 * Parse number array filter
 */
export function parseNumberArrayFilter(
  searchParams: URLSearchParams,
  key: string
): number[] | undefined {
  const strings = parseArrayFilter(searchParams, key)

  if (!strings) return undefined

  const numbers = strings.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n))

  return numbers.length > 0 ? numbers : undefined
}

/**
 * Create Prisma where clause for category filter
 */
export function getCategoryFilter(categories: string[] | undefined) {
  if (!categories || categories.length === 0) return undefined

  return { category: { in: categories } }
}

/**
 * Create Prisma where clause for difficulty filter
 */
export function getDifficultyFilter(difficulties: number[] | undefined) {
  if (!difficulties || difficulties.length === 0) return undefined

  return { difficulty: { in: difficulties } }
}

/**
 * Create Prisma where clause for text search
 */
export function getSearchFilter(
  search: string | undefined,
  fields: string[]
) {
  if (!search || search.trim() === '') return undefined

  const searchTerm = search.trim()

  return {
    OR: fields.map((field) => ({
      [field]: { contains: searchTerm, mode: 'insensitive' as const },
    })),
  }
}
