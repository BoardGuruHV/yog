// Pose transition scoring engine

export interface AsanaInfo {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  targetBodyParts: string[];
}

export interface Recommendation {
  asana: AsanaInfo;
  score: number;
  reasons: string[];
}

// Category flow preferences - which categories flow well into others
const CATEGORY_FLOW: Record<string, { good: string[]; neutral: string[]; avoid: string[] }> = {
  STANDING: {
    good: ["STANDING", "BALANCE", "FORWARD_BEND", "TWIST"],
    neutral: ["SEATED", "PRONE"],
    avoid: ["SUPINE", "INVERSION"],
  },
  SEATED: {
    good: ["SEATED", "FORWARD_BEND", "TWIST"],
    neutral: ["PRONE", "SUPINE"],
    avoid: ["STANDING", "INVERSION"],
  },
  PRONE: {
    good: ["PRONE", "BACK_BEND", "SUPINE"],
    neutral: ["SEATED"],
    avoid: ["STANDING", "INVERSION"],
  },
  SUPINE: {
    good: ["SUPINE", "TWIST", "FORWARD_BEND"],
    neutral: ["SEATED", "PRONE"],
    avoid: ["STANDING", "INVERSION"],
  },
  INVERSION: {
    good: ["STANDING", "SEATED", "SUPINE"],
    neutral: ["FORWARD_BEND"],
    avoid: ["BACK_BEND", "INVERSION"],
  },
  BALANCE: {
    good: ["STANDING", "FORWARD_BEND"],
    neutral: ["SEATED", "BALANCE"],
    avoid: ["PRONE", "SUPINE", "INVERSION"],
  },
  TWIST: {
    good: ["FORWARD_BEND", "SEATED", "SUPINE"],
    neutral: ["STANDING", "TWIST"],
    avoid: ["BACK_BEND", "INVERSION"],
  },
  FORWARD_BEND: {
    good: ["BACK_BEND", "TWIST", "SEATED", "SUPINE"],
    neutral: ["STANDING", "FORWARD_BEND"],
    avoid: ["INVERSION"],
  },
  BACK_BEND: {
    good: ["FORWARD_BEND", "TWIST", "SUPINE"],
    neutral: ["PRONE", "STANDING"],
    avoid: ["BACK_BEND", "INVERSION"],
  },
};

// Body part counter-pose logic
const COUNTER_POSES: Record<string, string[]> = {
  Back: ["Core", "Chest"],
  Core: ["Back"],
  Hamstrings: ["Hips", "Spine"],
  Hips: ["Hamstrings", "Legs"],
  Shoulders: ["Chest", "Arms"],
  Chest: ["Back", "Shoulders"],
  Spine: ["Core"],
  Legs: ["Hips"],
  Arms: ["Shoulders"],
  Neck: ["Shoulders"],
};

// Calculate category flow score
function getCategoryFlowScore(fromCategory: string, toCategory: string): number {
  const flow = CATEGORY_FLOW[fromCategory];
  if (!flow) return 0.5;

  if (flow.good.includes(toCategory)) return 1.0;
  if (flow.neutral.includes(toCategory)) return 0.6;
  if (flow.avoid.includes(toCategory)) return 0.2;

  return 0.5;
}

// Calculate difficulty progression score
function getDifficultyScore(
  fromDifficulty: number,
  toDifficulty: number,
  sessionProgress: number // 0-1, how far into the session
): number {
  const diff = toDifficulty - fromDifficulty;

  // Early session: prefer gradual increase
  if (sessionProgress < 0.3) {
    if (diff >= 0 && diff <= 1) return 1.0;
    if (diff === 2) return 0.7;
    if (diff < 0) return 0.6;
    return 0.4;
  }

  // Mid session: peak difficulty is ok
  if (sessionProgress < 0.7) {
    if (Math.abs(diff) <= 1) return 1.0;
    if (diff > 1) return 0.6;
    return 0.8;
  }

  // Late session: prefer decrease (cool down)
  if (diff < 0) return 1.0;
  if (diff === 0) return 0.8;
  if (diff === 1) return 0.5;
  return 0.3;
}

