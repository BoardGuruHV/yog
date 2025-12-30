/**
 * @fileoverview Email Service
 *
 * Centralized email sending service using Resend.
 * Handles all transactional emails for the platform.
 *
 * @module lib/email
 *
 * @example
 * ```ts
 * import { sendMagicLinkEmail, sendFreePassApprovalEmail } from '@/lib/email'
 *
 * await sendMagicLinkEmail({
 *   to: 'user@example.com',
 *   magicLink: 'https://app.com/verify?token=...',
 * })
 * ```
 */

import { Resend } from 'resend'
import { logger } from '@/lib/logger'

// ============================================
// Configuration
// ============================================

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Yoga Platform <noreply@yourdomain.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourdomain.com'
const APP_NAME = 'Yoga Platform'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

const emailLogger = logger.child({ service: 'email' })

// ============================================
// Types
// ============================================

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface MagicLinkEmailParams {
  to: string
  magicLink: string
  expiresInMinutes?: number
}

export interface FreePassRequestEmailParams {
  to: string
  requestId: string
  companyName?: string
}

export interface FreePassApprovalEmailParams {
  to: string
  loginLink: string
  expiresAt: Date
}

export interface FreePassRejectionEmailParams {
  to: string
  reason?: string
}

export interface WelcomeEmailParams {
  to: string
  name?: string
}

export interface StreakWarningEmailParams {
  to: string
  currentStreak: number
  name?: string
}

export interface AchievementEmailParams {
  to: string
  achievementName: string
  achievementDescription: string
  name?: string
}

// ============================================
// Email Sending Functions
// ============================================

/**
 * Sends a magic link email for passwordless login
 */
