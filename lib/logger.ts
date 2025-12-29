/**
 * @fileoverview Structured Logging Utility
 *
 * Provides consistent, structured logging across the application with
 * support for log levels, contextual metadata, and JSON formatting.
 *
 * @module lib/logger
 * @example
 * ```ts
 * import { logger } from '@/lib/logger'
 *
 * // Basic logging
 * logger.info('User logged in', { userId: '123' })
 *
 * // With context
 * const log = logger.child({ requestId: 'abc-123' })
 * log.info('Processing request')
 * log.error('Request failed', { error: err.message })
 * ```
 */

// ============================================
// Types
// ============================================

/**
 * Available log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Structure of a log entry
 */
export interface LogEntry {
  /** ISO timestamp */
  timestamp: string
  /** Log level */
  level: LogLevel
  /** Log message */
  message: string
  /** Additional structured data */
  context?: Record<string, unknown>
  /** Error details if applicable */
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * Configuration options for the logger
 */
export interface LoggerConfig {
  /** Minimum level to log (default: 'info' in production, 'debug' in development) */
  minLevel?: LogLevel
  /** Whether to output as JSON (default: true in production, false in development) */
  json?: boolean
  /** Default context to include in all logs */
  defaultContext?: Record<string, unknown>
}

// ============================================
// Log Level Utilities
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Checks if a log level should be logged based on minimum level
 */
function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel]
}

// ============================================
// Logger Class
// ============================================

/**
 * Structured logger with support for levels, context, and child loggers
 *
 * @example
 * ```ts
 * // Create a child logger with context
 * const requestLogger = logger.child({
 *   requestId: request.headers.get('x-request-id'),
 *   path: request.url,
 * })
 *
 * requestLogger.info('Request started')
 * // ... later
 * requestLogger.info('Request completed', { duration: 150 })
 * ```
 */
class Logger {
  private minLevel: LogLevel
  private json: boolean
  private context: Record<string, unknown>

  constructor(config: LoggerConfig = {}) {
    const isProduction = process.env.NODE_ENV === 'production'
    this.minLevel = config.minLevel ?? (isProduction ? 'info' : 'debug')
    this.json = config.json ?? isProduction
    this.context = config.defaultContext ?? {}
  }

  /**
   * Creates a child logger with additional context
   *
   * Child loggers inherit the parent's configuration but add their own context.
   * Useful for adding request-specific or operation-specific context.
   *
   * @param context - Additional context to merge with existing context
   * @returns New Logger instance with merged context
   *
   * @example
   * ```ts
   * const apiLogger = logger.child({ service: 'api' })
   * const requestLogger = apiLogger.child({ requestId: 'abc' })
   * requestLogger.info('Processing') // includes both service and requestId
   * ```
   */
  child(context: Record<string, unknown>): Logger {
    return new Logger({
      minLevel: this.minLevel,
      json: this.json,
      defaultContext: { ...this.context, ...context },
    })
  }

  /**
   * Logs a debug message
   *
   * Use for detailed information useful during development/debugging.
   * Not logged in production by default.
   *
   * @param message - Log message
   * @param context - Additional context data
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  /**
   * Logs an info message
   *
   * Use for general operational information.
   *
   * @param message - Log message
   * @param context - Additional context data
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  /**
   * Logs a warning message
   *
   * Use for potentially problematic situations that don't prevent operation.
   *
   * @param message - Log message
   * @param context - Additional context data
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  /**
   * Logs an error message
   *
   * Use for error conditions. Optionally include the error object.
   *
   * @param message - Log message
   * @param contextOrError - Error object or additional context
   * @param context - Additional context (if first param is Error)
   *
   * @example
   * ```ts
   * try {
   *   await riskyOperation()
   * } catch (err) {
   *   logger.error('Operation failed', err, { operationId: '123' })
   * }
   * ```
   */
  error(
    message: string,
    contextOrError?: Error | Record<string, unknown>,
    context?: Record<string, unknown>
  ): void {
    let errorDetails: LogEntry['error'] | undefined
    let mergedContext = context

    if (contextOrError instanceof Error) {
      errorDetails = {
        name: contextOrError.name,
        message: contextOrError.message,
        stack: contextOrError.stack,
      }
    } else {
      mergedContext = contextOrError
    }

    this.log('error', message, mergedContext, errorDetails)
  }

