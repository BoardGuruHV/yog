import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Category } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const categoriesParam = searchParams.get("categories");
    const difficultyParam = searchParams.get("difficulty");
    const bodyPartsParam = searchParams.get("bodyParts");

    const categories = categoriesParam
      ? (categoriesParam.split(",") as Category[])
      : [];
    const difficulty = difficultyParam
      ? difficultyParam.split(",").map(Number)
      : [];
    const bodyParts = bodyPartsParam ? bodyPartsParam.split(",") : [];

    const where: Record<string, unknown> = {};

    // Search filter
    if (search) {
      where.OR = [
        { nameEnglish: { contains: search, mode: "insensitive" } },
        { nameSanskrit: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (categories.length > 0) {
      where.category = { in: categories };
    }

    // Difficulty filter
    if (difficulty.length > 0) {
      where.difficulty = { in: difficulty };
    }

    // Body parts filter
    if (bodyParts.length > 0) {
      where.targetBodyParts = { hasSome: bodyParts };
    }

    const asanas = await prisma.asana.findMany({
      where,
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
      orderBy: [{ difficulty: "asc" }, { nameEnglish: "asc" }],
    });

    return NextResponse.json(asanas);
  } catch (error) {
    console.error("Error fetching asanas:", error);
    return NextResponse.json(
      { error: "Failed to fetch asanas" },
      { status: 500 }
    );
  }
}
