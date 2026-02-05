import "server-only";
import prisma from "@/lib/db";
import {
  BODY_PARTS,
  type BodyPartId,
  type BodyPartFocus,
  type BodyMapData,
} from "./utils";

// Re-export types for convenience
export { BODY_PARTS, type BodyPartId, type BodyPartFocus, type BodyMapData };

// Map asana target body parts to our body part IDs
const BODY_PART_MAPPING: Record<string, BodyPartId[]> = {
  neck: ["neck"],
  shoulders: ["shoulders"],
  chest: ["chest"],
  core: ["core"],
  abs: ["core"],
  abdominals: ["core"],
  arms: ["arms"],
  biceps: ["arms"],
  triceps: ["arms"],
  forearms: ["arms"],
  wrists: ["wrists"],
  hands: ["wrists"],
  hips: ["hips"],
  hip_flexors: ["hips"],
  quadriceps: ["quadriceps"],
  quads: ["quadriceps"],
  thighs: ["quadriceps", "hamstrings"],
  knees: ["knees"],
  ankles: ["ankles"],
  feet: ["ankles"],
  upper_back: ["upper_back"],
  back: ["upper_back", "lower_back"],
  lower_back: ["lower_back"],
  spine: ["spine"],
  glutes: ["glutes"],
  buttocks: ["glutes"],
  hamstrings: ["hamstrings"],
  calves: ["calves"],
  legs: ["quadriceps", "hamstrings", "calves"],
  full_body: Object.keys(BODY_PARTS) as BodyPartId[],
};

function normalizeBodyPart(part: string): BodyPartId[] {
  const normalized = part.toLowerCase().replace(/[^a-z_]/g, "_");
  return BODY_PART_MAPPING[normalized] || [];
}

export async function analyzeBodyMap(
  userId: string,
  days: number = 30
): Promise<BodyMapData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get mastery data with asana body parts
  const masteries = await prisma.poseMastery.findMany({
    where: {
      userId,
      lastPracticed: {
        gte: startDate,
      },
    },
    include: {
      asana: {
        select: {
          id: true,
          nameEnglish: true,
          targetBodyParts: true,
        },
      },
    },
  });

  // Initialize body parts data
  const bodyPartsData: Record<BodyPartId, BodyPartFocus> = {} as Record<BodyPartId, BodyPartFocus>;
  for (const [id, info] of Object.entries(BODY_PARTS)) {
    bodyPartsData[id as BodyPartId] = {
      id: id as BodyPartId,
      label: info.label,
      side: info.side,
      practiceCount: 0,
      percentage: 0,
      intensity: 0,
      lastPracticed: null,
      topPoses: [],
    };
  }

  // Track poses per body part
  const posesByBodyPart: Record<BodyPartId, Map<string, { name: string; count: number }>> = {} as Record<BodyPartId, Map<string, { name: string; count: number }>>;
  for (const id of Object.keys(BODY_PARTS)) {
    posesByBodyPart[id as BodyPartId] = new Map();
  }

  // Aggregate practice data by body part
  let totalPractices = 0;
  for (const mastery of masteries) {
    totalPractices += mastery.practiceCount;

    for (const targetPart of mastery.asana.targetBodyParts) {
      const mappedParts = normalizeBodyPart(targetPart);

      for (const partId of mappedParts) {
        if (bodyPartsData[partId]) {
          bodyPartsData[partId].practiceCount += mastery.practiceCount;

          // Update last practiced
          if (mastery.lastPracticed) {
            if (!bodyPartsData[partId].lastPracticed ||
                mastery.lastPracticed > bodyPartsData[partId].lastPracticed) {
              bodyPartsData[partId].lastPracticed = mastery.lastPracticed;
            }
          }

          // Track poses for this body part
          const poseMap = posesByBodyPart[partId];
          const existing = poseMap.get(mastery.asanaId);
          if (existing) {
            existing.count += mastery.practiceCount;
          } else {
            poseMap.set(mastery.asanaId, {
              name: mastery.asana.nameEnglish,
              count: mastery.practiceCount,
            });
          }
        }
      }
    }
  }

  // Calculate percentages and intensity
  const maxCount = Math.max(...Object.values(bodyPartsData).map(p => p.practiceCount), 1);
  let frontTotal = 0;
  let backTotal = 0;

  for (const partId of Object.keys(bodyPartsData) as BodyPartId[]) {
    const part = bodyPartsData[partId];
    part.percentage = totalPractices > 0
      ? Math.round((part.practiceCount / totalPractices) * 100)
      : 0;
    part.intensity = Math.round((part.practiceCount / maxCount) * 100);

    // Get top 3 poses for this body part
    const poses = Array.from(posesByBodyPart[partId].values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(p => ({ id: p.name, name: p.name, count: p.count }));
    part.topPoses = poses;

    // Track front/back balance
    const partInfo = BODY_PARTS[partId];
    if (partInfo.side === "front") {
      frontTotal += part.practiceCount;
    } else if (partInfo.side === "back") {
      backTotal += part.practiceCount;
    } else {
      // "both" - split evenly
      frontTotal += part.practiceCount / 2;
      backTotal += part.practiceCount / 2;
    }
  }

  // Calculate balance score (100 = perfectly balanced, 0 = completely imbalanced)
  const total = frontTotal + backTotal;
  const frontFocus = total > 0 ? Math.round((frontTotal / total) * 100) : 50;
  const backFocus = total > 0 ? Math.round((backTotal / total) * 100) : 50;
  const balanceScore = 100 - Math.abs(frontFocus - backFocus);

  // Generate recommendations
  const recommendations = generateRecommendations(bodyPartsData, frontFocus, backFocus);

  return {
    totalPractices,
    bodyParts: bodyPartsData,
    balanceScore,
    frontFocus,
    backFocus,
    recommendations,
  };
}

