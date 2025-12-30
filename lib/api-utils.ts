/**
 * @fileoverview API Utilities for standardized responses and error handling
 *
 * This module provides consistent API response formatting, validation helpers,
 * and error handling utilities for all API routes.
 *
 * @module lib/api-utils
 * @example
 * ```ts
 * import { successResponse, errorResponse, validateBody, ErrorCodes } from '@/lib/api-utils'
 *
 * export async function POST(request: Request) {
 *   const validation = await validateBody(request, mySchema)
 *   if ('error' in validation) return validation.error
 *
 *   // Process validated data...
 *   return successResponse({ id: 'created' }, 201)
 * }
 * ```
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// ============================================
// Response Types
// ============================================

/**
 * Standard success response shape
 * @template T - The type of data being returned
 */
export interface ApiSuccessResponse<T> {
  /** Always true for success responses */
  success: true
  /** The response payload */
  data: T
}

/**
 * Standard error response shape
 */
export interface ApiErrorResponse {
  /** Always false for error responses */
  success: false
  /** Error details */
  error: {
    /** Machine-readable error code */
    code: string
    /** Human-readable error message */
    message: string
    /** Optional additional error details (e.g., validation errors) */
    details?: unknown
  }
}

/**
 * Union type for all API responses
 * @template T - The type of data for success responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================
// Response Helpers
// ============================================

/**
 * Creates a standardized success response
 *
 * @template T - The type of data being returned
 * @param data - The response payload
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success format
 *
 * @example
 * ```ts
 * // Simple success
 * return successResponse({ user: { id: '123', name: 'John' } })
 *
 * // With custom status
 * return successResponse({ id: 'new-resource' }, 201)
 *
 * // Returning a list
 * return successResponse({ items: [...], total: 100 })
 * ```
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    { success: true, data } satisfies ApiSuccessResponse<T>,
    { status }
  )
}

/**
 * Creates a standardized error response
 *
 * @param code - Machine-readable error code (use ErrorCodes enum)
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @param details - Optional additional error details
 * @returns NextResponse with error format
 *
 * @example
 * ```ts
 * // Simple error
 * return errorResponse(ErrorCodes.NOT_FOUND, 'User not found', 404)
 *
 * // With validation details
 * return errorResponse(
 *   ErrorCodes.VALIDATION_ERROR,
 *   'Invalid input',
 *   400,
 *   [{ field: 'email', message: 'Invalid email format' }]
 * )
 * ```
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    } satisfies ApiErrorResponse,
    { status }
  )
}

// ============================================
// Error Codes
// ============================================

/**
 * Standardized error codes for consistent error handling
 *
 * Use these codes in error responses for machine-readable error identification.
 * Clients can use these codes to provide localized error messages or
 * take specific actions based on error type.
 *
 * @example
 * ```ts
 * return errorResponse(ErrorCodes.UNAUTHORIZED, 'Please log in', 401)
 * ```
 */
