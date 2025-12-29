// Safety Analyzer - Detects potential injury risks in yoga sequences

export interface AsanaForAnalysis {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  targetBodyParts: string[];
}

export interface SafetyAlert {
  id: string;
  type: "warning" | "caution" | "tip";
  category: "warmup" | "overuse" | "transition" | "balance" | "intensity" | "sequence";
  title: string;
  message: string;
  affectedPoses?: string[];
  suggestion?: string;
}

export interface AnalysisResult {
  alerts: SafetyAlert[];
  overallRisk: "low" | "moderate" | "high";
  bodyPartStress: Map<string, number>;
  recommendations: string[];
}

// Categories that need warm-up before attempting
const WARM_UP_REQUIRED_CATEGORIES = ["INVERSION", "BACK_BEND", "BALANCE"];

// Categories good for warm-up
const WARM_UP_CATEGORIES = ["STANDING", "SEATED", "FORWARD_BEND"];

// Categories good for cool-down
const COOL_DOWN_CATEGORIES = ["SUPINE", "FORWARD_BEND", "SEATED"];

// Risky transitions - from category to category
const RISKY_TRANSITIONS: Record<string, string[]> = {
  // Don't go directly from supine to standing without transition
  SUPINE: ["STANDING", "INVERSION"],
  // Don't go from intense backbend to inversion
  BACK_BEND: ["INVERSION"],
  // Don't go from inversion to another inversion without rest
  INVERSION: ["INVERSION", "BACK_BEND"],
};

// Counter-poses needed after certain categories
const COUNTER_POSE_NEEDED: Record<string, { after: number; counter: string[] }> = {
  BACK_BEND: { after: 2, counter: ["FORWARD_BEND", "TWIST"] },
  FORWARD_BEND: { after: 3, counter: ["BACK_BEND", "STANDING"] },
  INVERSION: { after: 1, counter: ["SUPINE", "SEATED"] },
};

// Body part stress thresholds
const BODY_PART_STRESS_THRESHOLD = 4; // Alert if same body part targeted 4+ times

// Difficulty progression rules
const MAX_DIFFICULTY_JUMP = 2; // Don't jump more than 2 difficulty levels

// Generate unique alert ID
let alertCounter = 0;
function generateAlertId(): string {
  return `alert-${++alertCounter}-${Date.now()}`;
}

export function analyzeSequence(asanas: AsanaForAnalysis[]): AnalysisResult {
  const alerts: SafetyAlert[] = [];
  const bodyPartStress = new Map<string, number>();
  const recommendations: string[] = [];

  if (asanas.length === 0) {
    return {
      alerts: [],
      overallRisk: "low",
      bodyPartStress,
      recommendations: ["Add poses to your program to get safety analysis"],
    };
  }

  // Track category counts
  const categoryCounts = new Map<string, number>();
  for (const asana of asanas) {
    categoryCounts.set(asana.category, (categoryCounts.get(asana.category) || 0) + 1);
  }

  // Track body part stress
  for (const asana of asanas) {
    for (const part of asana.targetBodyParts) {
      bodyPartStress.set(part, (bodyPartStress.get(part) || 0) + 1);
    }
  }

  // 1. Check for warm-up
  checkWarmUp(asanas, alerts);

  // 2. Check for risky transitions
  checkTransitions(asanas, alerts);

  // 3. Check for body part overuse
  checkBodyPartOveruse(bodyPartStress, alerts);

  // 4. Check for category balance
  checkCategoryBalance(categoryCounts, asanas, alerts);

  // 5. Check for counter-poses
  checkCounterPoses(asanas, alerts);

  // 6. Check difficulty progression
  checkDifficultyProgression(asanas, alerts);

  // 7. Check for cool-down
  checkCoolDown(asanas, alerts);

  // 8. Check overall intensity
  checkIntensity(asanas, alerts);

  // Generate recommendations
  generateRecommendations(asanas, bodyPartStress, recommendations);

  // Calculate overall risk
  const overallRisk = calculateOverallRisk(alerts);

  return {
    alerts,
    overallRisk,
    bodyPartStress,
    recommendations,
  };
}

