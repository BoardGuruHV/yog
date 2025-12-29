import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  analyzeRecentPractice,
  getRecoveryRecommendation,
} from "@/lib/recovery/analyzer";
import { Asana } from "@/types";

export async function GET() {
  try {
    const session = await auth();

    // Get all asanas for reference
    const asanas = await prisma.asana.findMany({
      select: {
        id: true,
        nameEnglish: true,
        nameSanskrit: true,
        category: true,
        difficulty: true,
        durationSeconds: true,
        benefits: true,
        targetBodyParts: true,
        svgPath: true,
      },
    });

    // Default data for non-logged-in users (demo mode)
    let practiceLogs: { duration: number; poses: string[] | null; createdAt: Date }[] = [];

    if (session?.user?.id) {
      // Get practice logs from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const logs = await prisma.practiceLog.findMany({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          duration: true,
          poses: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      practiceLogs = logs.map((log) => ({
        duration: log.duration,
        poses: log.poses as string[] | null,
        createdAt: log.createdAt,
      }));
    }

    // Analyze the practice data
    const analysis = analyzeRecentPractice(practiceLogs, asanas as unknown as Asana[]);

    // Get recovery recommendation
    const recommendation = getRecoveryRecommendation(analysis);

    // Find actual asanas that match suggested poses
    const suggestedAsanas = recommendation.suggestedPoses
      .map((poseName) => {
        const asana = asanas.find(
          (a) =>
            a.nameEnglish.toLowerCase().includes(poseName.toLowerCase()) ||
            poseName.toLowerCase().includes(a.nameEnglish.toLowerCase())
        );
        return asana || null;
      })
      .filter(Boolean);

    // Get some restorative asanas if we don't have enough matches
    const restorativeCategories = ["SUPINE", "SEATED"];
    const additionalAsanas = asanas
      .filter(
        (a) =>
          restorativeCategories.includes(a.category) &&
          a.difficulty <= 2 &&
          !suggestedAsanas.some((sa) => sa?.id === a.id)
      )
      .slice(0, Math.max(0, 6 - suggestedAsanas.length));

    const allSuggestedAsanas = [...suggestedAsanas, ...additionalAsanas];

    return NextResponse.json({
      analysis: {
        totalSessions: analysis.totalSessions,
        totalMinutes: analysis.totalMinutes,
        averageSessionLength: analysis.averageSessionLength,
        daysSinceLastPractice: analysis.daysSinceLastPractice,
        intensityScore: analysis.intensityScore,
        needsRest: analysis.needsRest,
        restReasons: analysis.restReasons,
        bodyPartActivity: analysis.bodyPartActivity,
        categoryDistribution: analysis.categoryDistribution,
      },
      recommendation: {
        ...recommendation,
        suggestedAsanas: allSuggestedAsanas,
      },
      isAuthenticated: !!session?.user?.id,
    });
  } catch (error) {
    console.error("Error generating rest recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
