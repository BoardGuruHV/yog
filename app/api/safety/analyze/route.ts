import { NextRequest } from "next/server";
import {
  analyzeSequence,
  analyzeAddition,
  AsanaForAnalysis,
} from "@/lib/safety/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asanas, mode = "full", newAsana } = body;

    if (!asanas || !Array.isArray(asanas)) {
      return Response.json(
        { error: "Asanas array is required" },
        { status: 400 }
      );
    }

    // Validate asana structure
    const validatedAsanas: AsanaForAnalysis[] = asanas.map((a: any) => ({
      id: a.id || a.asanaId || "",
      nameEnglish: a.nameEnglish || "",
      nameSanskrit: a.nameSanskrit || "",
      category: a.category || "",
      difficulty: a.difficulty || 1,
      targetBodyParts: a.targetBodyParts || [],
    }));

    if (mode === "addition" && newAsana) {
      // Analyze adding a single pose
      const validatedNewAsana: AsanaForAnalysis = {
        id: newAsana.id || newAsana.asanaId || "",
        nameEnglish: newAsana.nameEnglish || "",
        nameSanskrit: newAsana.nameSanskrit || "",
        category: newAsana.category || "",
        difficulty: newAsana.difficulty || 1,
        targetBodyParts: newAsana.targetBodyParts || [],
      };

      const alerts = analyzeAddition(validatedAsanas, validatedNewAsana);

      return Response.json({
        mode: "addition",
        alerts,
        alertCount: alerts.length,
      });
    }

    // Full sequence analysis
    const result = analyzeSequence(validatedAsanas);

    // Convert Map to object for JSON serialization
    const bodyPartStressObj: Record<string, number> = {};
    result.bodyPartStress.forEach((value, key) => {
      bodyPartStressObj[key] = value;
    });

    return Response.json({
      mode: "full",
      alerts: result.alerts,
      alertCount: result.alerts.length,
      overallRisk: result.overallRisk,
      bodyPartStress: bodyPartStressObj,
      recommendations: result.recommendations,
      summary: {
        warnings: result.alerts.filter((a) => a.type === "warning").length,
        cautions: result.alerts.filter((a) => a.type === "caution").length,
        tips: result.alerts.filter((a) => a.type === "tip").length,
      },
    });
  } catch (error) {
    console.error("Safety analysis error:", error);
    return Response.json(
      { error: "Failed to analyze sequence" },
      { status: 500 }
    );
  }
}
