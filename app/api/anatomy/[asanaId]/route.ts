import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asanaId: string }> }
) {
  try {
    const { asanaId } = await params;

    // First check if asana exists
    const asana = await prisma.asana.findUnique({
      where: { id: asanaId },
      select: {
        id: true,
        nameEnglish: true,
        nameSanskrit: true,
      },
    });

    if (!asana) {
      return NextResponse.json(
        { error: "Asana not found" },
        { status: 404 }
      );
    }

    // Get anatomy data
    const anatomy = await prisma.asanaAnatomy.findUnique({
      where: { asanaId },
    });

    if (!anatomy) {
      // Return asana info even if no anatomy data exists
      return NextResponse.json({
        asana,
        anatomy: null,
      });
    }

    return NextResponse.json({
      asana,
      anatomy: {
        id: anatomy.id,
        primaryMuscles: anatomy.primaryMuscles,
        secondaryMuscles: anatomy.secondaryMuscles,
        stretchedMuscles: anatomy.stretchedMuscles,
        notes: anatomy.notes,
      },
    });
  } catch (error) {
    console.error("Error fetching anatomy:", error);
    return NextResponse.json(
      { error: "Failed to fetch anatomy data" },
      { status: 500 }
    );
  }
}