function checkWarmUp(asanas: AsanaForAnalysis[], alerts: SafetyAlert[]) {
  if (asanas.length < 2) return;

  const firstPose = asanas[0];
  const secondPose = asanas.length > 1 ? asanas[1] : null;

  // Check if starting with intense pose
  if (WARM_UP_REQUIRED_CATEGORIES.includes(firstPose.category)) {
    alerts.push({
      id: generateAlertId(),
      type: "warning",
      category: "warmup",
      title: "Missing Warm-up",
      message: `Starting with ${firstPose.nameEnglish} (${formatCategory(firstPose.category)}) without warm-up poses may increase injury risk.`,
      affectedPoses: [firstPose.nameEnglish],
      suggestion: "Add gentle standing or seated poses at the beginning to warm up your body.",
    });
  }

  // Check if starting with high difficulty
  if (firstPose.difficulty >= 4) {
    alerts.push({
      id: generateAlertId(),
      type: "caution",
      category: "warmup",
      title: "High Difficulty Start",
      message: `${firstPose.nameEnglish} is an advanced pose. Starting with challenging poses without preparation may strain your muscles.`,
      affectedPoses: [firstPose.nameEnglish],
      suggestion: "Consider adding easier warm-up poses before attempting advanced poses.",
    });
  }

  // Check first few poses
  const firstThree = asanas.slice(0, 3);
  const hasWarmUp = firstThree.some(
    (a) => WARM_UP_CATEGORIES.includes(a.category) && a.difficulty <= 2
  );

  if (!hasWarmUp && asanas.length >= 3) {
    const hasIntensePose = firstThree.some(
      (a) => a.difficulty >= 4 || WARM_UP_REQUIRED_CATEGORIES.includes(a.category)
    );

    if (hasIntensePose) {
      alerts.push({
        id: generateAlertId(),
        type: "tip",
        category: "warmup",
        title: "Consider Adding Warm-up",
        message: "Your sequence jumps into intense poses quickly. A gentle warm-up helps prevent injuries.",
        suggestion: "Try starting with Mountain Pose, Cat-Cow, or gentle forward bends.",
      });
    }
  }
}

function checkTransitions(asanas: AsanaForAnalysis[], alerts: SafetyAlert[]) {
  for (let i = 0; i < asanas.length - 1; i++) {
    const current = asanas[i];
    const next = asanas[i + 1];

    const riskyNextCategories = RISKY_TRANSITIONS[current.category];
    if (riskyNextCategories && riskyNextCategories.includes(next.category)) {
      alerts.push({
        id: generateAlertId(),
        type: "caution",
        category: "transition",
        title: "Risky Transition",
        message: `Moving from ${current.nameEnglish} (${formatCategory(current.category)}) directly to ${next.nameEnglish} (${formatCategory(next.category)}) may be jarring for your body.`,
        affectedPoses: [current.nameEnglish, next.nameEnglish],
        suggestion: `Consider adding a transitional pose between these two, like a ${getTransitionSuggestion(current.category, next.category)}.`,
      });
    }
  }
}

function checkBodyPartOveruse(
  bodyPartStress: Map<string, number>,
  alerts: SafetyAlert[]
) {
  const entries = Array.from(bodyPartStress.entries());
  for (const [part, count] of entries) {
    if (count >= BODY_PART_STRESS_THRESHOLD) {
      alerts.push({
        id: generateAlertId(),
        type: count >= 6 ? "warning" : "caution",
        category: "overuse",
        title: `${part} Overuse`,
        message: `Your ${part.toLowerCase()} is targeted ${count} times in this sequence. Repeated stress on the same area increases injury risk.`,
        suggestion: `Consider reducing ${part.toLowerCase()}-focused poses or adding counter-movements.`,
      });
    }
  }
}

function checkCategoryBalance(
  categoryCounts: Map<string, number>,
  asanas: AsanaForAnalysis[],
  alerts: SafetyAlert[]
) {
  const total = asanas.length;
  if (total < 4) return;

  // Check for category dominance
  const entries = Array.from(categoryCounts.entries());
  for (const [category, count] of entries) {
    const percentage = count / total;
    if (percentage > 0.5 && count >= 4) {
      alerts.push({
        id: generateAlertId(),
        type: "tip",
        category: "balance",
        title: "Sequence Imbalance",
        message: `${Math.round(percentage * 100)}% of your poses are ${formatCategory(category)}. A balanced practice includes variety.`,
        suggestion: `Try adding some ${getSuggestedCategories(category).join(" or ")} poses for balance.`,
      });
    }
  }
}

