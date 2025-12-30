/**
 * @fileoverview Push Notification Service
 *
 * Web Push API implementation for sending push notifications to users.
 * Handles subscription management and notification delivery.
 *
 * @module lib/push-notifications
 *
 * @example
 * ```ts
 * import { sendPushNotification, sendStreakWarning } from '@/lib/push-notifications'
 *
 * // Send a custom notification
 * await sendPushNotification(userId, {
 *   title: 'New Achievement!',
 *   body: 'You unlocked the "First Steps" badge',
 *   icon: '/icons/achievement.png',
 *   data: { type: 'achievement', id: 'first-steps' }
 * })
 *
 * // Send streak warning
 * await sendStreakWarning(userId, currentStreak)
 * ```
 */

import webpush from 'web-push'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// ============================================
// Configuration
// ============================================

const pushLogger = logger.child({ service: 'push-notifications' })

// VAPID keys for Web Push
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@yourdomain.com'

// Configure web-push if keys are available
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

const APP_NAME = 'Yoga Platform'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// ============================================
// Types
// ============================================

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
}

export interface NotificationResult {
  success: boolean
  sent: number
  failed: number
  errors?: string[]
}

export interface SubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export type NotificationType =
  | 'streak_warning'
  | 'streak_lost'
  | 'practice_reminder'
  | 'achievement_unlocked'
  | 'goal_progress'
  | 'goal_completed'
  | 'new_content'
  | 'general'

// ============================================
// Core Functions
// ============================================

/**
 * Check if push notifications are configured
 */
export function isPushConfigured(): boolean {
  return !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
}

/**
 * Get the public VAPID key for client subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY
}

/**
 * Subscribe a user to push notifications
 */
export async function subscribeUser(
  userId: string,
  subscription: SubscriptionData,
  deviceInfo?: { userAgent?: string; deviceName?: string }
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    // Check if this endpoint already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    })

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: deviceInfo?.userAgent,
          deviceName: deviceInfo?.deviceName,
          updatedAt: new Date(),
        },
      })

      pushLogger.info('Updated push subscription', { userId, endpoint: subscription.endpoint })
      return { success: true, subscriptionId: existing.id }
    }

    // Create new subscription
    const newSubscription = await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: deviceInfo?.userAgent,
        deviceName: deviceInfo?.deviceName,
      },
    })

    pushLogger.info('Created push subscription', { userId, subscriptionId: newSubscription.id })
    return { success: true, subscriptionId: newSubscription.id }
  } catch (error) {
    pushLogger.error('Failed to subscribe user', error as Error, { userId })
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Unsubscribe a user from push notifications
 */
export async function unsubscribeUser(
  userId: string,
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    })

    pushLogger.info('Deleted push subscription', { userId, endpoint })
    return { success: true }
  } catch (error) {
    pushLogger.error('Failed to unsubscribe user', error as Error, { userId })
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Send a push notification to a user
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload,
  type: NotificationType = 'general'
): Promise<NotificationResult> {
  if (!isPushConfigured()) {
    pushLogger.warn('Push notifications not configured')
    return { success: false, sent: 0, failed: 0, errors: ['Push not configured'] }
  }

  try {
    // Get user's subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })

    if (subscriptions.length === 0) {
      return { success: true, sent: 0, failed: 0 }
    }

    // Filter based on notification preferences
    const activeSubscriptions = subscriptions.filter((sub) => {
      switch (type) {
        case 'streak_warning':
        case 'streak_lost':
          return sub.streakReminders
        case 'practice_reminder':
          return sub.practiceReminders
        case 'achievement_unlocked':
          return sub.achievements
        case 'goal_progress':
        case 'goal_completed':
          return sub.goalProgress
        case 'new_content':
          return sub.newContent
        default:
          return true
      }
    })

    if (activeSubscriptions.length === 0) {
      return { success: true, sent: 0, failed: 0 }
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      ...payload,
      icon: payload.icon || '/icons/icon.svg',
      badge: payload.badge || '/icons/icon.svg',
      data: {
        ...payload.data,
        type,
        url: APP_URL,
      },
    })

    // Send to all active subscriptions
    let sent = 0
    let failed = 0
    const errors: string[] = []
    const expiredEndpoints: string[] = []

    await Promise.all(
      activeSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            notificationPayload
          )
          sent++
        } catch (error) {
          failed++
          const err = error as { statusCode?: number; message?: string }

          // Handle expired/invalid subscriptions
          if (err.statusCode === 404 || err.statusCode === 410) {
            expiredEndpoints.push(sub.endpoint)
          } else {
            errors.push(err.message || 'Unknown error')
          }
        }
      })
    )

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: expiredEndpoints } },
      })
      pushLogger.info('Cleaned up expired subscriptions', { count: expiredEndpoints.length })
    }

    // Log notification
    await prisma.notificationLog.create({
      data: {
        userId,
        type,
        title: payload.title,
        body: payload.body,
        data: payload.data ? JSON.parse(JSON.stringify(payload.data)) : undefined,
        sent: sent > 0,
        sentAt: sent > 0 ? new Date() : null,
        error: errors.length > 0 ? errors.join(', ') : null,
      },
    })

    pushLogger.info('Sent push notification', { userId, type, sent, failed })
    return { success: sent > 0, sent, failed, errors: errors.length > 0 ? errors : undefined }
  } catch (error) {
    pushLogger.error('Failed to send push notification', error as Error, { userId })
    return { success: false, sent: 0, failed: 0, errors: [(error as Error).message] }
  }
}

