/**
 * @fileoverview Soft Delete Utilities
 *
 * Provides soft delete functionality for safe data deletion with recovery options.
 * Instead of permanently deleting records, they are marked with a `deletedAt` timestamp.
 *
 * ## Setup Instructions
 *
 * To enable soft delete for a model:
 *
 * 1. Add `deletedAt` field to your Prisma schema:
 * ```prisma
 * model User {
 *   id        String    @id
 *   deletedAt DateTime?
 *   // ...other fields
 * }
 * ```
 *
 * 2. Run `npx prisma db push` or create a migration
 *
 * 3. Use the helpers in this module for soft delete operations
 *
 * @module lib/db/soft-delete
 *
 * @example
 * ```ts
 * import { notDeleted, withSoftDelete } from '@/lib/db/soft-delete'
 *
 * // Exclude deleted records in queries
 * const users = await prisma.user.findMany({
 *   where: notDeleted,
 * })
 *
 * // Soft delete a record
 * await prisma.user.update({
 *   where: { id },
 *   data: { deletedAt: new Date() },
 * })
 *
 * // Restore a deleted record
 * await prisma.user.update({
 *   where: { id },
 *   data: { deletedAt: null },
 * })
 * ```
 */

// ============================================
// Types
// ============================================

/**
 * Record with soft delete field
 */
export interface SoftDeletable {
  id: string
  deletedAt: Date | null
}

/**
 * Options for soft delete operations
 */
export interface SoftDeleteOptions {
  /** Include reason for deletion */
  reason?: string
  /** User who performed the deletion */
  deletedBy?: string
}

// ============================================
// Query Helpers
// ============================================

/**
 * Default where clause to exclude soft-deleted records
 *
 * Add this to your queries to filter out deleted records.
 *
 * @example
 * ```ts
 * const activeUsers = await prisma.user.findMany({
 *   where: {
 *     ...notDeleted,
 *     status: 'active',
 *   }
 * })
 * ```
 */
export const notDeleted = {
  deletedAt: null,
} as const

/**
 * Where clause to only include soft-deleted records
 *
 * @example
 * ```ts
 * const deletedUsers = await prisma.user.findMany({
 *   where: onlyDeleted,
 * })
 * ```
 */
export const onlyDeleted = {
  deletedAt: { not: null },
} as const

/**
 * Adds soft delete filtering to a where clause
 *
 * @param where - Original where clause
 * @param includeDeleted - Whether to include deleted records
 * @returns Modified where clause
 *
 * @example
 * ```ts
 * const where = withSoftDelete(
 *   { email: { contains: 'example' } },
 *   false // exclude deleted
 * )
 *
 * const users = await prisma.user.findMany({ where })
 * ```
 */
export function withSoftDelete<T extends Record<string, unknown>>(
  where: T,
  includeDeleted: boolean = false
): T & { deletedAt?: null | { not: null } } {
  if (includeDeleted) {
    return where
  }
  return {
    ...where,
    deletedAt: null,
  }
}

// ============================================
// Soft Delete Operations
// ============================================

/**
 * Creates a soft delete data object
 *
 * @returns Data object for Prisma update
 *
 * @example
 * ```ts
 * await prisma.user.update({
 *   where: { id },
 *   data: softDeleteData(),
 * })
 * ```
 */
export function softDeleteData(): { deletedAt: Date } {
  return { deletedAt: new Date() }
}

/**
 * Creates a restore data object
 *
 * @returns Data object for Prisma update to restore a record
 *
 * @example
 * ```ts
 * await prisma.user.update({
 *   where: { id },
 *   data: restoreData(),
 * })
 * ```
 */
export function restoreData(): { deletedAt: null } {
  return { deletedAt: null }
}

// ============================================
// Cleanup Utilities
// ============================================

