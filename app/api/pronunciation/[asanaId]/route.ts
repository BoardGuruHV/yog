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

    // Get pronunciation data
    const pronunciation = await prisma.pronunciation.findUnique({
      where: { asanaId },
    });

    if (!pronunciation) {
      // Return asana info even if no pronunciation exists
      return NextResponse.json({
        asana,
        pronunciation: null,
      });
    }

    return NextResponse.json({
      asana,
      pronunciation: {
        id: pronunciation.id,
        phonetic: pronunciation.phonetic,
        audioPath: pronunciation.audioPath,
        syllables: pronunciation.syllables,
        ipa: pronunciation.ipa,
        meaning: pronunciation.meaning,
      },
    });
  } catch (error) {
    console.error("Error fetching pronunciation:", error);
    return NextResponse.json(
      { error: "Failed to fetch pronunciation" },
      { status: 500 }
    );
  }
}
