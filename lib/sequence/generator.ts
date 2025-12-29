import { Asana, Category, ProgramAsana } from "@/types";

export interface SequenceItem {
  asanaId: string;
  asana: Asana;
  duration: number;
  purpose: string;
}

export interface GeneratedSequence {
  items: SequenceItem[];
  totalDuration: number;
  description: string;
}

// Warm-up pose categories (in order of priority)
const WARMUP_CATEGORIES: Category[] = [
  "SEATED",
  "SUPINE",
  "PRONE",
  "STANDING",
];

// Cool-down pose categories (in order of priority)
const COOLDOWN_CATEGORIES: Category[] = [
  "SUPINE",
  "SEATED",
  "FORWARD_BEND",
  "TWIST",
];

// Poses that are ideal for warm-up (by English name patterns)
const WARMUP_POSE_PATTERNS = [
  "cat",
  "cow",
  "child",
  "easy",
  "mountain",
  "neck",
  "shoulder",
  "gentle",
  "stretch",
];

// Poses that are ideal for cool-down (by English name patterns)
const COOLDOWN_POSE_PATTERNS = [
  "corpse",
  "savasana",
  "child",
  "supine",
  "reclined",
  "twist",
  "forward",
  "seated",
  "butterfly",
  "happy baby",
  "legs up",
];

// Body part to warm-up poses mapping
const BODY_PART_WARMUPS: Record<string, string[]> = {
  back: ["Cat-Cow Stretch", "Child's Pose", "Spinal Twist"],
  shoulders: ["Shoulder Rolls", "Arm Circles", "Thread the Needle"],
  hips: ["Hip Circles", "Butterfly", "Low Lunge"],
  hamstrings: ["Forward Fold", "Seated Forward Bend", "Downward Dog"],
  core: ["Cat-Cow", "Plank", "Bird Dog"],
  legs: ["Mountain Pose", "Chair Pose", "Warrior I"],
  neck: ["Neck Rolls", "Ear to Shoulder"],
  spine: ["Cat-Cow", "Spinal Twist", "Cobra"],
};

// Body part to cool-down poses mapping
const BODY_PART_COOLDOWNS: Record<string, string[]> = {
  back: ["Child's Pose", "Supine Twist", "Knees to Chest"],
  shoulders: ["Thread the Needle", "Eagle Arms", "Reclined Twist"],
  hips: ["Reclined Pigeon", "Happy Baby", "Supine Butterfly"],
  hamstrings: ["Supine Leg Stretch", "Seated Forward Fold"],
  core: ["Supine Twist", "Knees to Chest"],
  legs: ["Legs Up the Wall", "Reclined Hand to Toe"],
  neck: ["Ear to Shoulder", "Neck Release"],
  spine: ["Supine Twist", "Knees to Chest", "Child's Pose"],
};

/**
 * Analyze the main poses in a program to determine focus areas
 */
function analyzeProgramFocus(programAsanas: ProgramAsana[]): {
  categories: Category[];
  bodyParts: string[];
  difficulty: number;
  hasInversions: boolean;
  hasBackbends: boolean;
} {
  const categoryCounts: Record<string, number> = {};
  const bodyPartCounts: Record<string, number> = {};
  let totalDifficulty = 0;
  let hasInversions = false;
  let hasBackbends = false;

  programAsanas.forEach((pa) => {
    if (!pa.asana) return;

    // Count categories
    const cat = pa.asana.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Check for inversions and backbends
    if (cat === "INVERSION") hasInversions = true;
    if (cat === "BACK_BEND") hasBackbends = true;

    // Count body parts
    pa.asana.targetBodyParts.forEach((bp) => {
      bodyPartCounts[bp.toLowerCase()] = (bodyPartCounts[bp.toLowerCase()] || 0) + 1;
    });

    // Sum difficulty
    totalDifficulty += pa.asana.difficulty;
  });

  // Sort categories by count
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat as Category);

  // Sort body parts by count
  const sortedBodyParts = Object.entries(bodyPartCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([bp]) => bp);

  return {
    categories: sortedCategories,
    bodyParts: sortedBodyParts.slice(0, 5),
    difficulty: programAsanas.length > 0 ? totalDifficulty / programAsanas.length : 1,
    hasInversions,
    hasBackbends,
  };
}

