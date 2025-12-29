import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { Category } from "@prisma/client";

// Mastery level thresholds
const MASTERY_LEVELS = {
  1: { name: "Learning", minPractices: 0, color: "gray" },
  2: { name: "Practicing", minPractices: 5, color: "blue" },
  3: { name: "Comfortable", minPractices: 20, color: "green" },
  4: { name: "Proficient", minPractices: 50, color: "purple" },
  5: { name: "Mastered", minPractices: 100, color: "gold" },
};

// Calculate mastery level based on practice count
function calculateMasteryLevel(practiceCount: number): number {
  if (practiceCount >= 100) return 5;
  if (practiceCount >= 50) return 4;
  if (practiceCount >= 20) return 3;
  if (practiceCount >= 5) return 2;
  return 1;
}

// GET - Retrieve all mastery data for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const asanaId = searchParams.get("asanaId");
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    // If specific asana requested
    if (asanaId) {
      const mastery = await prisma.poseMastery.findUnique({
        where: {
          userId_asanaId: { userId, asanaId },
        },
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
      });

      return NextResponse.json({
        mastery: mastery
          ? {
              ...mastery,
              levelInfo: MASTERY_LEVELS[mastery.level as keyof typeof MASTERY_LEVELS],
              nextLevel: mastery.level < 5 ? MASTERY_LEVELS[(mastery.level + 1) as keyof typeof MASTERY_LEVELS] : null,
              practicesUntilNextLevel:
                mastery.level < 5
                  ? MASTERY_LEVELS[(mastery.level + 1) as keyof typeof MASTERY_LEVELS].minPractices -
                    mastery.practiceCount
                  : 0,
            }
          : null,
      });
    }

    // Get all mastery records
    const masteries = await prisma.poseMastery.findMany({
      where: {
        userId,
        ...(level && { level: parseInt(level, 10) }),
        ...(category && { asana: { category: category as Category } }),
      },
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
      orderBy: [{ level: "desc" }, { practiceCount: "desc" }],
    });

    // Get all asanas for comparison
    const allAsanas = await prisma.asana.findMany({
      select: {
        id: true,
        nameEnglish: true,
        nameSanskrit: true,
        category: true,
        difficulty: true,
        svgPath: true,
      },
    });

    // Calculate stats
    const masteredCount = masteries.filter((m) => m.level === 5).length;
    const proficientCount = masteries.filter((m) => m.level === 4).length;
    const comfortableCount = masteries.filter((m) => m.level === 3).length;
    const practicingCount = masteries.filter((m) => m.level === 2).length;
    const learningCount = masteries.filter((m) => m.level === 1).length;
    const notStartedCount = allAsanas.length - masteries.length;

    const totalPractices = masteries.reduce((sum, m) => sum + m.practiceCount, 0);
    const totalDuration = masteries.reduce((sum, m) => sum + m.totalDuration, 0);

    // Category breakdown
    const categoryStats: Record<string, { total: number; practiced: number; mastered: number }> = {};
    allAsanas.forEach((asana) => {
      if (!categoryStats[asana.category]) {
        categoryStats[asana.category] = { total: 0, practiced: 0, mastered: 0 };
      }
      categoryStats[asana.category].total++;
    });
    masteries.forEach((m) => {
      if (m.asana && categoryStats[m.asana.category]) {
        categoryStats[m.asana.category].practiced++;
        if (m.level === 5) {
          categoryStats[m.asana.category].mastered++;
        }
      }
    });

    return NextResponse.json({
      masteries: masteries.map((m) => ({
        ...m,
        levelInfo: MASTERY_LEVELS[m.level as keyof typeof MASTERY_LEVELS],
        nextLevel: m.level < 5 ? MASTERY_LEVELS[(m.level + 1) as keyof typeof MASTERY_LEVELS] : null,
        practicesUntilNextLevel:
          m.level < 5
            ? MASTERY_LEVELS[(m.level + 1) as keyof typeof MASTERY_LEVELS].minPractices - m.practiceCount
            : 0,
      })),
      stats: {
        totalAsanas: allAsanas.length,
        practicedAsanas: masteries.length,
        masteredCount,
        proficientCount,
        comfortableCount,
        practicingCount,
        learningCount,
        notStartedCount,
        totalPractices,
        totalDurationMinutes: Math.round(totalDuration / 60),
        overallProgress: Math.round((masteries.length / allAsanas.length) * 100),
        masteryProgress: Math.round((masteredCount / allAsanas.length) * 100),
      },
      categoryStats,
      levels: MASTERY_LEVELS,
    });
  } catch (error) {
    console.error("Error fetching mastery:", error);
    return NextResponse.json(
      { error: "Failed to fetch mastery data" },
      { status: 500 }
    );
  }
}

// POST - Record a practice session for an asana
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { asanaId, duration = 30, notes } = body;

    if (!asanaId) {
      return NextResponse.json(
        { error: "asanaId is required" },
        { status: 400 }
      );
    }

    // Check if asana exists
    const asana = await prisma.asana.findUnique({
      where: { id: asanaId },
    });

    if (!asana) {
      return NextResponse.json({ error: "Asana not found" }, { status: 404 });
    }

    // Get or create mastery record
    let mastery = await prisma.poseMastery.findUnique({
      where: {
        userId_asanaId: { userId, asanaId },
      },
    });

    if (mastery) {
      // Update existing mastery
      const newPracticeCount = mastery.practiceCount + 1;
      const newTotalDuration = mastery.totalDuration + duration;
      const newBestHoldTime = Math.max(mastery.bestHoldTime, duration);
      const newLevel = calculateMasteryLevel(newPracticeCount);

      mastery = await prisma.poseMastery.update({
        where: { id: mastery.id },
        data: {
          practiceCount: newPracticeCount,
          totalDuration: newTotalDuration,
          bestHoldTime: newBestHoldTime,
          level: newLevel,
          lastPracticed: new Date(),
          notes: notes || mastery.notes,
        },
      });
    } else {
      // Create new mastery record
      mastery = await prisma.poseMastery.create({
        data: {
          userId,
          asanaId,
          practiceCount: 1,
          totalDuration: duration,
          bestHoldTime: duration,
          level: 1,
          lastPracticed: new Date(),
          notes,
        },
      });
    }

    // Check for level up
    const previousLevel = mastery.practiceCount > 1
      ? calculateMasteryLevel(mastery.practiceCount - 1)
      : 0;
    const leveledUp = mastery.level > previousLevel;

    return NextResponse.json({
      success: true,
      mastery: {
        ...mastery,
        levelInfo: MASTERY_LEVELS[mastery.level as keyof typeof MASTERY_LEVELS],
        nextLevel: mastery.level < 5 ? MASTERY_LEVELS[(mastery.level + 1) as keyof typeof MASTERY_LEVELS] : null,
        practicesUntilNextLevel:
          mastery.level < 5
            ? MASTERY_LEVELS[(mastery.level + 1) as keyof typeof MASTERY_LEVELS].minPractices -
              mastery.practiceCount
            : 0,
      },
      leveledUp,
      newLevel: leveledUp ? MASTERY_LEVELS[mastery.level as keyof typeof MASTERY_LEVELS] : null,
    });
  } catch (error) {
    console.error("Error recording practice:", error);
    return NextResponse.json(
      { error: "Failed to record practice" },
      { status: 500 }
    );
  }
}
