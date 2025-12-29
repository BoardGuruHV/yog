import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// Helper to get start of day
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST - Use a streak freeze for yesterday
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get streak record
    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      return NextResponse.json(
        { error: "No streak record found" },
        { status: 404 }
      );
    }

    // Check if freezes are available
    if (streak.freezesLeft <= 0) {
      return NextResponse.json(
        { error: "No streak freezes remaining this month" },
        { status: 400 }
      );
    }

    // Get yesterday's date
    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if already practiced or froze yesterday
    const existingDay = await prisma.practiceDay.findUnique({
      where: {
        userId_date: {
          userId,
          date: yesterday,
        },
      },
    });

    if (existingDay && !existingDay.wasFrozen) {
      return NextResponse.json(
        { error: "You already practiced yesterday!" },
        { status: 400 }
      );
    }

    if (existingDay?.wasFrozen) {
      return NextResponse.json(
        { error: "You already used a freeze for yesterday" },
        { status: 400 }
      );
    }

    // Check if streak would be broken (last practice was 2+ days ago)
    if (streak.lastPractice) {
      const lastPractice = startOfDay(new Date(streak.lastPractice));
      const daysSinceLastPractice = Math.floor(
        (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Can only freeze if last practice was exactly 2 days ago (yesterday was missed)
      if (daysSinceLastPractice < 2) {
        return NextResponse.json(
          { error: "Your streak is not at risk - no freeze needed" },
          { status: 400 }
        );
      }

      if (daysSinceLastPractice > 2) {
        return NextResponse.json(
          {
            error:
              "Too late to use a freeze - your streak has already been broken",
          },
          { status: 400 }
        );
      }
    }

    // Create frozen practice day
    await prisma.practiceDay.create({
      data: {
        userId,
        date: yesterday,
        duration: 0,
        sessions: 0,
        wasFrozen: true,
      },
    });

    // Update streak record
    const updatedStreak = await prisma.streak.update({
      where: { id: streak.id },
      data: {
        freezesLeft: streak.freezesLeft - 1,
        freezesUsed: streak.freezesUsed + 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Streak freeze used successfully!",
      freezesLeft: updatedStreak.freezesLeft,
      currentStreak: updatedStreak.currentStreak,
    });
  } catch (error) {
    console.error("Error using freeze:", error);
    return NextResponse.json(
      { error: "Failed to use streak freeze" },
      { status: 500 }
    );
  }
}
