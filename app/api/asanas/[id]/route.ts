import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const asana = await prisma.asana.findUnique({
      where: { id },
      include: {
        contraindications: {
          include: {
            condition: true,
          },
        },
        modifications: {
          include: {
            condition: true,
          },
        },
      },
    });

    if (!asana) {
      return NextResponse.json({ error: "Asana not found" }, { status: 404 });
    }

    return NextResponse.json(asana);
  } catch (error) {
    console.error("Error fetching asana:", error);
    return NextResponse.json(
      { error: "Failed to fetch asana" },
      { status: 500 }
    );
  }
}
