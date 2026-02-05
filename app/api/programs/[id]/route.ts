import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const program = await prisma.program.findUnique({
      where: { id },
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

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, asanas } = body;

    // Calculate total duration
    const totalDuration = asanas.reduce(
      (sum: number, a: { duration: number }) => sum + a.duration,
      0
    );

    // Delete existing asanas and recreate
    await prisma.programAsana.deleteMany({
      where: { programId: id },
    });

    const program = await prisma.program.update({
      where: { id },
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

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete associated asanas first
    await prisma.programAsana.deleteMany({
      where: { programId: id },
    });

    // Delete the program
    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
