/**
 * Streak Service
 *
 * Business logic for practice streak tracking.
 */

import prisma from '@/lib/db'
import { cache, CacheKeys, CacheTTL, invalidateUserCache } from '@/lib/cache'

// ============================================
// Types
// ============================================

export interface StreakData {
  currentStreak: number
  longestStreak: number
  freezesLeft: number
  freezesUsed: number
  lastPractice: Date | null
  totalPractices: number
  isActiveToday: boolean
  willExpireToday: boolean
}

export interface LogPracticeInput {
  duration: number
  programId?: string
  programName?: string
  moodBefore?: number
  moodAfter?: number
  energyLevel?: number
  notes?: string
  poses?: string[]
  tags?: string[]
}

// ============================================
// Helper Functions
// ============================================

function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = getStartOfDay(date1)
  const d2 = getStartOfDay(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

// ============================================
// Service Functions
// ============================================

/**
 * Get user's streak data
 */
export async function getStreak(userId: string): Promise<StreakData> {
  const cacheKey = CacheKeys.user.streak(userId)

  return cache.getOrSet(
    cacheKey,
    async () => {
      const streak = await prisma.streak.findUnique({
        where: { userId },
      })

      if (!streak) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          freezesLeft: 2,
          freezesUsed: 0,
          lastPractice: null,
          totalPractices: 0,
          isActiveToday: false,
          willExpireToday: false,
        }
      }

      const lastPractice = streak.lastPractice
      const isActiveToday = lastPractice ? isToday(lastPractice) : false
      const willExpireToday = lastPractice
        ? isYesterday(lastPractice) && !isActiveToday
        : false

      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        freezesLeft: streak.freezesLeft,
        freezesUsed: streak.freezesUsed,
        lastPractice,
        totalPractices: streak.totalPractices,
        isActiveToday,
        willExpireToday,
      }
    },
    CacheTTL.SHORT
  )
}

/**
 * Log a practice session and update streak
 */
export async function logPractice(userId: string, input: LogPracticeInput) {
  const {
    duration,
    programId,
    programName,
    moodBefore,
    moodAfter,
    energyLevel,
    notes,
    poses,
    tags,
  } = input

  const today = getStartOfDay(new Date())

  // Create practice log
  const practiceLog = await prisma.practiceLog.create({
    data: {
      userId,
      programId,
      programName,
      duration,
      moodBefore,
      moodAfter,
      energyLevel,
      notes,
      poses: poses || [],
      tags: tags || [],
    },
  })

  // Get or create streak
  let streak = await prisma.streak.findUnique({
    where: { userId },
  })

  if (!streak) {
    // Create new streak
    streak = await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastPractice: new Date(),
        freezesLeft: 2,
        freezesUsed: 0,
        totalPractices: 1,
      },
    })
  } else {
    // Check if already practiced today
    const existingPracticeToday = await prisma.practiceDay.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    })

    if (!existingPracticeToday) {
      // Get last practice day
      const lastPracticeDay = await prisma.practiceDay.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      })

      let newCurrentStreak = 1

      if (lastPracticeDay) {
        const daysDiff = getDaysDifference(today, lastPracticeDay.date)

        if (daysDiff === 1) {
          // Consecutive day - continue streak
          newCurrentStreak = streak.currentStreak + 1
        } else if (daysDiff === 0) {
          // Same day - no change
          newCurrentStreak = streak.currentStreak
        }
        // If more than 1 day, streak resets to 1
      }

      const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak)

      streak = await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastPractice: new Date(),
          totalPractices: { increment: 1 },
        },
      })
    } else {
      // Already practiced today, just update total
      streak = await prisma.streak.update({
        where: { userId },
        data: {
          lastPractice: new Date(),
        },
      })
    }
  }

  // Record or update practice day
  await prisma.practiceDay.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      sessions: { increment: 1 },
      duration: { increment: duration },
    },
    create: {
      userId,
      date: today,
      sessions: 1,
      duration,
    },
  })

  // Invalidate cache
  invalidateUserCache(userId)

  return {
    practiceLog: {
      id: practiceLog.id,
      duration: practiceLog.duration,
      createdAt: practiceLog.createdAt,
    },
    streak: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
    },
  }
}

/**
 * Use a streak freeze to protect streak
 */
export async function useStreakFreeze(userId: string): Promise<boolean> {
  const streak = await prisma.streak.findUnique({
    where: { userId },
  })

  if (!streak) {
    return false
  }

  if (streak.freezesLeft <= 0) {
    return false
  }

  // Check if streak actually needs saving
  const lastPracticeDay = await prisma.practiceDay.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  if (!lastPracticeDay) {
    return false
  }

  const daysSinceLastPractice = getDaysDifference(new Date(), lastPracticeDay.date)

  // Can only freeze if missed exactly one day
  if (daysSinceLastPractice !== 1) {
    return false
  }

  // Apply freeze
  await prisma.streak.update({
    where: { userId },
    data: {
      freezesLeft: { decrement: 1 },
      freezesUsed: { increment: 1 },
    },
  })

  // Add a "freeze" day to maintain continuity
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  await prisma.practiceDay.create({
    data: {
      userId,
      date: getStartOfDay(yesterday),
      sessions: 0,
      duration: 0,
      wasFrozen: true,
    },
  })

  invalidateUserCache(userId)

  return true
}

/**
 * Get practice history for a user
 */
export async function getPracticeHistory(
  userId: string,
  limit: number = 30
) {
  return prisma.practiceLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Get practice calendar data
 */
export async function getPracticeCalendar(
  userId: string,
  year: number,
  month: number
) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  return prisma.practiceDay.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  })
}

/**
 * Get streak leaderboard
 */
export async function getStreakLeaderboard(limit: number = 10) {
  return prisma.streak.findMany({
    where: { currentStreak: { gt: 0 } },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { currentStreak: 'desc' },
    take: limit,
  })
}

/**
 * Clear streak cache for user
 */
export function clearStreakCache(userId: string): void {
  cache.delete(CacheKeys.user.streak(userId))
}