/**
 * Creates a where clause for records deleted before a cutoff date
 *
 * Useful for finding records to permanently delete after a retention period.
 *
 * @param retentionDays - Days to retain deleted records (default: 30)
 * @returns Where clause for expired deleted records
 *
 * @example
 * ```ts
 * // Find records deleted more than 30 days ago
 * const expiredWhere = expiredDeletedWhere(30)
 *
 * const expired = await prisma.user.findMany({
 *   where: expiredWhere,
 * })
 *
 * // Permanently delete them
 * await prisma.user.deleteMany({
 *   where: expiredWhere,
 * })
 * ```
 */
export function expiredDeletedWhere(retentionDays: number = 30): {
  deletedAt: { not: null; lt: Date }
} {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  return {
    deletedAt: {
      not: null,
      lt: cutoffDate,
    },
  }
}

// ============================================
// Middleware Example
// ============================================

/**
 * Example Prisma middleware for automatic soft delete filtering
 *
 * This is a reference implementation. Copy and customize for your needs.
 *
 * @example
 * ```ts
 * // In lib/db.ts or wherever you initialize Prisma
 * import { Prisma, PrismaClient } from '@prisma/client'
 *
 * const prisma = new PrismaClient()
 *
 * // Add soft delete middleware
 * prisma.$use(async (params, next) => {
 *   const softDeleteModels = ['User', 'Program', 'Collection']
 *
 *   if (softDeleteModels.includes(params.model || '')) {
 *     // Override delete to soft delete
 *     if (params.action === 'delete') {
 *       params.action = 'update'
 *       params.args.data = { deletedAt: new Date() }
 *     }
 *
 *     // Override deleteMany to soft delete
 *     if (params.action === 'deleteMany') {
 *       params.action = 'updateMany'
 *       if (!params.args) params.args = {}
 *       params.args.data = { deletedAt: new Date() }
 *     }
 *
 *     // Add soft delete filter to queries
 *     if (['findFirst', 'findMany', 'count'].includes(params.action)) {
 *       if (!params.args) params.args = {}
 *       if (!params.args.where) params.args.where = {}
 *
 *       // Allow explicitly querying deleted records
 *       if (params.args.where.deletedAt === undefined) {
 *         params.args.where.deletedAt = null
 *       }
 *     }
 *   }
 *
 *   return next(params)
 * })
 * ```
 */
export const softDeleteMiddlewareExample = `
// Add this to your Prisma client initialization
prisma.$use(async (params, next) => {
  const softDeleteModels = ['User', 'Program', 'Collection']

  if (softDeleteModels.includes(params.model || '')) {
    if (params.action === 'delete') {
      params.action = 'update'
      params.args.data = { deletedAt: new Date() }
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany'
      params.args.data = { deletedAt: new Date() }
    }

    if (['findFirst', 'findMany', 'count'].includes(params.action)) {
      if (!params.args) params.args = {}
      if (!params.args.where) params.args.where = {}
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null
      }
    }
  }

  return next(params)
})
`

// ============================================
// Utility Functions
// ============================================

/**
 * Checks if a record has been soft deleted
 *
 * @param record - Record with deletedAt field
 * @returns Whether the record is deleted
 *
 * @example
 * ```ts
 * const user = await prisma.user.findUnique({ where: { id } })
 * if (isDeleted(user)) {
 *   return { error: 'User not found' }
 * }
 * ```
 */
export function isDeleted(record: SoftDeletable | null): boolean {
  if (!record) return false
  return record.deletedAt !== null
}

/**
 * Checks if a record is active (not deleted)
 *
 * @param record - Record with deletedAt field
 * @returns Whether the record is active
 */
export function isActive(record: SoftDeletable | null): boolean {
  if (!record) return false
  return record.deletedAt === null
}

/**
 * Gets the deletion date of a record
 *
 * @param record - Record with deletedAt field
 * @returns Deletion date or null if not deleted
 */
export function getDeletedAt(record: SoftDeletable | null): Date | null {
  return record?.deletedAt ?? null
}
