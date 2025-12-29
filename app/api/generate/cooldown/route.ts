import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateCooldown } from "@/lib/sequence/generator";
import { Asana, ProgramAsana } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { programAsanas, duration = 5 } = body;

    if (!programAsanas || !Array.isArray(programAsanas)) {
      return NextResponse.json(
        { error: "Program asanas are required" },
        { status: 400 }
      );
    }

    // Validate duration
    const targetDuration = Math.max(3, Math.min(15, duration));

    // Fetch all asanas for selection
    const allAsanas = await prisma.asana.findMany();

    // Convert to proper type with full asana data
    const programWithAsanas: ProgramAsana[] = programAsanas.map((pa: { asanaId: string; duration: number }) => {
      const asana = allAsanas.find((a) => a.id === pa.asanaId);
      return {
        id: `temp-${pa.asanaId}`,
        programId: "",
        asanaId: pa.asanaId,
        asana: asana as unknown as Asana,
        order: 0,
        duration: pa.duration,
      };
    }).filter((pa: ProgramAsana) => pa.asana);

    // Generate cooldown sequence
    const cooldown = generateCooldown(
      programWithAsanas,
      allAsanas as unknown as Asana[],
      targetDuration
    );

    return NextResponse.json({
      sequence: cooldown.items.map((item, index) => ({
        asanaId: item.asanaId,
        asana: {
          id: item.asana.id,
          nameEnglish: item.asana.nameEnglish,
          nameSanskrit: item.asana.nameSanskrit,
          category: item.asana.category,
          difficulty: item.asana.difficulty,
          svgPath: item.asana.svgPath,
          targetBodyParts: item.asana.targetBodyParts,
        },
        duration: item.duration,
        purpose: item.purpose,
        order: index,
      })),
      totalDuration: cooldown.totalDuration,
      description: cooldown.description,
    });
  } catch (error) {
    console.error("Error generating cooldown:", error);
    return NextResponse.json(
      { error: "Failed to generate cooldown sequence" },
      { status: 500 }
    );
  }
}
