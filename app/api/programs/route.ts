import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      include: {
        asanas: {
          include: {
            asana: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, asanas } = body;

    // Calculate total duration
    const totalDuration = asanas.reduce(
      (sum: number, a: { duration: number }) => sum + a.duration,
      0
    );

    const program = await prisma.program.create({
      data: {
        name,
        description,
        totalDuration,
        asanas: {
          create: asanas.map(
            (
              a: { asanaId: string; duration: number; notes?: string },
              index: number
            ) => ({
              asanaId: a.asanaId,
              order: index,
              duration: a.duration,
              notes: a.notes,
            })
          ),
        },
      },
      include: {
        asanas: {
          include: {
            asana: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
