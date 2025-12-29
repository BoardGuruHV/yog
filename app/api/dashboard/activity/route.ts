import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get recent programs
    const programs = await prisma.program.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        asanas: {
          include: {
            asana: {
              select: { nameEnglish: true },
            },
          },
          take: 3,
        },
      },
    });

    // Transform to activity items
    const activities = programs.map((program) => {
      const asanaNames = program.asanas
        .map((pa) => pa.asana.nameEnglish)
        .join(", ");

      const isNew = program.createdAt.getTime() === program.updatedAt.getTime();

      return {
        id: program.id,
        type: isNew ? "program_created" : "practice",
        title: program.name,
        description: asanaNames || "Empty program",
        duration: Math.round(program.totalDuration / 60),
        timestamp: program.updatedAt.toISOString(),
        programId: program.id,
      };
    });

    return Response.json({ activities });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return Response.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
