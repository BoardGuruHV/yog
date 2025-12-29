import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const featured = searchParams.get("featured");
    const goal = searchParams.get("goal");

    // Build where clause
    const where: {
      category?: string;
      difficulty?: number;
      featured?: boolean;
      goals?: { has: string };
    } = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = parseInt(difficulty);
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (goal) {
      where.goals = { has: goal };
    }

    const templates = await prisma.programTemplate.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { popularity: "desc" },
        { name: "asc" },
      ],
    });

    // For each template, fetch the asana details
    const templatesWithAsanas = await Promise.all(
      templates.map(async (template) => {
        const asanaSequence = template.asanas as Array<{
          asanaId: string;
          duration: number;
          notes?: string;
        }>;

        const asanaIds = asanaSequence.map((a) => a.asanaId);
        const asanas = await prisma.asana.findMany({
          where: { id: { in: asanaIds } },
          select: {
            id: true,
            nameEnglish: true,
            nameSanskrit: true,
            svgPath: true,
            category: true,
            difficulty: true,
          },
        });

        const asanaMap = new Map(asanas.map((a) => [a.id, a]));

        const enrichedSequence = asanaSequence.map((item) => ({
          ...item,
          asana: asanaMap.get(item.asanaId) || null,
        }));

        return {
          ...template,
          asanaSequence: enrichedSequence,
        };
      })
    );

    return NextResponse.json(templatesWithAsanas);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
