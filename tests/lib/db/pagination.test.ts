import { describe, it, expect } from 'vitest'
import {
  parsePagination,
  createPaginationMeta,
  paginatedResponse,
  getPrismaPagination,
  parseSort,
  parseArrayFilter,
  parseNumberArrayFilter,
  getSearchFilter,
} from '@/lib/db/pagination'

describe('parsePagination', () => {
  it('should parse valid page and limit', () => {
    const params = new URLSearchParams('page=2&limit=10')
    const result = parsePagination(params)

    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
    expect(result.offset).toBe(10) // (2-1) * 10
  })

  it('should use defaults when not provided', () => {
    const params = new URLSearchParams('')
    const result = parsePagination(params)

    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.offset).toBe(0)
  })

  it('should handle invalid page numbers', () => {
    const params = new URLSearchParams('page=-1&limit=10')
    const result = parsePagination(params)

    expect(result.page).toBe(1) // Defaults to 1 for invalid
  })

  it('should cap limit at 100', () => {
    const params = new URLSearchParams('page=1&limit=500')
    const result = parsePagination(params)

    expect(result.limit).toBe(100)
  })

  it('should handle non-numeric values', () => {
    const params = new URLSearchParams('page=abc&limit=xyz')
    const result = parsePagination(params)

    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })
})

describe('createPaginationMeta', () => {
  it('should create correct metadata for first page', () => {
    const meta = createPaginationMeta(100, { page: 1, limit: 20, offset: 0 })

    expect(meta.page).toBe(1)
    expect(meta.limit).toBe(20)
    expect(meta.total).toBe(100)
    expect(meta.totalPages).toBe(5)
    expect(meta.hasNext).toBe(true)
    expect(meta.hasPrev).toBe(false)
  })

  it('should create correct metadata for last page', () => {
    const meta = createPaginationMeta(100, { page: 5, limit: 20, offset: 80 })

    expect(meta.hasNext).toBe(false)
    expect(meta.hasPrev).toBe(true)
  })

  it('should create correct metadata for middle page', () => {
    const meta = createPaginationMeta(100, { page: 3, limit: 20, offset: 40 })

    expect(meta.hasNext).toBe(true)
    expect(meta.hasPrev).toBe(true)
  })

  it('should handle single page of results', () => {
    const meta = createPaginationMeta(10, { page: 1, limit: 20, offset: 0 })

    expect(meta.totalPages).toBe(1)
    expect(meta.hasNext).toBe(false)
    expect(meta.hasPrev).toBe(false)
  })

  it('should handle zero results', () => {
    const meta = createPaginationMeta(0, { page: 1, limit: 20, offset: 0 })

    expect(meta.total).toBe(0)
    expect(meta.totalPages).toBe(0)
    expect(meta.hasNext).toBe(false)
    expect(meta.hasPrev).toBe(false)
  })
})

describe('paginatedResponse', () => {
  it('should create complete paginated response', () => {
    const data = [{ id: 1 }, { id: 2 }]
    const response = paginatedResponse(data, 50, { page: 1, limit: 10, offset: 0 })

    expect(response.data).toEqual(data)
    expect(response.pagination.total).toBe(50)
    expect(response.pagination.totalPages).toBe(5)
  })
})

describe('getPrismaPagination', () => {
  it('should convert to Prisma skip/take format', () => {
    const prismaParams = getPrismaPagination({ page: 3, limit: 10, offset: 20 })

    expect(prismaParams.skip).toBe(20)
    expect(prismaParams.take).toBe(10)
  })
})

describe('parseSort', () => {
  it('should parse valid sort parameter', () => {
    const params = new URLSearchParams('sort=name:asc')
    const result = parseSort(params, ['name', 'createdAt'])

    expect(result.field).toBe('name')
    expect(result.order).toBe('asc')
  })

  it('should use defaults when not provided', () => {
    const params = new URLSearchParams('')
    const result = parseSort(params, ['name', 'createdAt'])

    expect(result.field).toBe('createdAt')
    expect(result.order).toBe('desc')
  })

  it('should use defaults for invalid field', () => {
    const params = new URLSearchParams('sort=invalidField:asc')
    const result = parseSort(params, ['name', 'createdAt'])

    expect(result.field).toBe('createdAt')
  })

  it('should use default order for invalid order', () => {
    const params = new URLSearchParams('sort=name:invalid')
    const result = parseSort(params, ['name', 'createdAt'])

    expect(result.field).toBe('name')
    expect(result.order).toBe('desc')
  })
})

describe('parseArrayFilter', () => {
  it('should parse repeated parameters', () => {
    const params = new URLSearchParams('category=STANDING&category=SEATED')
    const result = parseArrayFilter(params, 'category')

    expect(result).toEqual(['STANDING', 'SEATED'])
  })

  it('should parse comma-separated values', () => {
    const params = new URLSearchParams('category=STANDING,SEATED,PRONE')
    const result = parseArrayFilter(params, 'category')

    expect(result).toEqual(['STANDING', 'SEATED', 'PRONE'])
  })

  it('should return undefined when not present', () => {
    const params = new URLSearchParams('')
    const result = parseArrayFilter(params, 'category')

    expect(result).toBeUndefined()
  })

  it('should trim whitespace', () => {
    const params = new URLSearchParams('category= STANDING , SEATED ')
    const result = parseArrayFilter(params, 'category')

    expect(result).toEqual(['STANDING', 'SEATED'])
  })
})

describe('parseNumberArrayFilter', () => {
  it('should parse numbers from string', () => {
    const params = new URLSearchParams('difficulty=1,2,3')
    const result = parseNumberArrayFilter(params, 'difficulty')

    expect(result).toEqual([1, 2, 3])
  })

  it('should filter out non-numeric values', () => {
    const params = new URLSearchParams('difficulty=1,abc,3')
    const result = parseNumberArrayFilter(params, 'difficulty')

    expect(result).toEqual([1, 3])
  })

  it('should return undefined when not present', () => {
    const params = new URLSearchParams('')
    const result = parseNumberArrayFilter(params, 'difficulty')

    expect(result).toBeUndefined()
  })
})

describe('getSearchFilter', () => {
  it('should create OR filter for multiple fields', () => {
    const result = getSearchFilter('yoga', ['name', 'description'])

    expect(result).toEqual({
      OR: [
        { name: { contains: 'yoga', mode: 'insensitive' } },
        { description: { contains: 'yoga', mode: 'insensitive' } },
      ],
    })
  })

  it('should return undefined for empty search', () => {
    expect(getSearchFilter('', ['name'])).toBeUndefined()
    expect(getSearchFilter('   ', ['name'])).toBeUndefined()
    expect(getSearchFilter(undefined, ['name'])).toBeUndefined()
  })

  it('should trim search term', () => {
    const result = getSearchFilter('  yoga  ', ['name'])

    expect(result).toEqual({
      OR: [{ name: { contains: 'yoga', mode: 'insensitive' } }],
    })
  })
})
