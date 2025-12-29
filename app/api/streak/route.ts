import { NextRequest } from 'next/server'
import { requireAuthentication } from '@/lib/middleware/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes, validateBody } from '@/lib/api-utils'
import { getStreak, logPractice } from '@/lib/services/streak.service'
import { z } from 'zod'

// Validation schema for practice logging
const logPracticeSchema = z.object({
  duration: z.number().int().positive().max(360).default(30),
  programId: z.string().optional(),
  programName: z.string().optional(),
  moodBefore: z.number().int().min(1).max(5).optional(),
  moodAfter: z.number().int().min(1).max(5).optional(),
  energyLevel: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
  poses: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

// GET - Retrieve user's streak data
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'streak-read')
  if (rateLimitResponse) return rateLimitResponse

  // Authentication
  const authResult = await requireAuthentication()
  if (!authResult.success) {
    return authResult.response
  }

  const { user } = authResult.context

  try {
    const streakData = await getStreak(user.id)

    // Calculate milestones
    const milestones = [7, 30, 60, 100, 365]
    const nextMilestone = milestones.find((m) => m > streakData.currentStreak) || null

    return successResponse({
      streak: {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastPractice: streakData.lastPractice,
        freezesLeft: streakData.freezesLeft,
        freezesUsed: streakData.freezesUsed,
        totalPractices: streakData.totalPractices,
      },
      status: {
        isActiveToday: streakData.isActiveToday,
        willExpireToday: streakData.willExpireToday,
      },
      milestones: {
        next: nextMilestone,
        progress: nextMilestone
          ? Math.round((streakData.currentStreak / nextMilestone) * 100)
          : 100,
        achieved: milestones.filter((m) => streakData.currentStreak >= m),
      },
    })
  } catch (error) {
    console.error('Error fetching streak:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch streak data', 500)
  }
}

// POST - Record a practice session
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.write, 'streak-write')
  if (rateLimitResponse) return rateLimitResponse

  // Authentication
  const authResult = await requireAuthentication()
  if (!authResult.success) {
    return authResult.response
  }

  const { user } = authResult.context

  // Validate request body
  const validation = await validateBody(request, logPracticeSchema)
  if ('error' in validation) return validation.error

  const { duration, programId, programName, moodBefore, moodAfter, energyLevel, notes, poses, tags } = validation.data

  try {
    const result = await logPractice(user.id, {
      duration,
      programId,
      programName,
      moodBefore,
      moodAfter,
      energyLevel,
      notes,
      poses,
      tags,
    })

    // Check for milestone achievement
    const milestones = [7, 30, 60, 100, 365]
    const achievedMilestone = milestones.find(
      (m) =>
        result.streak.currentStreak >= m &&
        result.streak.currentStreak - 1 < m
    )

    return successResponse({
      practiceLog: {
        id: result.practiceLog.id,
        duration: result.practiceLog.duration,
        createdAt: result.practiceLog.createdAt,
      },
      streak: result.streak,
      achievedMilestone: achievedMilestone || null,
    })
  } catch (error) {
    console.error('Error recording practice:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to record practice', 500)
  }
}
