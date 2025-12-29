import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { errorResponse, ErrorCodes } from '@/lib/api-utils'

// ============================================
// Types
// ============================================

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
}

// Session type from NextAuth
interface SessionData {
  user?: {
    id?: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: UserRole
  }
  expires?: string
}

export interface AuthContext {
  user: AuthenticatedUser
  session: SessionData
}

type AuthResult =
  | { success: true; context: AuthContext }
  | { success: false; response: NextResponse }

// ============================================
// Role Hierarchy
// ============================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

/**
 * Check if a role meets the minimum required level
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Check if a role is in the allowed list
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

// ============================================
// Authentication Middleware
// ============================================

/**
 * Require authentication for an API route
 * Returns the authenticated user context or an error response
 */
export async function requireAuthentication(): Promise<AuthResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      success: false,
      response: errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Authentication required',
        401
      ),
    }
  }

  // Fetch user role from database if not in session
  const user: AuthenticatedUser = {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name,
    role: (session.user as any).role || 'USER',
  }

  return {
    success: true,
    context: { user, session: session as SessionData },
  }
}

/**
 * Require specific role(s) for an API route
 * @param allowedRoles - Array of roles that are allowed access
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthResult> {
  const authResult = await requireAuthentication()

  if (!authResult.success) {
    return authResult
  }

  const { user } = authResult.context

  if (!hasAnyRole(user.role, allowedRoles)) {
    return {
      success: false,
      response: errorResponse(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to access this resource',
        403
      ),
    }
  }

  return authResult
}

/**
 * Require minimum role level for an API route
 * @param minimumRole - Minimum role level required
 */
export async function requireMinimumRole(minimumRole: UserRole): Promise<AuthResult> {
  const authResult = await requireAuthentication()

  if (!authResult.success) {
    return authResult
  }

  const { user } = authResult.context

  if (!hasMinimumRole(user.role, minimumRole)) {
    return {
      success: false,
      response: errorResponse(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to access this resource',
        403
      ),
    }
  }

  return authResult
}

/**
 * Require admin access (ADMIN or SUPER_ADMIN)
 */
export async function requireAdmin(): Promise<AuthResult> {
  return requireMinimumRole('ADMIN')
}

/**
 * Require super admin access
 */
export async function requireSuperAdmin(): Promise<AuthResult> {
  return requireRole(['SUPER_ADMIN'])
}

// ============================================
// Resource Ownership
// ============================================

/**
 * Check if user owns a resource or is an admin
 * @param resourceOwnerId - The ID of the resource owner
 * @param userId - The ID of the current user
 * @param userRole - The role of the current user
 */
export function canAccessResource(
  resourceOwnerId: string | null | undefined,
  userId: string,
  userRole: UserRole
): boolean {
  // Admins can access any resource
  if (hasMinimumRole(userRole, 'ADMIN')) {
    return true
  }

  // Users can only access their own resources
  return resourceOwnerId === userId
}

/**
 * Require ownership of a resource or admin access
 */
export async function requireOwnershipOrAdmin(
  resourceOwnerId: string | null | undefined
): Promise<AuthResult> {
  const authResult = await requireAuthentication()

  if (!authResult.success) {
    return authResult
  }

  const { user } = authResult.context

  if (!canAccessResource(resourceOwnerId, user.id, user.role)) {
    return {
      success: false,
      response: errorResponse(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to access this resource',
        403
      ),
    }
  }

  return authResult
}

// ============================================
// Helper Decorators for API Routes
// ============================================

/**
 * Wrapper for protected API routes
 * Usage:
 * ```
 * export const GET = withAuth(async (request, { user }) => {
 *   // user is guaranteed to be authenticated
 *   return successResponse({ userId: user.id })
 * })
 * ```
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireAuthentication()

    if (!authResult.success) {
      return authResult.response
    }

    return handler(request, authResult.context, ...args)
  }
}

/**
 * Wrapper for admin-only API routes
 */
export function withAdmin<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireAdmin()

    if (!authResult.success) {
      return authResult.response
    }

    return handler(request, authResult.context, ...args)
  }
}

/**
 * Wrapper for role-protected API routes
 */
export function withRole<T extends any[]>(
  allowedRoles: UserRole[],
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireRole(allowedRoles)

    if (!authResult.success) {
      return authResult.response
    }

    return handler(request, authResult.context, ...args)
  }
}
