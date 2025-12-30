/**
 * Admin Stats API
 * GET /api/admin/stats - Get platform-wide statistics
 */

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/stats
 * Get platform overview statistics
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'admin-stats')
  if (rateLimitResponse) return rateLimitResponse

  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // User statistics
    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsersToday,
      activeUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: thisWeek } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      prisma.practiceLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: today } },
      }).then((r) => r.length),
      prisma.practiceLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: thisWeek } },
      }).then((r) => r.length),
    ])

    // Content statistics
    const [
      totalAsanas,
      totalPrograms,
      totalPracticeSessions,
      totalPracticeMinutes,
    ] = await Promise.all([
      prisma.asana.count(),
      prisma.program.count(),
      prisma.practiceLog.count(),
      prisma.practiceLog.aggregate({
        _sum: { duration: true },
      }).then((r) => r._sum?.duration || 0),
    ])

    // Engagement statistics
    const [
      totalAchievements,
      achievementsUnlocked,
      averageStreak,
      activeGoals,
      completedGoals,
    ] = await Promise.all([
      prisma.achievement.count(),
      prisma.userAchievement.count({
        where: { unlockedAt: { not: null } },
      }),
      prisma.streak.aggregate({
        _avg: { currentStreak: true },
      }).then((r) => r._avg.currentStreak || 0),
      prisma.goal.count({
        where: { isActive: true, completed: false },
      }),
      prisma.goal.count({
        where: { completed: true },
      }),
    ])

    // Free Pass statistics
    const [
      freePassPending,
      freePassApproved,
      freePassCompleted,
    ] = await Promise.all([
      prisma.freePassRequest.count({ where: { status: 'PENDING' } }),
      prisma.freePassRequest.count({ where: { status: 'APPROVED' } }),
      prisma.freePassRequest.count({ where: { status: 'COMPLETED' } }),
    ])

    return successResponse({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        activeToday: activeUsersToday,
        activeThisWeek: activeUsersThisWeek,
      },
      content: {
        asanas: totalAsanas,
        programs: totalPrograms,
        practiceSessions: totalPracticeSessions,
        practiceMinutes: totalPracticeMinutes,
      },
      engagement: {
        totalAchievements,
        achievementsUnlocked,
        averageStreak: Math.round(averageStreak * 10) / 10,
        activeGoals,
        completedGoals,
      },
      freePass: {
        pending: freePassPending,
        approved: freePassApproved,
        completed: freePassCompleted,
      },
      generatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch statistics', 500)
  }
}