export async function sendMagicLinkEmail(
  params: MagicLinkEmailParams
): Promise<EmailResult> {
  const { to, magicLink, expiresInMinutes = 15 } = params

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your ${APP_NAME} Login Link`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login to ${APP_NAME}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME}</h1>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #111827;">Login to Your Account</h2>
              <p>Click the button below to securely log in to your account. This link will expire in ${expiresInMinutes} minutes.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                  Log In to ${APP_NAME}
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280;">
                If you didn't request this login link, you can safely ignore this email.
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This email was sent by ${APP_NAME}</p>
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all; color: #6366f1;">${magicLink}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send magic link email', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Magic link email sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending magic link email', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Sends confirmation email to user after Free Pass request
 */
export async function sendFreePassRequestConfirmationEmail(
  params: FreePassRequestEmailParams
): Promise<EmailResult> {
  const { to, requestId } = params

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Free Pass Request Received - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME}</h1>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #111827;">Free Pass Request Received</h2>
              <p>Thank you for your interest in ${APP_NAME}!</p>
              <p>We've received your Free Pass request and our team will review it shortly. You'll receive an email once your request has been processed.</p>

              <div style="background: #e0e7ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>Request ID:</strong> ${requestId}
                </p>
              </div>

              <p style="font-size: 14px; color: #6b7280;">
                Most requests are reviewed within 24 hours during business days.
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This email was sent by ${APP_NAME}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send Free Pass confirmation', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Free Pass confirmation sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending Free Pass confirmation', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Sends notification to admin about new Free Pass request
 */
export async function sendFreePassAdminNotificationEmail(
  params: FreePassRequestEmailParams
): Promise<EmailResult> {
  const { to = ADMIN_EMAIL, requestId, companyName } = params

  try {
    const adminUrl = `${APP_URL}/admin/free-pass`

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Free Pass Request${companyName ? ` from ${companyName}` : ''} - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME} Admin</h1>
            </div>

            <div style="background: #fef3c7; border-radius: 8px; padding: 30px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h2 style="margin-top: 0; color: #111827;">New Free Pass Request</h2>
              <p>A new Free Pass request has been submitted and requires your review.</p>

              <div style="background: white; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Request ID:</strong> ${requestId}</p>
                ${companyName ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${adminUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Review Request
                </a>
              </div>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This is an automated admin notification from ${APP_NAME}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send admin notification', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Admin notification sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending admin notification', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Sends approval email with login link for Free Pass
 */
export async function sendFreePassApprovalEmail(
  params: FreePassApprovalEmailParams
): Promise<EmailResult> {
  const { to, loginLink, expiresAt } = params

  const formattedExpiry = expiresAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Free Pass is Approved! - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME}</h1>
            </div>

            <div style="background: #ecfdf5; border-radius: 8px; padding: 30px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h2 style="margin-top: 0; color: #111827;">Your Free Pass is Ready!</h2>
              <p>Great news! Your Free Pass request has been approved. You now have 24-hour access to explore all premium features of ${APP_NAME}.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginLink}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                  Start Exploring Now
                </a>
              </div>

              <div style="background: white; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>Access Expires:</strong> ${formattedExpiry}
                </p>
              </div>

              <h3 style="color: #111827;">What you can explore:</h3>
              <ul style="color: #374151;">
                <li>Full asana library with 35+ yoga poses</li>
                <li>AI-powered program generation</li>
                <li>Real-time pose detection camera</li>
                <li>Progress tracking and analytics</li>
                <li>Guided practice sessions</li>
              </ul>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This email was sent by ${APP_NAME}</p>
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all; color: #6366f1;">${loginLink}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send approval email', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Approval email sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending approval email', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Sends rejection email for Free Pass
 */
export async function sendFreePassRejectionEmail(
  params: FreePassRejectionEmailParams
): Promise<EmailResult> {
  const { to, reason } = params

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Free Pass Request Update - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME}</h1>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #111827;">Free Pass Request Update</h2>
              <p>Thank you for your interest in ${APP_NAME}. Unfortunately, we're unable to approve your Free Pass request at this time.</p>

              ${reason ? `
                <div style="background: #fef2f2; border-radius: 6px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #991b1b;">
                    <strong>Reason:</strong> ${reason}
                  </p>
                </div>
              ` : ''}

              <p>If you believe this was a mistake or have questions, please don't hesitate to contact our support team.</p>

              <p style="font-size: 14px; color: #6b7280;">
                You may submit a new request after 7 days if your circumstances change.
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This email was sent by ${APP_NAME}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send rejection email', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Rejection email sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending rejection email', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Sends welcome email to new users
 */
export async function sendWelcomeEmail(
  params: WelcomeEmailParams
): Promise<EmailResult> {
  const { to, name } = params

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ${APP_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME}</h1>
            </div>

            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 30px; margin-bottom: 20px; color: white;">
              <h2 style="margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h2>
              <p>We're thrilled to have you join the ${APP_NAME} community. Your journey to better health and mindfulness starts now.</p>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #111827;">Get Started</h3>
              <ul style="color: #374151; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Explore our library of 35+ yoga poses</li>
                <li style="margin-bottom: 10px;">Create your first custom program</li>
                <li style="margin-bottom: 10px;">Set your practice goals</li>
                <li style="margin-bottom: 10px;">Start building your streak</li>
              </ul>

              <div style="text-align: center; margin-top: 20px;">
                <a href="${APP_URL}/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Go to Dashboard
                </a>
              </div>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This email was sent by ${APP_NAME}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send welcome email', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Welcome email sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending welcome email', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Sends streak warning email
 */
export async function sendStreakWarningEmail(
  params: StreakWarningEmailParams
): Promise<EmailResult> {
  const { to, currentStreak, name } = params

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Don't lose your ${currentStreak}-day streak! - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME}</h1>
            </div>

            <div style="background: #fef3c7; border-radius: 8px; padding: 30px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h2 style="margin-top: 0; color: #111827;">Your Streak is About to End!</h2>
              <p>Hey${name ? ` ${name}` : ''},</p>
              <p>You've built an amazing <strong>${currentStreak}-day streak</strong>! Don't let it slip away. Take just a few minutes today to keep it going.</p>

              <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 48px; font-weight: bold; color: #f59e0b;">${currentStreak}</div>
                <div style="color: #6b7280;">day streak</div>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${APP_URL}/practice" style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                  Practice Now
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                Even a 5-minute session counts towards your streak!
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This email was sent by ${APP_NAME}</p>
              <p><a href="${APP_URL}/settings/notifications" style="color: #6366f1;">Manage notification preferences</a></p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send streak warning', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Streak warning sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending streak warning', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Sends achievement unlock notification
 */
export async function sendAchievementEmail(
  params: AchievementEmailParams
): Promise<EmailResult> {
  const { to, achievementName, achievementDescription, name } = params

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Achievement Unlocked: ${achievementName}! - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">${APP_NAME}</h1>
            </div>

            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 8px; padding: 30px; margin-bottom: 20px; color: white; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 10px;">🏆</div>
              <h2 style="margin: 0;">Achievement Unlocked!</h2>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px; text-align: center;">
              <h3 style="margin-top: 0; color: #111827; font-size: 24px;">${achievementName}</h3>
              <p style="color: #6b7280;">${achievementDescription}</p>

              <p style="margin-top: 20px;">Congratulations${name ? `, ${name}` : ''}! Keep up the amazing work!</p>

              <div style="margin-top: 20px;">
                <a href="${APP_URL}/achievements" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  View All Achievements
                </a>
              </div>
            </div>

            <div style="text-align: center; font-size: 12px; color: #9ca3af;">
              <p>This email was sent by ${APP_NAME}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      emailLogger.error('Failed to send achievement email', error)
      return { success: false, error: error.message }
    }

    emailLogger.info('Achievement email sent', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    emailLogger.error('Error sending achievement email', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Checks if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Validates an email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
