import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// Helper to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Helper to check if date is yesterday
function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

// Helper to get start of day
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Reset freezes if it's a new month
async function resetMonthlyFreezesIfNeeded(streak: {
  id: string;
  lastFreezeReset: Date | null;
}) {
  const today = new Date();
  const lastReset = streak.lastFreezeReset;

  if (
    !lastReset ||
    lastReset.getMonth() !== today.getMonth() ||
    lastReset.getFullYear() !== today.getFullYear()
  ) {
    await prisma.streak.update({
      where: { id: streak.id },
      data: {
        freezesLeft: 2,
        freezesUsed: 0,
        lastFreezeReset: today,
      },
    });
    return { freezesLeft: 2, freezesUsed: 0 };
  }
  return null;
}

// GET - Retrieve user's streak data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get or create streak record
    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: { userId },
      });
    }

    // Reset monthly freezes if needed
    const freezeReset = await resetMonthlyFreezesIfNeeded(streak);
    if (freezeReset) {
      streak = { ...streak, ...freezeReset };
    }

    // Check if streak is broken (no practice yesterday or today)
    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (streak.lastPractice) {
      const lastPractice = startOfDay(new Date(streak.lastPractice));
      const daysSinceLastPractice = Math.floor(
        (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If more than 1 day gap, streak is broken (unless freeze was used)
      if (daysSinceLastPractice > 1 && streak.currentStreak > 0) {
        // Check if a freeze was used for yesterday
        const frozenDay = await prisma.practiceDay.findUnique({
          where: {
            userId_date: {
              userId,
              date: yesterday,
            },
          },
        });

        if (!frozenDay?.wasFrozen) {
          // Streak is broken
          await prisma.streak.update({
            where: { id: streak.id },
            data: { currentStreak: 0 },
          });
          streak = { ...streak, currentStreak: 0 };
        }
      }
    }

    // Get practice days for calendar (last 90 days)
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const practiceDays = await prisma.practiceDay.findMany({
      where: {
        userId,
        date: {
          gte: ninetyDaysAgo,
        },
      },
      orderBy: { date: "desc" },
    });

    // Get milestone info
    const milestones = [7, 30, 60, 100, 365];
    const nextMilestone = milestones.find((m) => m > streak.currentStreak) || null;
    const recentMilestones = milestones.filter(
      (m) => m <= streak.currentStreak && m > streak.currentStreak - 7
    );

    return NextResponse.json({
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastPractice: streak.lastPractice,
        freezesLeft: streak.freezesLeft,
        totalPractices: streak.totalPractices,
      },
      practiceDays: practiceDays.map((pd) => ({
        date: pd.date.toISOString().split("T")[0],
        duration: pd.duration,
        sessions: pd.sessions,
        wasFrozen: pd.wasFrozen,
      })),
      milestones: {
        next: nextMilestone,
        recent: recentMilestones,
        all: milestones.map((m) => ({
          days: m,
          achieved: streak.currentStreak >= m,
          achievedAt:
            streak.longestStreak >= m ? streak.longestStreak >= m : null,
        })),
      },
      practicedToday: streak.lastPractice
        ? isSameDay(new Date(streak.lastPractice), today)
        : false,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }
}

// POST - Record a practice session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { duration = 0 } = body;

    const today = startOfDay(new Date());

    // Get or create streak record
    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: { userId },
      });
    }

    // Reset monthly freezes if needed
    await resetMonthlyFreezesIfNeeded(streak);

    // Check if already practiced today
    const existingPractice = await prisma.practiceDay.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const alreadyPracticedToday = !!existingPractice && !existingPractice.wasFrozen;

    // Calculate new streak value
    let newStreak = streak.currentStreak;
    const lastPractice = streak.lastPractice
      ? startOfDay(new Date(streak.lastPractice))
      : null;

    if (!alreadyPracticedToday) {
      if (!lastPractice) {
        // First ever practice
        newStreak = 1;
      } else if (isSameDay(lastPractice, today)) {
        // Already counted today
        newStreak = streak.currentStreak;
      } else if (isYesterday(lastPractice, today)) {
        // Continuing streak
        newStreak = streak.currentStreak + 1;
      } else {
        // Gap in practice - check for freeze
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const frozenYesterday = await prisma.practiceDay.findUnique({
          where: {
            userId_date: {
              userId,
              date: yesterday,
            },
          },
        });

        if (frozenYesterday?.wasFrozen) {
          // Freeze was used, continue streak
          newStreak = streak.currentStreak + 1;
        } else {
          // Streak broken, start new
          newStreak = 1;
        }
      }
    }

    // Update or create practice day
    if (existingPractice) {
      await prisma.practiceDay.update({
        where: { id: existingPractice.id },
        data: {
          duration: existingPractice.duration + duration,
          sessions: existingPractice.sessions + 1,
          wasFrozen: false, // Convert frozen day to actual practice
        },
      });
    } else {
      await prisma.practiceDay.create({
        data: {
          userId,
          date: today,
          duration,
          sessions: 1,
        },
      });
    }

    // Update streak record
    const updatedStreak = await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(streak.longestStreak, newStreak),
        lastPractice: new Date(),
        totalPractices: streak.totalPractices + 1,
      },
    });

    // Check for milestone achievement
    const milestones = [7, 30, 60, 100, 365];
    const achievedMilestone = milestones.find(
      (m) => newStreak === m && streak.currentStreak < m
    );

    return NextResponse.json({
      success: true,
      streak: {
        currentStreak: updatedStreak.currentStreak,
        longestStreak: updatedStreak.longestStreak,
        lastPractice: updatedStreak.lastPractice,
        freezesLeft: updatedStreak.freezesLeft,
        totalPractices: updatedStreak.totalPractices,
      },
      achievedMilestone,
      isNewStreak: !alreadyPracticedToday,
    });
  } catch (error) {
    console.error("Error recording practice:", error);
    return NextResponse.json(
      { error: "Failed to record practice" },
      { status: 500 }
    );
  }
}
