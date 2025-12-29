/**
 * User Service
 *
 * Business logic for user-related operations.
 */

import prisma from '@/lib/db'
import { cache, CacheKeys, CacheTTL, invalidateUserCache } from '@/lib/cache'
import { hashPassword } from '@/lib/auth'

// ============================================
// Types
// ============================================

export interface CreateUserInput {
  email: string
  password: string
  name?: string
}

export interface UpdateProfileInput {
  name?: string
  image?: string
  experienceLevel?: string
  goals?: string[]
  preferredDuration?: number
}

export interface UserStats {
  totalPracticeSessions: number
  totalPracticeMinutes: number
  currentStreak: number
  longestStreak: number
  favoriteAsanasCount: number
  programsCreated: number
  achievementsUnlocked: number
}

// ============================================
// Service Functions
// ============================================

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput) {
  const { email, password, name } = input

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
      password: hashedPassword,
      profile: {
        create: {
          experienceLevel: 'beginner',
          goals: [],
          conditions: [],
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  })

  return user
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
    },
  })
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  })
  return !!user
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const cacheKey = CacheKeys.user.profile(userId)

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.userProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              createdAt: true,
            },
          },
        },
      })
    },
    CacheTTL.MEDIUM
  )
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const { name, image, experienceLevel, goals, preferredDuration } = input

  // Update user basic info if provided
  if (name !== undefined || image !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
      },
    })
  }

  // Update profile
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      ...(experienceLevel !== undefined && { experienceLevel }),
      ...(goals !== undefined && { goals }),
      ...(preferredDuration !== undefined && { preferredDuration }),
    },
    create: {
      userId,
      experienceLevel: experienceLevel || 'beginner',
      goals: goals || [],
      preferredDuration,
      conditions: [],
    },
  })

  // Invalidate cache
  invalidateUserCache(userId)

  return profile
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const cacheKey = CacheKeys.stats.user(userId)

  return cache.getOrSet(
    cacheKey,
    async () => {
      const [
        practiceLogs,
        streak,
        favorites,
        programs,
        achievements,
      ] = await Promise.all([
        prisma.practiceLog.aggregate({
          where: { userId },
          _count: true,
          _sum: { duration: true },
        }),
        prisma.streak.findUnique({
          where: { userId },
          select: { currentStreak: true, longestStreak: true },
        }),
        prisma.favorite.count({ where: { userId } }),
        prisma.program.count({ where: { userId } }),
        prisma.userAchievement.count({
          where: { userId, unlockedAt: { not: null } },
        }),
      ])

      return {
        totalPracticeSessions: practiceLogs._count,
        totalPracticeMinutes: practiceLogs._sum.duration || 0,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        favoriteAsanasCount: favorites,
        programsCreated: programs,
        achievementsUnlocked: achievements,
      }
    },
    CacheTTL.DASHBOARD
  )
}

/**
 * Get user's health conditions
 */
export async function getUserConditions(userId: string) {
  return prisma.userCondition.findMany({
    where: { userId, isActive: true },
    include: {
      condition: true,
    },
  })
}

/**
 * Add health condition to user
 */
export async function addUserCondition(
  userId: string,
  conditionId: string,
  severity?: string,
  notes?: string
) {
  const condition = await prisma.userCondition.upsert({
    where: {
      userId_conditionId: { userId, conditionId },
    },
    update: {
      isActive: true,
      severity,
      notes,
    },
    create: {
      userId,
      conditionId,
      severity,
      notes,
      isActive: true,
    },
    include: {
      condition: true,
    },
  })

  invalidateUserCache(userId)

  return condition
}

/**
 * Remove health condition from user
 */
export async function removeUserCondition(userId: string, conditionId: string) {
  await prisma.userCondition.update({
    where: {
      userId_conditionId: { userId, conditionId },
    },
    data: { isActive: false },
  })

  invalidateUserCache(userId)
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: string) {
  const cacheKey = CacheKeys.user.favorites(userId)

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.favorite.findMany({
        where: { userId },
        include: {
          asana: {
            select: {
              id: true,
              nameEnglish: true,
              nameSanskrit: true,
              category: true,
              difficulty: true,
              svgPath: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    },
    CacheTTL.MEDIUM
  )
}

/**
 * Toggle favorite status for an asana
 */
export async function toggleFavorite(userId: string, asanaId: string): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_asanaId: { userId, asanaId },
    },
  })

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    })
    invalidateUserCache(userId)
    return false
  }

  await prisma.favorite.create({
    data: { userId, asanaId },
  })

  invalidateUserCache(userId)
  return true
}

/**
 * Check if asana is favorited
 */
export async function isFavorited(userId: string, asanaId: string): Promise<boolean> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_asanaId: { userId, asanaId },
    },
    select: { id: true },
  })
  return !!favorite
}

/**
 * Clear user cache
 */
export function clearUserCache(userId: string): void {
  invalidateUserCache(userId)
}