// ============================================
// Notification Helpers
// ============================================

/**
 * Send streak warning notification
 */
export async function sendStreakWarning(
  userId: string,
  currentStreak: number
): Promise<NotificationResult> {
  return sendPushNotification(
    userId,
    {
      title: "Don't lose your streak!",
      body: `You have a ${currentStreak}-day streak. Practice today to keep it going!`,
      tag: 'streak-warning',
      data: { streakCount: currentStreak },
      actions: [
        { action: 'practice', title: 'Practice Now' },
        { action: 'dismiss', title: 'Later' },
      ],
      requireInteraction: true,
    },
    'streak_warning'
  )
}

/**
 * Send streak lost notification
 */
export async function sendStreakLost(
  userId: string,
  previousStreak: number
): Promise<NotificationResult> {
  return sendPushNotification(
    userId,
    {
      title: 'Streak ended',
      body: `Your ${previousStreak}-day streak has ended. Start a new one today!`,
      tag: 'streak-lost',
      data: { previousStreak },
      actions: [{ action: 'practice', title: 'Start Again' }],
    },
    'streak_lost'
  )
}

/**
 * Send practice reminder notification
 */
export async function sendPracticeReminder(
  userId: string,
  reminderTitle?: string
): Promise<NotificationResult> {
  return sendPushNotification(
    userId,
    {
      title: reminderTitle || 'Time for yoga!',
      body: "It's your scheduled practice time. Ready to flow?",
      tag: 'practice-reminder',
      actions: [
        { action: 'practice', title: 'Start Practice' },
        { action: 'snooze', title: 'Snooze 15 min' },
      ],
    },
    'practice_reminder'
  )
}

/**
 * Send achievement unlocked notification
 */
export async function sendAchievementNotification(
  userId: string,
  achievementName: string,
  achievementDescription: string
): Promise<NotificationResult> {
  return sendPushNotification(
    userId,
    {
      title: `Achievement Unlocked: ${achievementName}`,
      body: achievementDescription,
      tag: `achievement-${achievementName.toLowerCase().replace(/\s+/g, '-')}`,
      data: { achievementName },
      actions: [{ action: 'view', title: 'View Achievement' }],
    },
    'achievement_unlocked'
  )
}

/**
 * Send goal progress notification
 */
export async function sendGoalProgressNotification(
  userId: string,
  goalTitle: string,
  progress: number,
  target: number
): Promise<NotificationResult> {
  const percentage = Math.round((progress / target) * 100)

  return sendPushNotification(
    userId,
    {
      title: 'Goal Progress',
      body: `${goalTitle}: ${progress}/${target} (${percentage}%)`,
      tag: 'goal-progress',
      data: { goalTitle, progress, target, percentage },
    },
    'goal_progress'
  )
}

/**
 * Send goal completed notification
 */
export async function sendGoalCompletedNotification(
  userId: string,
  goalTitle: string
): Promise<NotificationResult> {
  return sendPushNotification(
    userId,
    {
      title: 'Goal Completed!',
      body: `Congratulations! You completed: ${goalTitle}`,
      tag: 'goal-completed',
      data: { goalTitle },
      actions: [{ action: 'view', title: 'View Goals' }],
      requireInteraction: true,
    },
    'goal_completed'
  )
}

// ============================================
// Subscription Management
// ============================================

/**
 * Get user's push subscriptions
 */
export async function getUserSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({
    where: { userId },
    select: {
      id: true,
      deviceName: true,
      userAgent: true,
      streakReminders: true,
      practiceReminders: true,
      achievements: true,
      goalProgress: true,
      newContent: true,
      createdAt: true,
    },
  })
}

/**
 * Update subscription preferences
 */
export async function updateSubscriptionPreferences(
  subscriptionId: string,
  preferences: {
    streakReminders?: boolean
    practiceReminders?: boolean
    achievements?: boolean
    goalProgress?: boolean
    newContent?: boolean
    deviceName?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pushSubscription.update({
      where: { id: subscriptionId },
      data: preferences,
    })

    return { success: true }
  } catch (error) {
    pushLogger.error('Failed to update preferences', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Delete a subscription by ID
 */
export async function deleteSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pushSubscription.delete({
      where: { id: subscriptionId },
    })

    return { success: true }
  } catch (error) {
    pushLogger.error('Failed to delete subscription', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

// ============================================
// Batch Notifications
// ============================================

/**
 * Send notifications to multiple users
 * Useful for scheduled notifications like daily reminders
 */
export async function sendBatchNotification(
  userIds: string[],
  payload: NotificationPayload,
  type: NotificationType = 'general'
): Promise<{ total: number; sent: number; failed: number }> {
  let totalSent = 0
  let totalFailed = 0

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, payload, type)
    totalSent += result.sent
    totalFailed += result.failed
  }

  pushLogger.info('Completed batch notification', {
    type,
    userCount: userIds.length,
    totalSent,
    totalFailed,
  })

  return { total: userIds.length, sent: totalSent, failed: totalFailed }
}
