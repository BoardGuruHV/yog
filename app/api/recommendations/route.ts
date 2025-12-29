import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  getRecommendations,
  getStartingPoseRecommendations,
  getCoolDownRecommendations,
  AsanaInfo,
  RecommendationContext,
} from "@/lib/recommendations/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentAsanaId,
      sessionAsanaIds = [],
      sessionProgress = 0,
      userGoals = [],
      mode = "next", // "next" | "start" | "cooldown"
      limit = 5,
    } = body;

    // Fetch all asanas
    const asanas = await prisma.asana.findMany({
      select: {
        id: true,
        nameEnglish: true,
        nameSanskrit: true,
        category: true,
        difficulty: true,
        targetBodyParts: true,
      },
    });

    // Transform to AsanaInfo format
    const asanaInfos: AsanaInfo[] = asanas.map((a) => ({
      id: a.id,
      nameEnglish: a.nameEnglish,
      nameSanskrit: a.nameSanskrit,
      category: a.category,
      difficulty: a.difficulty,
      targetBodyParts: a.targetBodyParts,
    }));

    // Get session asanas
    const sessionAsanas: AsanaInfo[] = sessionAsanaIds
      .map((id: string) => asanaInfos.find((a) => a.id === id))
      .filter(Boolean) as AsanaInfo[];

    let recommendations;

    if (mode === "start") {
      // Get starting pose recommendations
      recommendations = getStartingPoseRecommendations(asanaInfos, limit);
    } else if (mode === "cooldown") {
      // Get cool-down recommendations
      recommendations = getCoolDownRecommendations(
        asanaInfos,
        sessionAsanas,
        limit
      );
    } else {
      // Get next pose recommendations
      const currentAsana = currentAsanaId
        ? asanaInfos.find((a) => a.id === currentAsanaId) || null
        : sessionAsanas[sessionAsanas.length - 1] || null;

      const context: RecommendationContext = {
        currentAsana,
        sessionAsanas,
        sessionProgress,
        userGoals,
      };

      recommendations = getRecommendations(asanaInfos, context, limit);
    }

    // Fetch full asana details for the recommendations
    const recommendedIds = recommendations.map((r) => r.asana.id);
    const fullAsanas = await prisma.asana.findMany({
      where: { id: { in: recommendedIds } },
      select: {
        id: true,
        nameEnglish: true,
        nameSanskrit: true,
        category: true,
        difficulty: true,
        targetBodyParts: true,
        svgPath: true,
        durationSeconds: true,
      },
    });

    // Merge with recommendations
    const result = recommendations.map((rec) => {
      const fullAsana = fullAsanas.find((a) => a.id === rec.asana.id);
      return {
        ...rec,
        asana: fullAsana || rec.asana,
      };
    });

    return Response.json(result);
  } catch (error) {
    console.error("Recommendations error:", error);
    return Response.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
