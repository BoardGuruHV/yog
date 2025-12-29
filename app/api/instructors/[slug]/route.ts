import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/instructors/[slug] - Get instructor by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const instructor = await prisma.instructor.findUnique({
      where: { slug },
      include: {
        programs: {
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
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
              take: 4,
            },
            sharedProgram: {
              select: {
                shareCode: true,
                views: true,
                copies: true,
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    // Parse social links if stored as JSON
    let socialLinks: Record<string, string> = {};
    if (instructor.socialLinks) {
      try {
        socialLinks = instructor.socialLinks as Record<string, string>;
      } catch {
        socialLinks = {};
      }
    }

    return NextResponse.json({
      id: instructor.id,
      name: instructor.name,
      slug: instructor.slug,
      bio: instructor.bio,
      longBio: instructor.longBio,
      photoUrl: instructor.photoUrl,
      coverUrl: instructor.coverUrl,
      credentials: instructor.credentials,
      specialties: instructor.specialties,
      experience: instructor.experience,
      location: instructor.location,
      socialLinks,
      featured: instructor.featured,
      verified: instructor.verified,
      programs: instructor.programs.map((program) => ({
        id: program.id,
        name: program.name,
        description: program.description,
        totalDuration: program.totalDuration,
        poseCount: program.asanas.length,
        shareCode: program.sharedProgram?.shareCode,
        views: program.sharedProgram?.views || 0,
        copies: program.sharedProgram?.copies || 0,
        previewAsanas: program.asanas.map((pa) => ({
          id: pa.asana.id,
          name: pa.asana.nameEnglish,
          svgPath: pa.asana.svgPath,
          category: pa.asana.category,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching instructor:", error);
    return NextResponse.json(
      { error: "Failed to fetch instructor" },
      { status: 500 }
    );
  }
}