function checkCounterPoses(asanas: AsanaForAnalysis[], alerts: SafetyAlert[]) {
  for (const [category, config] of Object.entries(COUNTER_POSE_NEEDED)) {
    let consecutiveCount = 0;
    let needsCounter = false;
    const affectedPoses: string[] = [];

    for (let i = 0; i < asanas.length; i++) {
      if (asanas[i].category === category) {
        consecutiveCount++;
        affectedPoses.push(asanas[i].nameEnglish);

        if (consecutiveCount >= config.after) {
          needsCounter = true;
        }
      } else if (config.counter.includes(asanas[i].category)) {
        // Found a counter-pose, reset
        consecutiveCount = 0;
        needsCounter = false;
        affectedPoses.length = 0;
      }
    }

    if (needsCounter && affectedPoses.length > 0) {
      alerts.push({
        id: generateAlertId(),
        type: "tip",
        category: "balance",
        title: "Counter-pose Needed",
        message: `After ${consecutiveCount} ${formatCategory(category)} poses, your body would benefit from a counter-movement.`,
        affectedPoses,
        suggestion: `Add a ${config.counter.map(formatCategory).join(" or ")} pose to balance the effects.`,
      });
    }
  }
}

function checkDifficultyProgression(asanas: AsanaForAnalysis[], alerts: SafetyAlert[]) {
  for (let i = 0; i < asanas.length - 1; i++) {
    const current = asanas[i];
    const next = asanas[i + 1];
    const jump = next.difficulty - current.difficulty;

    if (jump > MAX_DIFFICULTY_JUMP) {
      alerts.push({
        id: generateAlertId(),
        type: "caution",
        category: "intensity",
        title: "Difficulty Jump",
        message: `Going from ${current.nameEnglish} (difficulty ${current.difficulty}) to ${next.nameEnglish} (difficulty ${next.difficulty}) is a significant jump.`,
        affectedPoses: [current.nameEnglish, next.nameEnglish],
        suggestion: "Consider adding an intermediate-difficulty pose between these two.",
      });
    }
  }
}

function checkCoolDown(asanas: AsanaForAnalysis[], alerts: SafetyAlert[]) {
  if (asanas.length < 3) return;

  const lastThree = asanas.slice(-3);
  const lastPose = asanas[asanas.length - 1];

  // Check if ending with intense pose
  if (lastPose.difficulty >= 4 || WARM_UP_REQUIRED_CATEGORIES.includes(lastPose.category)) {
    alerts.push({
      id: generateAlertId(),
      type: "tip",
      category: "sequence",
      title: "Missing Cool-down",
      message: `Ending with ${lastPose.nameEnglish} (an intense pose) without cool-down may leave your body tense.`,
      affectedPoses: [lastPose.nameEnglish],
      suggestion: "Add restorative poses like Child's Pose or Corpse Pose to end your practice.",
    });
  }

  // Check if last poses are calming
  const hasCoolDown = lastThree.some(
    (a) => COOL_DOWN_CATEGORIES.includes(a.category) && a.difficulty <= 2
  );

  const hasIntensePoses = asanas.some((a) => a.difficulty >= 4);

  if (!hasCoolDown && hasIntensePoses && asanas.length >= 5) {
    alerts.push({
      id: generateAlertId(),
      type: "tip",
      category: "sequence",
      title: "Consider Adding Cool-down",
      message: "Your sequence includes intense poses but doesn't wind down at the end.",
      suggestion: "Try ending with gentle seated poses, supine twists, or Savasana.",
    });
  }
}

function checkIntensity(asanas: AsanaForAnalysis[], alerts: SafetyAlert[]) {
  const highDifficultyCount = asanas.filter((a) => a.difficulty >= 4).length;
  const inversionCount = asanas.filter((a) => a.category === "INVERSION").length;

  if (highDifficultyCount >= 5) {
    alerts.push({
      id: generateAlertId(),
      type: "warning",
      category: "intensity",
      title: "High Intensity Sequence",
      message: `Your sequence includes ${highDifficultyCount} advanced poses. This is a demanding practice.`,
      suggestion: "Ensure you're well-rested and consider adding more recovery poses between intense ones.",
    });
  }

  if (inversionCount >= 3) {
    alerts.push({
      id: generateAlertId(),
      type: "caution",
      category: "intensity",
      title: "Multiple Inversions",
      message: `Your sequence includes ${inversionCount} inversions. Multiple inversions in one session can be taxing.`,
      suggestion: "Allow adequate rest between inversions and listen to your body.",
    });
  }
}

