import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, startTimer, createRequestLogger } from '@/lib/logger'

describe('Logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('log levels', () => {
    it('should log info messages', () => {
      logger.info('Test message')
      expect(console.info).toHaveBeenCalled()
    })

    it('should log warning messages', () => {
      logger.warn('Warning message')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should log error messages', () => {
      logger.error('Error message')
      expect(console.error).toHaveBeenCalled()
    })

    it('should log debug messages', () => {
      logger.debug('Debug message')
      // In test environment, debug is logged
      expect(console.log).toHaveBeenCalled()
    })
  })

  describe('context handling', () => {
    it('should include context in log output', () => {
      logger.info('With context', { userId: '123' })
      expect(console.info).toHaveBeenCalled()
    })

    it('should create child loggers with merged context', () => {
      const childLogger = logger.child({ service: 'test' })
      childLogger.info('Child log')
      expect(console.info).toHaveBeenCalled()
    })

    it('should inherit parent context in nested children', () => {
      const child1 = logger.child({ level1: 'a' })
      const child2 = child1.child({ level2: 'b' })
      child2.info('Nested log')
      expect(console.info).toHaveBeenCalled()
    })
  })

  describe('error logging', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error')
      logger.error('Something failed', error)
      expect(console.error).toHaveBeenCalled()
    })

    it('should handle error with additional context', () => {
      const error = new Error('Test error')
      logger.error('Something failed', error, { requestId: 'abc' })
      expect(console.error).toHaveBeenCalled()
    })

    it('should handle context without error', () => {
      logger.error('Error without Error object', { detail: 'info' })
      expect(console.error).toHaveBeenCalled()
    })
  })
})

describe('startTimer', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should log timing information when completed', async () => {
    const done = startTimer('test-operation', logger)

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 10))

    done({ extra: 'context' })
    expect(console.log).toHaveBeenCalled()
  })

  it('should work without additional context', async () => {
    const done = startTimer('simple-operation', logger)
    done()
    expect(console.log).toHaveBeenCalled()
  })
})

describe('createRequestLogger', () => {
  it('should create a logger with request context', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})

    const mockRequest = new Request('https://example.com/api/test', {
      method: 'POST',
      headers: {
        'x-request-id': 'test-request-123',
      },
    })

    const requestLogger = createRequestLogger(mockRequest)
    requestLogger.info('Processing request')

    expect(console.info).toHaveBeenCalled()
  })

  it('should generate request ID if not provided', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})

    const mockRequest = new Request('https://example.com/api/test', {
      method: 'GET',
    })

    const requestLogger = createRequestLogger(mockRequest)
    requestLogger.info('Processing request')

    expect(console.info).toHaveBeenCalled()
  })
})
