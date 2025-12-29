import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/community - Get public shared programs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const sort = searchParams.get("sort") || "popular"; // popular, recent, duration
    const minDuration = searchParams.get("minDuration");
    const maxDuration = searchParams.get("maxDuration");
    const search = searchParams.get("search");

    // Build where clause
    const where: {
      isPublic: boolean;
      program?: {
        totalDuration?: { gte?: number; lte?: number };
        OR?: Array<{ name?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }>;
      };
    } = {
      isPublic: true,
    };

    // Duration filter
    if (minDuration || maxDuration) {
      where.program = {
        totalDuration: {},
      };
      if (minDuration) {
        where.program.totalDuration!.gte = parseInt(minDuration) * 60; // Convert to seconds
      }
      if (maxDuration) {
        where.program.totalDuration!.lte = parseInt(maxDuration) * 60;
      }
    }

    // Search filter
    if (search) {
      where.program = {
        ...where.program,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Build orderBy
    type OrderByType =
      | { copies: "desc" }
      | { views: "desc" }
      | { createdAt: "desc" }
      | { program: { totalDuration: "asc" | "desc" } };

    let orderBy: OrderByType;
    switch (sort) {
      case "recent":
        orderBy = { createdAt: "desc" };
        break;
      case "views":
        orderBy = { views: "desc" };
        break;
      case "duration_asc":
        orderBy = { program: { totalDuration: "asc" } };
        break;
      case "duration_desc":
        orderBy = { program: { totalDuration: "desc" } };
        break;
      case "popular":
      default:
        orderBy = { copies: "desc" };
        break;
    }

    // Get total count
    const total = await prisma.sharedProgram.count({ where });

    // Get programs
    const sharedPrograms = await prisma.sharedProgram.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        program: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            asanas: {
              include: {
                asana: {
                  select: {
                    id: true,
                    nameEnglish: true,
                    svgPath: true,
                    category: true,
                  },
                },
              },
              orderBy: { order: "asc" },
              take: 4, // Just get first 4 for preview
            },
          },
        },
      },
    });

    const programs = sharedPrograms.map((sp) => ({
      id: sp.id,
      shareCode: sp.shareCode,
      views: sp.views,
      copies: sp.copies,
      createdAt: sp.createdAt,
      program: {
        id: sp.program.id,
        name: sp.program.name,
        description: sp.program.description,
        totalDuration: sp.program.totalDuration,
        poseCount: sp.program.asanas.length,
        creator: sp.program.user
          ? {
              id: sp.program.user.id,
              name: sp.program.user.name || "Anonymous",
              image: sp.program.user.image,
            }
          : null,
        previewAsanas: sp.program.asanas.map((pa) => ({
          id: pa.asana.id,
          name: pa.asana.nameEnglish,
          svgPath: pa.asana.svgPath,
          category: pa.asana.category,
        })),
      },
    }));

    return NextResponse.json({
      programs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + programs.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching community programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch community programs" },
      { status: 500 }
    );
  }
}
