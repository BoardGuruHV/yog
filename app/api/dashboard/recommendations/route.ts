import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserConditions } from "@/lib/health/filter";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay: "morning" | "afternoon" | "evening";
    let greeting: string;
    let message: string;

    if (hour < 12) {
      timeOfDay = "morning";
      greeting = "Good morning!";
      message = "Start your day with energizing poses";
    } else if (hour < 17) {
      timeOfDay = "afternoon";
      greeting = "Good afternoon!";
      message = "Mid-day stretches to re-energize";
    } else {
      timeOfDay = "evening";
      greeting = "Good evening!";
      message = "Relaxing poses to wind down";
    }

    // Get user's conditions to filter out contraindicated poses
    const userConditions = await getUserConditions(session.user.id);
    const conditionIds = userConditions.map((c) => c.conditionId);

    // Get contraindicated asana IDs
    let contraindicatedIds: string[] = [];
    if (conditionIds.length > 0) {
      const contraindications = await prisma.contraindication.findMany({
        where: {
          conditionId: { in: conditionIds },
          severity: "avoid",
        },
        select: { asanaId: true },
      });
      contraindicatedIds = contraindications.map((c) => c.asanaId);
    }

    // Get recommended asanas based on time of day
    let categoryFilter: string[] = [];
    let difficultyFilter: { lte?: number; gte?: number } = {};

    switch (timeOfDay) {
      case "morning":
        categoryFilter = ["STANDING", "BACK_BEND", "BALANCE"];
        difficultyFilter = { gte: 2 }; // More active poses
        break;
      case "afternoon":
        categoryFilter = ["STANDING", "TWIST", "SEATED"];
        difficultyFilter = { lte: 3 }; // Moderate
        break;
      case "evening":
        categoryFilter = ["SEATED", "SUPINE", "FORWARD_BEND"];
        difficultyFilter = { lte: 2 }; // Gentler poses
        break;
    }

    const recommendedAsanas = await prisma.asana.findMany({
      where: {
        id: { notIn: contraindicatedIds },
        category: { in: categoryFilter as any[] },
        difficulty: difficultyFilter,
      },
      select: {
        id: true,
        nameEnglish: true,
        nameSanskrit: true,
        svgPath: true,
        category: true,
        benefits: true,
      },
      take: 10,
    });

    // Shuffle and pick top 5
    const shuffled = recommendedAsanas.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    // Add reasons for each recommendation
    const asanas = selected.map((asana) => {
      let reason = "";
      switch (timeOfDay) {
        case "morning":
          reason = asana.benefits[0] || "Great for starting your day";
          break;
        case "afternoon":
          reason = "Perfect for a mid-day break";
          break;
        case "evening":
          reason = "Helps you relax and unwind";
          break;
      }
      return {
        id: asana.id,
        nameEnglish: asana.nameEnglish,
        nameSanskrit: asana.nameSanskrit,
        svgPath: asana.svgPath,
        reason,
      };
    });

    return Response.json({
      greeting,
      message,
      timeOfDay,
      asanas,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return Response.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