function generateRecommendations(
  asanas: AsanaForAnalysis[],
  bodyPartStress: Map<string, number>,
  recommendations: string[]
) {
  if (asanas.length === 0) return;

  // Check for missing body parts
  const commonParts = ["Back", "Core", "Hips", "Shoulders", "Legs"];
  const entries = Array.from(bodyPartStress.entries());
  const workedParts = entries.map(([part]) => part);

  const missingParts = commonParts.filter((p) => !workedParts.includes(p));
  if (missingParts.length > 0 && asanas.length >= 5) {
    recommendations.push(
      `Consider adding poses that target: ${missingParts.join(", ")}`
    );
  }

  // Suggest based on sequence length
  if (asanas.length < 5) {
    recommendations.push("A complete practice typically includes 5-15 poses");
  }

  if (asanas.length > 15) {
    recommendations.push("Long sequences benefit from short rest periods between intense sections");
  }
}

function calculateOverallRisk(alerts: SafetyAlert[]): "low" | "moderate" | "high" {
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const cautionCount = alerts.filter((a) => a.type === "caution").length;

  if (warningCount >= 2) return "high";
  if (warningCount >= 1 || cautionCount >= 3) return "moderate";
  return "low";
}

// Helper functions
function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTransitionSuggestion(from: string, to: string): string {
  if (from === "SUPINE" && to === "STANDING") {
    return "seated pose or gentle twist";
  }
  if (from === "BACK_BEND" && to === "INVERSION") {
    return "forward bend or child's pose";
  }
  if (from === "INVERSION") {
    return "child's pose or corpse pose";
  }
  return "neutral standing or seated pose";
}

function getSuggestedCategories(dominant: string): string[] {
  const suggestions: Record<string, string[]> = {
    STANDING: ["Seated", "Supine"],
    SEATED: ["Standing", "Prone"],
    PRONE: ["Supine", "Standing"],
    SUPINE: ["Standing", "Seated"],
    INVERSION: ["Supine", "Forward Bend"],
    BALANCE: ["Seated", "Supine"],
    TWIST: ["Forward Bend", "Standing"],
    FORWARD_BEND: ["Back Bend", "Standing"],
    BACK_BEND: ["Forward Bend", "Twist"],
  };
  return suggestions[dominant] || ["Standing", "Seated"];
}

// Analyze a single pose addition to existing sequence
export function analyzeAddition(
  existingAsanas: AsanaForAnalysis[],
  newAsana: AsanaForAnalysis
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  if (existingAsanas.length === 0) {
    // Check if starting with difficult pose
    if (newAsana.difficulty >= 4) {
      alerts.push({
        id: generateAlertId(),
        type: "tip",
        category: "warmup",
        title: "Starting with Advanced Pose",
        message: `${newAsana.nameEnglish} is challenging. Consider adding warm-up poses first.`,
        suggestion: "Add gentle standing or seated poses before this one.",
      });
    }
    return alerts;
  }

  const lastAsana = existingAsanas[existingAsanas.length - 1];

  // Check transition
  const riskyNext = RISKY_TRANSITIONS[lastAsana.category];
  if (riskyNext && riskyNext.includes(newAsana.category)) {
    alerts.push({
      id: generateAlertId(),
      type: "caution",
      category: "transition",
      title: "Consider Transition",
      message: `Moving from ${lastAsana.nameEnglish} to ${newAsana.nameEnglish} may benefit from a transitional pose.`,
      suggestion: `Add a ${getTransitionSuggestion(lastAsana.category, newAsana.category)} between them.`,
    });
  }

  // Check difficulty jump
  if (newAsana.difficulty - lastAsana.difficulty > MAX_DIFFICULTY_JUMP) {
    alerts.push({
      id: generateAlertId(),
      type: "tip",
      category: "intensity",
      title: "Difficulty Increase",
      message: `${newAsana.nameEnglish} is significantly more challenging than the previous pose.`,
      suggestion: "Consider adding an intermediate pose to build up gradually.",
    });
  }

  // Check body part stress
  const bodyPartCount = new Map<string, number>();
  for (const asana of existingAsanas) {
    for (const part of asana.targetBodyParts) {
      bodyPartCount.set(part, (bodyPartCount.get(part) || 0) + 1);
    }
  }

  for (const part of newAsana.targetBodyParts) {
    const currentCount = bodyPartCount.get(part) || 0;
    if (currentCount >= BODY_PART_STRESS_THRESHOLD - 1) {
      alerts.push({
        id: generateAlertId(),
        type: "tip",
        category: "overuse",
        title: `${part} Focus`,
        message: `Adding this will target your ${part.toLowerCase()} ${currentCount + 1} times.`,
        suggestion: `Your ${part.toLowerCase()} is getting a good workout. Consider variety.`,
      });
    }
  }

  return alerts;
}
