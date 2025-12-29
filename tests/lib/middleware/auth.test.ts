import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  hasMinimumRole,
  hasAnyRole,
  canAccessResource,
  type UserRole,
} from '@/lib/middleware/auth'

// Mock the auth function
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

describe('Role Utilities', () => {
  describe('hasMinimumRole', () => {
    it('should return true when user role meets minimum', () => {
      expect(hasMinimumRole('ADMIN', 'USER')).toBe(true)
      expect(hasMinimumRole('SUPER_ADMIN', 'ADMIN')).toBe(true)
      expect(hasMinimumRole('SUPER_ADMIN', 'USER')).toBe(true)
    })

    it('should return true when user role equals minimum', () => {
      expect(hasMinimumRole('USER', 'USER')).toBe(true)
      expect(hasMinimumRole('ADMIN', 'ADMIN')).toBe(true)
      expect(hasMinimumRole('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true)
    })

    it('should return false when user role is below minimum', () => {
      expect(hasMinimumRole('USER', 'ADMIN')).toBe(false)
      expect(hasMinimumRole('USER', 'SUPER_ADMIN')).toBe(false)
      expect(hasMinimumRole('ADMIN', 'SUPER_ADMIN')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('should return true when user role is in allowed list', () => {
      expect(hasAnyRole('USER', ['USER', 'ADMIN'])).toBe(true)
      expect(hasAnyRole('ADMIN', ['ADMIN', 'SUPER_ADMIN'])).toBe(true)
      expect(hasAnyRole('SUPER_ADMIN', ['SUPER_ADMIN'])).toBe(true)
    })

    it('should return false when user role is not in allowed list', () => {
      expect(hasAnyRole('USER', ['ADMIN', 'SUPER_ADMIN'])).toBe(false)
      expect(hasAnyRole('ADMIN', ['SUPER_ADMIN'])).toBe(false)
    })

    it('should return false for empty allowed list', () => {
      expect(hasAnyRole('USER', [])).toBe(false)
      expect(hasAnyRole('ADMIN', [])).toBe(false)
    })
  })

  describe('canAccessResource', () => {
    it('should return true for resource owner', () => {
      expect(canAccessResource('user-123', 'user-123', 'USER')).toBe(true)
    })

    it('should return false for non-owner users', () => {
      expect(canAccessResource('user-123', 'user-456', 'USER')).toBe(false)
    })

    it('should return true for admins regardless of ownership', () => {
      expect(canAccessResource('user-123', 'admin-456', 'ADMIN')).toBe(true)
      expect(canAccessResource('user-123', 'superadmin-789', 'SUPER_ADMIN')).toBe(true)
    })

    it('should handle null/undefined owner IDs', () => {
      // Admins can access resources with no owner
      expect(canAccessResource(null, 'admin-123', 'ADMIN')).toBe(true)
      expect(canAccessResource(undefined, 'admin-123', 'ADMIN')).toBe(true)

      // Regular users cannot
      expect(canAccessResource(null, 'user-123', 'USER')).toBe(false)
      expect(canAccessResource(undefined, 'user-123', 'USER')).toBe(false)
    })
  })
})

describe('Role Hierarchy', () => {
  const roles: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN']

  it('should maintain proper hierarchy order', () => {
    // USER < ADMIN
    expect(hasMinimumRole('USER', 'ADMIN')).toBe(false)
    expect(hasMinimumRole('ADMIN', 'USER')).toBe(true)

    // ADMIN < SUPER_ADMIN
    expect(hasMinimumRole('ADMIN', 'SUPER_ADMIN')).toBe(false)
    expect(hasMinimumRole('SUPER_ADMIN', 'ADMIN')).toBe(true)

    // USER < SUPER_ADMIN
    expect(hasMinimumRole('USER', 'SUPER_ADMIN')).toBe(false)
    expect(hasMinimumRole('SUPER_ADMIN', 'USER')).toBe(true)
  })
})
