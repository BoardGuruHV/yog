import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asanaId: string }> }
) {
  try {
    const { asanaId } = await params;

    // Get the tutorial with steps and asana info
    const tutorial = await prisma.asanaTutorial.findUnique({
      where: { asanaId },
      include: {
        asana: {
          select: {
            id: true,
            nameEnglish: true,
            nameSanskrit: true,
            category: true,
            difficulty: true,
            durationSeconds: true,
            svgPath: true,
            description: true,
          },
        },
        steps: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!tutorial) {
      // Check if asana exists
      const asana = await prisma.asana.findUnique({
        where: { id: asanaId },
        select: {
          id: true,
          nameEnglish: true,
          nameSanskrit: true,
        },
      });

      if (!asana) {
        return Response.json({ error: "Asana not found" }, { status: 404 });
      }

      return Response.json({
        tutorial: null,
        asana,
        message: "No tutorial available for this asana yet",
      });
    }

    return Response.json({ tutorial });
  } catch (error) {
    console.error("Error fetching tutorial:", error);
    return Response.json(
      { error: "Failed to fetch tutorial" },
      { status: 500 }
    );
  }
}