/**
 * Find poses matching criteria from available asanas
 */
function findMatchingPoses(
  asanas: Asana[],
  criteria: {
    categories?: Category[];
    namePatterns?: string[];
    maxDifficulty?: number;
    bodyParts?: string[];
    exclude?: string[];
  }
): Asana[] {
  return asanas.filter((asana) => {
    // Exclude specific poses
    if (criteria.exclude?.includes(asana.id)) return false;

    // Check category
    if (criteria.categories && !criteria.categories.includes(asana.category)) {
      return false;
    }

    // Check difficulty
    if (criteria.maxDifficulty && asana.difficulty > criteria.maxDifficulty) {
      return false;
    }

    // Check name patterns
    if (criteria.namePatterns) {
      const nameLower = asana.nameEnglish.toLowerCase();
      const hasMatch = criteria.namePatterns.some((pattern) =>
        nameLower.includes(pattern.toLowerCase())
      );
      if (hasMatch) return true;
    }

    // Check body parts
    if (criteria.bodyParts) {
      const asanaBodyParts = asana.targetBodyParts.map((bp) => bp.toLowerCase());
      const hasMatch = criteria.bodyParts.some((bp) =>
        asanaBodyParts.includes(bp.toLowerCase())
      );
      if (hasMatch) return true;
    }

    return !criteria.namePatterns && !criteria.bodyParts;
  });
}

/**
 * Generate warm-up sequence based on program analysis
 */
export function generateWarmup(
  programAsanas: ProgramAsana[],
  allAsanas: Asana[],
  targetDuration: number = 5 // minutes
): GeneratedSequence {
  const analysis = analyzeProgramFocus(programAsanas);
  const existingIds = programAsanas.map((pa) => pa.asanaId);
  const items: SequenceItem[] = [];
  const targetSeconds = targetDuration * 60;
  let totalDuration = 0;

  // 1. Start with gentle seated/supine poses
  const gentlePoses = findMatchingPoses(allAsanas, {
    categories: ["SEATED", "SUPINE"],
    maxDifficulty: 2,
    exclude: existingIds,
  }).slice(0, 2);

  gentlePoses.forEach((pose) => {
    if (totalDuration < targetSeconds * 0.3) {
      const duration = Math.min(30, pose.durationSeconds);
      items.push({
        asanaId: pose.id,
        asana: pose,
        duration,
        purpose: "Centering & breath awareness",
      });
      totalDuration += duration;
    }
  });

  // 2. Add joint mobility based on focus areas
  const mobilityPoses = findMatchingPoses(allAsanas, {
    namePatterns: ["cat", "cow", "stretch", "circle"],
    maxDifficulty: 2,
    bodyParts: analysis.bodyParts,
    exclude: [...existingIds, ...items.map((i) => i.asanaId)],
  }).slice(0, 2);

  mobilityPoses.forEach((pose) => {
    if (totalDuration < targetSeconds * 0.6) {
      const duration = Math.min(45, pose.durationSeconds);
      items.push({
        asanaId: pose.id,
        asana: pose,
        duration,
        purpose: "Joint mobility & preparation",
      });
      totalDuration += duration;
    }
  });

  // 3. Add preparatory poses for the main practice
  const prepPoses = findMatchingPoses(allAsanas, {
    categories: WARMUP_CATEGORIES,
    maxDifficulty: Math.min(3, analysis.difficulty),
    bodyParts: analysis.bodyParts,
    exclude: [...existingIds, ...items.map((i) => i.asanaId)],
  }).slice(0, 3);

  prepPoses.forEach((pose) => {
    if (totalDuration < targetSeconds) {
      const duration = Math.min(45, pose.durationSeconds);
      items.push({
        asanaId: pose.id,
        asana: pose,
        duration,
        purpose: "Building heat & preparation",
      });
      totalDuration += duration;
    }
  });

  // 4. If targeting inversions or backbends, add specific prep
  if (analysis.hasBackbends) {
    const backbendPrep = findMatchingPoses(allAsanas, {
      namePatterns: ["cobra", "sphinx", "bridge"],
      maxDifficulty: 2,
      exclude: [...existingIds, ...items.map((i) => i.asanaId)],
    })[0];

    if (backbendPrep && totalDuration < targetSeconds) {
      items.push({
        asanaId: backbendPrep.id,
        asana: backbendPrep,
        duration: 30,
        purpose: "Backbend preparation",
      });
      totalDuration += 30;
    }
  }

  return {
    items,
    totalDuration,
    description: `${Math.round(totalDuration / 60)} minute warm-up focusing on ${analysis.bodyParts.slice(0, 2).join(" & ")}`,
  };
}

