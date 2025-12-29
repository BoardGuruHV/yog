import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await prisma.programTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Fetch asana details with all fields
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
        description: true,
        category: true,
        difficulty: true,
        durationSeconds: true,
        benefits: true,
        targetBodyParts: true,
        svgPath: true,
      },
    });

    const asanaMap = new Map(asanas.map((a) => [a.id, a]));

    const enrichedSequence = asanaSequence.map((item) => ({
      ...item,
      asana: asanaMap.get(item.asanaId) || null,
    }));

    return NextResponse.json({
      ...template,
      asanaSequence: enrichedSequence,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// Track template usage (increment popularity)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await prisma.programTemplate.update({
      where: { id },
      data: {
        popularity: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, popularity: template.popularity });
  } catch (error) {
    console.error("Error updating template usage:", error);
    return NextResponse.json(
      { error: "Failed to update template usage" },
      { status: 500 }
    );
  }
}
