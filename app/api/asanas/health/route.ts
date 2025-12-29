import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserConditions, getAsanaWarnings, type AsanaWithContraindications } from "@/lib/health/filter";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      // Return empty warnings for unauthenticated users
      return Response.json({ warnings: [], hasConditions: false });
    }

    const { searchParams } = new URL(request.url);
    const asanaId = searchParams.get("asanaId");

    // Get user's active conditions
    const userConditions = await getUserConditions(session.user.id);

    if (userConditions.length === 0) {
      return Response.json({ warnings: [], hasConditions: false });
    }

    if (asanaId) {
      // Get warnings for a specific asana
      const asana = await prisma.asana.findUnique({
        where: { id: asanaId },
        include: {
          contraindications: {
            include: {
              condition: {
                select: { id: true, name: true },
              },
            },
          },
          modifications: {
            include: {
              condition: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      if (!asana) {
        return Response.json({ error: "Asana not found" }, { status: 404 });
      }

      const warnings = getAsanaWarnings(asana as AsanaWithContraindications, userConditions);

      return Response.json({
        warnings,
        hasConditions: true,
        conditionCount: userConditions.length,
      });
    } else {
      // Get warnings for all asanas
      const asanas = await prisma.asana.findMany({
        include: {
          contraindications: {
            include: {
              condition: {
                select: { id: true, name: true },
              },
            },
          },
          modifications: {
            include: {
              condition: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      const warningsMap: Record<string, {
        warnings: ReturnType<typeof getAsanaWarnings>;
        isContraindicated: boolean;
        hasCaution: boolean;
      }> = {};

      for (const asana of asanas) {
        const warnings = getAsanaWarnings(asana as AsanaWithContraindications, userConditions);
        if (warnings.length > 0) {
          warningsMap[asana.id] = {
            warnings,
            isContraindicated: warnings.some(w => w.severity === "avoid"),
            hasCaution: warnings.some(w => w.severity === "caution"),
          };
        }
      }

      return Response.json({
        warningsMap,
        hasConditions: true,
        conditionCount: userConditions.length,
      });
    }
  } catch (error) {
    console.error("Error fetching health warnings:", error);
    return Response.json(
      { error: "Failed to fetch health warnings" },
      { status: 500 }
    );
  }
}