/**
 * Generate cool-down sequence based on program analysis
 */
export function generateCooldown(
  programAsanas: ProgramAsana[],
  allAsanas: Asana[],
  targetDuration: number = 5 // minutes
): GeneratedSequence {
  const analysis = analyzeProgramFocus(programAsanas);
  const existingIds = programAsanas.map((pa) => pa.asanaId);
  const items: SequenceItem[] = [];
  const targetSeconds = targetDuration * 60;
  let totalDuration = 0;

  // 1. Start with counter-poses for worked areas
  const counterPoses = findMatchingPoses(allAsanas, {
    categories: ["SUPINE", "SEATED"],
    bodyParts: analysis.bodyParts,
    maxDifficulty: 2,
    exclude: existingIds,
  }).slice(0, 2);

  counterPoses.forEach((pose) => {
    if (totalDuration < targetSeconds * 0.4) {
      const duration = Math.min(45, pose.durationSeconds);
      items.push({
        asanaId: pose.id,
        asana: pose,
        duration,
        purpose: "Counter-pose & release",
      });
      totalDuration += duration;
    }
  });

  // 2. Add gentle twists for spine release
  const twists = findMatchingPoses(allAsanas, {
    categories: ["TWIST"],
    namePatterns: ["supine", "reclined", "twist"],
    maxDifficulty: 2,
    exclude: [...existingIds, ...items.map((i) => i.asanaId)],
  }).slice(0, 1);

  twists.forEach((pose) => {
    if (totalDuration < targetSeconds * 0.6) {
      const duration = Math.min(60, pose.durationSeconds);
      items.push({
        asanaId: pose.id,
        asana: pose,
        duration,
        purpose: "Spinal release & relaxation",
      });
      totalDuration += duration;
    }
  });

  // 3. Add restorative poses
  const restorativePoses = findMatchingPoses(allAsanas, {
    namePatterns: COOLDOWN_POSE_PATTERNS,
    maxDifficulty: 1,
    exclude: [...existingIds, ...items.map((i) => i.asanaId)],
  }).slice(0, 2);

  restorativePoses.forEach((pose) => {
    if (totalDuration < targetSeconds * 0.85) {
      const duration = Math.min(60, pose.durationSeconds);
      items.push({
        asanaId: pose.id,
        asana: pose,
        duration,
        purpose: "Deep relaxation",
      });
      totalDuration += duration;
    }
  });

  // 4. Always end with Savasana (corpse pose) if available
  const savasana = allAsanas.find(
    (a) =>
      a.nameEnglish.toLowerCase().includes("corpse") ||
      a.nameSanskrit.toLowerCase().includes("savasana")
  );

  if (savasana && !items.some((i) => i.asanaId === savasana.id)) {
    const remainingTime = Math.max(60, targetSeconds - totalDuration);
    items.push({
      asanaId: savasana.id,
      asana: savasana,
      duration: Math.min(remainingTime, 120),
      purpose: "Final relaxation",
    });
    totalDuration += Math.min(remainingTime, 120);
  }

  return {
    items,
    totalDuration,
    description: `${Math.round(totalDuration / 60)} minute cool-down with relaxation`,
  };
}

/**
 * Format duration for display
 */
export function formatSequenceDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} min`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
