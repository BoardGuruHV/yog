import { z } from 'zod'

// ============================================
// Environment Variable Schema
// ============================================

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid URL'),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(1, 'NEXTAUTH_SECRET is required')
    .optional(), // Optional in development
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL')
    .optional(),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // OpenRouter AI (optional)
  OPENROUTER_API_KEY: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),

  // Push Notifications (Web Push)
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

// ============================================
// Validation and Export
// ============================================

/**
 * Validated environment variables
 * Throws an error if validation fails at startup
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)

    // In production, throw an error to prevent startup with invalid config
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables')
    }

    // In development, log a warning but allow startup
    console.warn('⚠️ Running with invalid environment variables (development mode)')

    // Return partial env with defaults for development
    return {
      DATABASE_URL: process.env.DATABASE_URL || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      VAPID_SUBJECT: process.env.VAPID_SUBJECT,
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    }
  }

  return parsed.data
}

export const env = validateEnv()

// ============================================
// Type-safe Environment Access
// ============================================

export type Env = z.infer<typeof envSchema>

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test'
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleAuthConfigured(): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
}

/**
 * Check if OpenRouter AI is configured
 */
export function isAIConfigured(): boolean {
  return !!env.OPENROUTER_API_KEY
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!env.RESEND_API_KEY
}

/**
 * Check if push notifications are configured
 */
export function isPushNotificationsConfigured(): boolean {
  return !!(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)
}

/**
 * Get required environment variable or throw
 */
export function getRequiredEnv(key: keyof Env): string {
  const value = env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value as string
}
