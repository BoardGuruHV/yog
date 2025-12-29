import { Asana, Condition } from "@prisma/client";

export interface ProgramRequest {
  goals: string[];
  duration: number; // minutes
  difficulty: number; // 1-5
  conditions: string[]; // condition IDs to avoid
  focusAreas: string[]; // body parts to target
  experienceLevel: string; // "beginner", "intermediate", "advanced"
}

export interface GeneratedProgram {
  name: string;
  description: string;
  asanaSequence: {
    asanaId: string;
    duration: number; // seconds
    notes?: string;
  }[];
  totalDuration: number;
  warmupIncluded: boolean;
  cooldownIncluded: boolean;
}

type AsanaWithRelations = Asana & {
  contraindications: { condition: Condition }[];
};

export function buildProgramGeneratorPrompt(
  request: ProgramRequest,
  asanas: AsanaWithRelations[],
  conditions: Condition[]
): string {
  // Filter out contraindicated asanas
  const safeAsanas = asanas.filter((asana) => {
    const contraindicatedConditionIds = asana.contraindications.map(
      (c) => c.condition.id
    );
    return !request.conditions.some((condId) =>
      contraindicatedConditionIds.includes(condId)
    );
  });

  // Build asana reference list
  const asanaList = safeAsanas
    .map((a) => {
      const bodyParts = Array.isArray(a.targetBodyParts) ? a.targetBodyParts.join(", ") : "";
      const benefits = Array.isArray(a.benefits) ? a.benefits.join(", ") : "N/A";
      return `- ID: "${a.id}", Name: "${a.nameEnglish}", Sanskrit: "${a.nameSanskrit}", Category: "${a.category}", Difficulty: ${a.difficulty}/5, Body Parts: [${bodyParts}], Benefits: ${benefits}`;
    })
    .join("\n");

  // Build condition reference
  const userConditions = conditions
    .filter((c) => request.conditions.includes(c.id))
    .map((c) => c.name)
    .join(", ");

  const difficultyLabel = ["Gentle", "Easy", "Moderate", "Challenging", "Advanced"][
    request.difficulty - 1
  ];

  return `You are an expert yoga instructor creating a personalized yoga program.

## User Preferences:
- Goals: ${request.goals.join(", ")}
- Target Duration: ${request.duration} minutes
- Difficulty Level: ${difficultyLabel} (${request.difficulty}/5)
- Experience Level: ${request.experienceLevel}
- Focus Areas: ${request.focusAreas.length > 0 ? request.focusAreas.join(", ") : "Full body"}
- Health Conditions to Avoid: ${userConditions || "None"}

## Available Asanas (already filtered for safety):
${asanaList}

## Instructions:
Create a yoga program that:
1. Starts with gentle warm-up poses
2. Progresses through the main sequence
3. Ends with cool-down and relaxation poses
4. Matches the target duration (${request.duration} minutes)
5. Aligns with the user's goals and experience level
6. Focuses on the requested body parts when specified

## Response Format (JSON only, no markdown):
{
  "name": "Program name (creative, descriptive)",
  "description": "2-3 sentence description of the program and its benefits",
  "asanaSequence": [
    {
      "asanaId": "exact ID from the list above",
      "duration": duration in seconds (30-180),
      "notes": "optional brief instruction or focus point"
    }
  ],
  "totalDuration": total duration in minutes,
  "warmupIncluded": true,
  "cooldownIncluded": true
}

Important:
- Only use asana IDs from the provided list
- Include 6-15 poses depending on duration
- Ensure logical flow between poses
- Balance the sequence appropriately
- Return ONLY valid JSON, no other text`;
}

export function parseGeneratedProgram(response: string): GeneratedProgram | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      !parsed.name ||
      !parsed.description ||
      !Array.isArray(parsed.asanaSequence)
    ) {
      return null;
    }

    return {
      name: parsed.name,
      description: parsed.description,
      asanaSequence: parsed.asanaSequence.map((item: any) => ({
        asanaId: item.asanaId,
        duration: item.duration || 60,
        notes: item.notes,
      })),
      totalDuration: parsed.totalDuration || 0,
      warmupIncluded: parsed.warmupIncluded ?? true,
      cooldownIncluded: parsed.cooldownIncluded ?? true,
    };
  } catch (error) {
    console.error("Failed to parse generated program:", error);
    return null;
  }
}