export const ErrorCodes = {
  // Validation errors (400)
  /** Request body or parameters failed validation */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** Input format is incorrect */
  INVALID_INPUT: 'INVALID_INPUT',

  // Authentication errors (401, 403)
  /** User is not authenticated */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** User lacks required permissions */
  FORBIDDEN: 'FORBIDDEN',
  /** Login credentials are incorrect */
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Resource errors (404, 409)
  /** Requested resource does not exist */
  NOT_FOUND: 'NOT_FOUND',
  /** Resource already exists (unique constraint) */
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  /** Operation conflicts with current state */
  CONFLICT: 'CONFLICT',

  // Rate limiting (429)
  /** Too many requests */
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors (500)
  /** Unexpected server error */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** Database operation failed */
  DATABASE_ERROR: 'DATABASE_ERROR',
  /** External API call failed */
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  /** Service is not available or not configured */
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

/** Type for error code values */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

// ============================================
// Validation Helpers
// ============================================

/**
 * Validates request body against a Zod schema
 *
 * Parses the JSON body and validates it. Returns either the validated data
 * or a pre-formatted error response that can be returned directly.
 *
 * @template T - The validated type from the Zod schema
 * @param request - The incoming Request object
 * @param schema - Zod schema to validate against
 * @returns Object with either `data` (success) or `error` (failure)
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(1),
 * })
 *
 * export async function POST(request: Request) {
 *   const validation = await validateBody(request, schema)
 *   if ('error' in validation) return validation.error
 *
 *   const { email, name } = validation.data
 *   // TypeScript knows email and name are strings here
 * }
 * ```
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((e: z.ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return {
        error: errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid request body',
          400,
          details
        ),
      }
    }

    if (error instanceof SyntaxError) {
      return {
        error: errorResponse(
          ErrorCodes.INVALID_INPUT,
          'Invalid JSON in request body',
          400
        ),
      }
    }

    return {
      error: errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to parse request',
        500
      ),
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 *
 * Handles both repeated parameters (?a=1&a=2) and comma-separated values (?a=1,2).
 *
 * @template T - The validated type from the Zod schema
 * @param searchParams - URLSearchParams from the request
 * @param schema - Zod schema to validate against
 * @returns Object with either `data` (success) or `error` (failure)
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   page: z.coerce.number().default(1),
 *   categories: z.array(z.string()).optional(),
 * })
 *
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url)
 *   const validation = validateQuery(searchParams, schema)
 *   if ('error' in validation) return validation.error
 *
 *   const { page, categories } = validation.data
 * }
 * ```
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data: T } | { error: NextResponse } {
  try {
    const params: Record<string, unknown> = {}

    searchParams.forEach((value, key) => {
      // Handle array parameters (e.g., ?categories=A&categories=B)
      const existing = params[key]
      if (existing !== undefined) {
        if (Array.isArray(existing)) {
          existing.push(value)
        } else {
          params[key] = [existing, value]
        }
      } else {
        // Check if this might be a comma-separated array
        if (value.includes(',')) {
          params[key] = value.split(',').map((v) => v.trim())
        } else {
          params[key] = value
        }
      }
    })

    const data = schema.parse(params)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((e: z.ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return {
        error: errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid query parameters',
          400,
          details
        ),
      }
    }

    return {
      error: errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to parse query parameters',
        500
      ),
    }
  }
}

// ============================================
// Prisma Error Handler
// ============================================

/**
 * Converts Prisma errors to standardized API error responses
 *
 * Handles common Prisma error codes and returns appropriate HTTP responses.
 * Unknown errors are logged and return a generic 500 response.
 *
 * @param error - The caught error (usually from Prisma operations)
 * @returns NextResponse with appropriate error format and status
 *
 * @example
 * ```ts
 * try {
 *   await prisma.user.create({ data: { email } })
 * } catch (error) {
 *   return handlePrismaError(error)
 * }
 * ```
 *
 * @remarks
 * Handled Prisma error codes:
 * - P2002: Unique constraint violation (409)
 * - P2025: Record not found (404)
 * - P2003: Foreign key constraint failure (409)
 * - P2014: Required relation violation (409)
 */
export function handlePrismaError(error: unknown): NextResponse {
  console.error('Database error:', error)

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return errorResponse(
          ErrorCodes.ALREADY_EXISTS,
          'A record with this value already exists',
          409
        )
      case 'P2025': // Record not found
        return errorResponse(ErrorCodes.NOT_FOUND, 'Record not found', 404)
      case 'P2003': // Foreign key constraint failure
        return errorResponse(
          ErrorCodes.CONFLICT,
          'Referenced record does not exist',
          409
        )
      case 'P2014': // Required relation violation
        return errorResponse(
          ErrorCodes.CONFLICT,
          'Required related record is missing',
          409
        )
      default:
        return errorResponse(
          ErrorCodes.DATABASE_ERROR,
          'Database operation failed',
          500
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid data provided',
      400
    )
  }

  return errorResponse(
    ErrorCodes.INTERNAL_ERROR,
    'An unexpected error occurred',
    500
  )
}

// ============================================
// Auth Helpers (Legacy - prefer lib/middleware/auth.ts)
// ============================================

/**
 * Checks if session is authenticated and extracts user ID
 *
 * @deprecated Use `requireAuthentication` from `@/lib/middleware/auth` instead
 * @param session - The session object from NextAuth
 * @returns Object with `userId` or `error` response
 */
export function requireAuth(
  session: { user?: { id?: string } } | null
): { userId: string } | { error: NextResponse } {
  if (!session?.user?.id) {
    return {
      error: errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Authentication required',
        401
      ),
    }
  }
  return { userId: session.user.id }
}

/**
 * Checks if user has one of the required roles
 *
 * @deprecated Use `requireRole` from `@/lib/middleware/auth` instead
 * @param session - The session object from NextAuth
 * @param allowedRoles - Array of role strings that are permitted
 * @returns Object with `userId` or `error` response
 */
export function requireRole(
  session: { user?: { id?: string; role?: string } } | null,
  allowedRoles: string[]
): { userId: string } | { error: NextResponse } {
  const authResult = requireAuth(session)
  if ('error' in authResult) return authResult

  const userRole = session?.user?.role || 'USER'
  if (!allowedRoles.includes(userRole)) {
    return {
      error: errorResponse(
        ErrorCodes.FORBIDDEN,
        'Insufficient permissions',
        403
      ),
    }
  }

  return authResult
}