function generateRecommendations(
  bodyParts: Record<BodyPartId, BodyPartFocus>,
  frontFocus: number,
  backFocus: number
): string[] {
  const recommendations: string[] = [];

  // Check for imbalances
  if (frontFocus > 65) {
    recommendations.push("Your practice is front-focused. Try adding more backbends and posterior chain poses.");
  } else if (backFocus > 65) {
    recommendations.push("Your practice is back-focused. Consider adding more forward folds and core work.");
  }

  // Find neglected areas (less than 10% intensity)
  const neglected = Object.values(bodyParts)
    .filter(p => p.intensity < 10 && p.intensity > 0)
    .map(p => p.label);

  if (neglected.length > 0 && neglected.length <= 3) {
    recommendations.push(`Consider adding more poses targeting: ${neglected.join(", ")}.`);
  }

  // Find overworked areas (more than 80% intensity)
  const overworked = Object.values(bodyParts)
    .filter(p => p.intensity > 80)
    .map(p => p.label);

  if (overworked.length > 0) {
    recommendations.push(`Great focus on ${overworked.join(" and ")}! Ensure adequate rest between sessions.`);
  }

  // Check for upper/lower balance
  const upperParts: BodyPartId[] = ["neck", "shoulders", "chest", "arms", "wrists", "upper_back"];
  const lowerParts: BodyPartId[] = ["hips", "quadriceps", "hamstrings", "glutes", "calves", "ankles"];

  const upperTotal = upperParts.reduce((sum, id) => sum + bodyParts[id].practiceCount, 0);
  const lowerTotal = lowerParts.reduce((sum, id) => sum + bodyParts[id].practiceCount, 0);

  if (upperTotal > lowerTotal * 2) {
    recommendations.push("Add more lower body work for better balance.");
  } else if (lowerTotal > upperTotal * 2) {
    recommendations.push("Add more upper body work for better balance.");
  }

  return recommendations.slice(0, 3);
}
