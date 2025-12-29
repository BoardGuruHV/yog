import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAchievementSummary,
  checkAllAchievements,
  getUnnotifiedAchievements,
  markAchievementNotified,
} from "@/lib/achievements/checker";

// GET /api/achievements - Get user's achievements
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check for any new achievements
    await checkAllAchievements(session.user.id);

    // Get the full summary
    const summary = await getAchievementSummary(session.user.id);

    // Get any unnotified achievements
    const unnotified = await getUnnotifiedAchievements(session.user.id);

    return NextResponse.json({
      ...summary,
      newAchievements: unnotified.map((ua) => ({
        id: ua.achievement.id,
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        points: ua.achievement.points,
        rarity: ua.achievement.rarity,
        unlockedAt: ua.unlockedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// POST /api/achievements - Mark achievements as notified
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { achievementIds } = body;

    if (!achievementIds || !Array.isArray(achievementIds)) {
      return NextResponse.json(
        { error: "achievementIds array required" },
        { status: 400 }
      );
    }

    // Mark each achievement as notified
    for (const achievementId of achievementIds) {
      await markAchievementNotified(session.user.id, achievementId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking achievements notified:", error);
    return NextResponse.json(
      { error: "Failed to update achievements" },
      { status: 500 }
    );
  }
}