// Calculate body part balance score
function getBodyPartScore(
  targetParts: string[],
  recentParts: string[],
  allSessionParts: Map<string, number>
): { score: number; reason: string | null } {
  // Check for counter-pose opportunity
  for (const part of targetParts) {
    for (const recentPart of recentParts) {
      if (COUNTER_POSES[recentPart]?.includes(part)) {
        return { score: 1.0, reason: `Counter-pose for ${recentPart.toLowerCase()}` };
      }
    }
  }

  // Check if this body part is underworked
  let hasUnderworkedPart = false;
  for (const part of targetParts) {
    const count = allSessionParts.get(part) || 0;
    if (count === 0) {
      hasUnderworkedPart = true;
      break;
    }
  }

  if (hasUnderworkedPart) {
    return { score: 0.9, reason: "Works different muscle groups" };
  }

  // Check for overworked parts
  let hasOverworkedPart = false;
  for (const part of targetParts) {
    const count = allSessionParts.get(part) || 0;
    if (count >= 3) {
      hasOverworkedPart = true;
      break;
    }
  }

  if (hasOverworkedPart) {
    return { score: 0.4, reason: null };
  }

  return { score: 0.7, reason: null };
}

// Check for variety (avoid repeating same poses)
function getVarietyScore(
  asanaId: string,
  category: string,
  sessionAsanas: string[],
  sessionCategories: string[]
): number {
  // Already in session - very low score
  if (sessionAsanas.includes(asanaId)) return 0.1;

  // Count category repetitions
  const categoryCount = sessionCategories.filter((c) => c === category).length;
  if (categoryCount >= 4) return 0.3;
  if (categoryCount >= 2) return 0.6;

  return 1.0;
}

export interface RecommendationContext {
  currentAsana: AsanaInfo | null;
  sessionAsanas: AsanaInfo[];
  sessionProgress: number; // 0-1
  userGoals?: string[]; // flexibility, strength, relaxation, etc.
}

