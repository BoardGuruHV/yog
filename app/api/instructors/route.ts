import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/instructors - Get all instructors
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get("featured");
    const specialty = searchParams.get("specialty");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build where clause
    const where: {
      featured?: boolean;
      specialties?: { has: string };
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        bio?: { contains: string; mode: "insensitive" };
        specialties?: { has: string };
      }>;
    } = {};

    if (featured === "true") {
      where.featured = true;
    }

    if (specialty) {
      where.specialties = { has: specialty };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { specialties: { has: search } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get instructors with program count
    const [instructors, total] = await Promise.all([
      prisma.instructor.findMany({
        where,
        orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
        skip,
        take: limit,
        include: {
          _count: {
            select: { programs: true },
          },
        },
      }),
      prisma.instructor.count({ where }),
    ]);

    // Get all unique specialties for filtering
    const allInstructors = await prisma.instructor.findMany({
      select: { specialties: true },
    });
    const allSpecialties = Array.from(
      new Set(allInstructors.flatMap((i) => i.specialties))
    ).sort();

    return NextResponse.json({
      instructors: instructors.map((instructor) => ({
        id: instructor.id,
        name: instructor.name,
        slug: instructor.slug,
        bio: instructor.bio,
        photoUrl: instructor.photoUrl,
        credentials: instructor.credentials,
        specialties: instructor.specialties,
        experience: instructor.experience,
        location: instructor.location,
        featured: instructor.featured,
        verified: instructor.verified,
        programCount: instructor._count.programs,
      })),
      specialties: allSpecialties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + instructors.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json(
      { error: "Failed to fetch instructors" },
      { status: 500 }
    );
  }
}