  /**
   * Internal logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: LogEntry['error']
  ): void {
    if (!shouldLog(level, this.minLevel)) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      error,
    }

    // Clean up empty context
    if (Object.keys(entry.context ?? {}).length === 0) {
      delete entry.context
    }

    this.output(level, entry)
  }

  /**
   * Outputs the log entry
   */
  private output(level: LogLevel, entry: LogEntry): void {
    const consoleMethod = level === 'debug' ? 'log' : level

    if (this.json) {
      // JSON output for production/log aggregation
      console[consoleMethod](JSON.stringify(entry))
    } else {
      // Human-readable output for development
      const timestamp = entry.timestamp.split('T')[1].split('.')[0]
      const levelColor = this.getLevelColor(level)
      const contextStr = entry.context
        ? ` ${JSON.stringify(entry.context)}`
        : ''
      const errorStr = entry.error
        ? `\n  Error: ${entry.error.message}${entry.error.stack ? `\n  ${entry.error.stack}` : ''}`
        : ''

      console[consoleMethod](
        `${timestamp} ${levelColor}[${level.toUpperCase()}]${'\x1b[0m'} ${entry.message}${contextStr}${errorStr}`
      )
    }
  }

  /**
   * Gets ANSI color code for log level
   */
  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '\x1b[36m' // Cyan
      case 'info':
        return '\x1b[32m' // Green
      case 'warn':
        return '\x1b[33m' // Yellow
      case 'error':
        return '\x1b[31m' // Red
      default:
        return '\x1b[0m' // Reset
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

/**
 * Default logger instance
 *
 * Use this for general logging throughout the application.
 * Create child loggers for specific contexts.
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/logger'
 *
 * logger.info('Application started')
 * logger.warn('Deprecated feature used', { feature: 'oldApi' })
 * logger.error('Unhandled error', error)
 * ```
 */
export const logger = new Logger()

// ============================================
// Specialized Loggers
// ============================================

/**
 * Logger for API routes
 *
 * Pre-configured with 'api' service context.
 */
export const apiLogger = logger.child({ service: 'api' })

/**
 * Logger for database operations
 *
 * Pre-configured with 'database' service context.
 */
export const dbLogger = logger.child({ service: 'database' })

/**
 * Logger for authentication
 *
 * Pre-configured with 'auth' service context.
 */
export const authLogger = logger.child({ service: 'auth' })

/**
 * Logger for AI/ML operations
 *
 * Pre-configured with 'ai' service context.
 */
export const aiLogger = logger.child({ service: 'ai' })

// ============================================
// Request Logging Helper
// ============================================

/**
 * Creates a logger for an HTTP request with request context
 *
 * @param request - The incoming request object
 * @returns Logger with request context (method, path, requestId)
 *
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const log = createRequestLogger(request)
 *   log.info('Handling request')
 *   // ...
 *   log.info('Request complete', { status: 200 })
 * }
 * ```
 */
export function createRequestLogger(request: Request): Logger {
  const url = new URL(request.url)
  const requestId =
    request.headers.get('x-request-id') ||
    request.headers.get('x-vercel-id') ||
    crypto.randomUUID().slice(0, 8)

  return apiLogger.child({
    requestId,
    method: request.method,
    path: url.pathname,
  })
}

// ============================================
// Performance Logging
// ============================================

/**
 * Creates a timer for performance logging
 *
 * @param label - Label for the timer
 * @param log - Logger instance to use
 * @returns Function to call when operation completes
 *
 * @example
 * ```ts
 * const done = startTimer('database-query', logger)
 * await prisma.user.findMany()
 * done({ rowCount: users.length }) // Logs duration and context
 * ```
 */
export function startTimer(
  label: string,
  log: Logger = logger
): (context?: Record<string, unknown>) => void {
  const start = performance.now()

  return (context?: Record<string, unknown>) => {
    const duration = Math.round(performance.now() - start)
    log.debug(`${label} completed`, { ...context, durationMs: duration })
  }
}