export function getRecommendations(
  allAsanas: AsanaInfo[],
  context: RecommendationContext,
  limit: number = 5
): Recommendation[] {
  const {
    currentAsana,
    sessionAsanas,
    sessionProgress,
    userGoals = [],
  } = context;

  // Build session statistics
  const sessionAsanaIds = sessionAsanas.map((a) => a.id);
  const sessionCategories = sessionAsanas.map((a) => a.category);
  const recentBodyParts = currentAsana?.targetBodyParts || [];

  const allSessionParts = new Map<string, number>();
  for (const asana of sessionAsanas) {
    for (const part of asana.targetBodyParts) {
      allSessionParts.set(part, (allSessionParts.get(part) || 0) + 1);
    }
  }

  const recommendations: Recommendation[] = [];

  for (const asana of allAsanas) {
    // Skip current asana
    if (currentAsana && asana.id === currentAsana.id) continue;

    const reasons: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // 1. Category flow score (weight: 0.3)
    if (currentAsana) {
      const flowScore = getCategoryFlowScore(currentAsana.category, asana.category);
      totalScore += flowScore * 0.3;
      scoreCount += 0.3;

      if (flowScore >= 0.9) {
        reasons.push(`Flows naturally from ${formatCategory(currentAsana.category)}`);
      }
    } else {
      // No current asana - starting pose
      if (asana.category === "STANDING" || asana.category === "SEATED") {
        totalScore += 0.3;
        reasons.push("Good starting pose");
      } else {
        totalScore += 0.15;
      }
      scoreCount += 0.3;
    }

    // 2. Difficulty progression (weight: 0.25)
    if (currentAsana) {
      const diffScore = getDifficultyScore(
        currentAsana.difficulty,
        asana.difficulty,
        sessionProgress
      );
      totalScore += diffScore * 0.25;
      scoreCount += 0.25;

      if (sessionProgress > 0.7 && asana.difficulty < currentAsana.difficulty) {
        reasons.push("Good for cooling down");
      } else if (sessionProgress < 0.3 && asana.difficulty <= 2) {
        reasons.push("Gentle warm-up");
      }
    } else {
      // Starting - prefer easier poses
      const startScore = asana.difficulty <= 2 ? 1.0 : 0.6;
      totalScore += startScore * 0.25;
      scoreCount += 0.25;
    }

    // 3. Body part balance (weight: 0.25)
    const bodyPartResult = getBodyPartScore(
      asana.targetBodyParts,
      recentBodyParts,
      allSessionParts
    );
    totalScore += bodyPartResult.score * 0.25;
    scoreCount += 0.25;

    if (bodyPartResult.reason) {
      reasons.push(bodyPartResult.reason);
    }

    // 4. Variety score (weight: 0.2)
    const varietyScore = getVarietyScore(
      asana.id,
      asana.category,
      sessionAsanaIds,
      sessionCategories
    );
    totalScore += varietyScore * 0.2;
    scoreCount += 0.2;

    if (varietyScore >= 0.9 && sessionAsanas.length > 0) {
      reasons.push("Adds variety to your session");
    }

    // 5. Goal matching bonus
    if (userGoals.length > 0) {
      const goalMatch = matchesGoals(asana, userGoals);
      if (goalMatch.matches) {
        totalScore += 0.1;
        if (goalMatch.reason) {
          reasons.push(goalMatch.reason);
        }
      }
    }

    // Calculate final score
    const finalScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    recommendations.push({
      asana,
      score: Math.round(finalScore * 100) / 100,
      reasons: reasons.slice(0, 2), // Max 2 reasons
    });
  }

  // Sort by score and return top results
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function matchesGoals(
  asana: AsanaInfo,
  goals: string[]
): { matches: boolean; reason: string | null } {
  const categoryGoalMap: Record<string, string[]> = {
    FORWARD_BEND: ["flexibility"],
    BACK_BEND: ["flexibility", "strength"],
    BALANCE: ["balance", "focus"],
    INVERSION: ["energy", "strength"],
    TWIST: ["flexibility", "relaxation"],
    SUPINE: ["relaxation"],
    PRONE: ["strength"],
  };

  const bodyPartGoalMap: Record<string, string[]> = {
    Core: ["strength"],
    Hamstrings: ["flexibility"],
    Hips: ["flexibility"],
    Back: ["flexibility", "strength"],
    Shoulders: ["flexibility"],
  };

  for (const goal of goals) {
    const goalLower = goal.toLowerCase();

    // Check category match
    const categoryGoals = categoryGoalMap[asana.category];
    if (categoryGoals?.includes(goalLower)) {
      return { matches: true, reason: `Supports ${goal.toLowerCase()} goal` };
    }

    // Check body part match
    for (const part of asana.targetBodyParts) {
      const partGoals = bodyPartGoalMap[part];
      if (partGoals?.includes(goalLower)) {
        return { matches: true, reason: `Targets ${part.toLowerCase()} for ${goalLower}` };
      }
    }
  }

  return { matches: false, reason: null };
}

// Get recommendations for starting a session
export function getStartingPoseRecommendations(
  allAsanas: AsanaInfo[],
  limit: number = 5
): Recommendation[] {
  return getRecommendations(
    allAsanas,
    {
      currentAsana: null,
      sessionAsanas: [],
      sessionProgress: 0,
    },
    limit
  );
}

// Get cool-down recommendations
export function getCoolDownRecommendations(
  allAsanas: AsanaInfo[],
  sessionAsanas: AsanaInfo[],
  limit: number = 5
): Recommendation[] {
  const currentAsana = sessionAsanas[sessionAsanas.length - 1] || null;

  // Filter to gentle poses for cool-down
  const gentlePoses = allAsanas.filter(
    (a) =>
      a.difficulty <= 2 &&
      ["SUPINE", "SEATED", "FORWARD_BEND"].includes(a.category)
  );

  return getRecommendations(
    gentlePoses,
    {
      currentAsana,
      sessionAsanas,
      sessionProgress: 0.9,
    },
    limit
  );
}
