import { Asana, Category } from "@/types";

export interface BodyPartActivity {
  bodyPart: string;
  count: number; // Number of times worked
  intensity: number; // 0-100 intensity score
  lastWorked: Date | null;
}

export interface PracticeAnalysis {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  daysSinceLastPractice: number;
  bodyPartActivity: BodyPartActivity[];
  categoryDistribution: Record<string, number>;
  intensityScore: number; // 0-100 overall intensity
  needsRest: boolean;
  restReasons: string[];
}

export interface RecoveryRecommendation {
  type: "rest" | "gentle" | "restorative" | "active_recovery";
  title: string;
  description: string;
  suggestedPoses: string[]; // Pose names or IDs
  suggestedDuration: number; // minutes
  focusAreas: string[]; // Body parts to focus on
  avoidAreas: string[]; // Overworked body parts to rest
}

// Body part groupings for analysis
export const BODY_PART_GROUPS: Record<string, string[]> = {
  upper_body: ["shoulders", "arms", "chest", "neck", "wrists"],
  core: ["core", "back", "spine"],
  lower_body: ["legs", "hips", "hamstrings", "glutes", "ankles"],
};

// Counter-poses for recovery - maps worked areas to recovery poses
export const RECOVERY_POSES: Record<string, string[]> = {
  back: ["Child's Pose", "Cat-Cow Stretch", "Supine Twist", "Knees to Chest"],
  shoulders: ["Thread the Needle", "Eagle Arms", "Cow Face Arms", "Shoulder Rolls"],
  hips: ["Reclined Pigeon", "Happy Baby", "Butterfly Pose", "Supine Hip Circles"],
  hamstrings: ["Reclined Hand to Big Toe", "Supine Leg Stretch", "Seated Forward Fold"],
  core: ["Supine Twist", "Reclined Butterfly", "Savasana"],
  legs: ["Legs Up the Wall", "Reclined Hand to Big Toe", "Happy Baby"],
  neck: ["Neck Rolls", "Ear to Shoulder", "Supported Fish Pose"],
  chest: ["Supported Fish Pose", "Thread the Needle", "Supine Twist"],
  spine: ["Cat-Cow Stretch", "Supine Twist", "Child's Pose", "Sphinx Pose"],
};

// Restorative pose recommendations by category
export const RESTORATIVE_POSES = [
  "Child's Pose",
  "Savasana",
  "Legs Up the Wall",
  "Reclined Butterfly",
  "Supported Bridge",
  "Supine Twist",
  "Happy Baby",
  "Reclined Pigeon",
];

// Category intensity weights (1-5)
const CATEGORY_INTENSITY: Record<Category, number> = {
  STANDING: 3,
  SEATED: 2,
  PRONE: 2,
  SUPINE: 1,
  INVERSION: 4,
  BALANCE: 4,
  TWIST: 2,
  FORWARD_BEND: 2,
  BACK_BEND: 4,
};

export function analyzeRecentPractice(
  practiceLogs: {
    duration: number;
    poses: string[] | null;
    createdAt: Date;
  }[],
  asanas: Asana[]
): PracticeAnalysis {
  const now = new Date();
  const bodyPartCounts: Record<string, { count: number; lastWorked: Date | null }> = {};
  const categoryCounts: Record<string, number> = {};
  let totalIntensity = 0;

  // Initialize body parts
  const allBodyParts = [
    "back", "core", "hamstrings", "hips", "shoulders",
    "chest", "legs", "arms", "spine", "neck", "glutes", "ankles", "wrists",
  ];
  allBodyParts.forEach((bp) => {
    bodyPartCounts[bp] = { count: 0, lastWorked: null };
  });

  // Analyze each practice log
  practiceLogs.forEach((log) => {
    if (log.poses && Array.isArray(log.poses)) {
      log.poses.forEach((poseName) => {
        // Find the asana by name
        const asana = asanas.find(
          (a) =>
            a.nameEnglish.toLowerCase() === poseName.toLowerCase() ||
            a.nameSanskrit.toLowerCase() === poseName.toLowerCase() ||
            a.id === poseName
        );

        if (asana) {
          // Count body parts
          asana.targetBodyParts.forEach((bp) => {
            const bpLower = bp.toLowerCase();
            if (bodyPartCounts[bpLower]) {
              bodyPartCounts[bpLower].count++;
              if (
                !bodyPartCounts[bpLower].lastWorked ||
                log.createdAt > bodyPartCounts[bpLower].lastWorked!
              ) {
                bodyPartCounts[bpLower].lastWorked = log.createdAt;
              }
            }
          });

          // Count categories
          const cat = asana.category;
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

          // Add intensity
          totalIntensity += CATEGORY_INTENSITY[cat] || 2;
        }
      });
    }
  });

  // Calculate total stats
  const totalSessions = practiceLogs.length;
  const totalMinutes = practiceLogs.reduce((sum, log) => sum + log.duration, 0);
  const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;

  // Calculate days since last practice
  const lastPractice = practiceLogs.length > 0
    ? new Date(Math.max(...practiceLogs.map((l) => l.createdAt.getTime())))
    : null;
  const daysSinceLastPractice = lastPractice
    ? Math.floor((now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Calculate body part activity with intensity scores
  const maxCount = Math.max(...Object.values(bodyPartCounts).map((v) => v.count), 1);
  const bodyPartActivity: BodyPartActivity[] = Object.entries(bodyPartCounts)
    .map(([bodyPart, data]) => ({
      bodyPart,
      count: data.count,
      intensity: Math.round((data.count / maxCount) * 100),
      lastWorked: data.lastWorked,
    }))
    .sort((a, b) => b.intensity - a.intensity);

  // Calculate overall intensity score
  const intensityScore = Math.min(
    100,
    Math.round(
      (totalIntensity / (totalSessions * 5 || 1)) * 20 +
        (totalMinutes / 7) * 0.5 +
        (totalSessions / 7) * 30
    )
  );

  // Determine if rest is needed
  const restReasons: string[] = [];
  const overworkedParts = bodyPartActivity.filter((bp) => bp.intensity > 70);

  if (totalSessions >= 6) {
    restReasons.push("You've practiced 6+ times in the last 7 days");
  }
  if (totalMinutes >= 300) {
    restReasons.push("Over 5 hours of practice in the last week");
  }
  if (overworkedParts.length >= 3) {
    restReasons.push(
      `${overworkedParts.length} body areas are heavily worked: ${overworkedParts
        .slice(0, 3)
        .map((p) => p.bodyPart)
        .join(", ")}`
    );
  }
  if (intensityScore > 70) {
    restReasons.push("High overall intensity score");
  }

  const needsRest = restReasons.length >= 2 || intensityScore > 80;

  return {
    totalSessions,
    totalMinutes,
    averageSessionLength: Math.round(averageSessionLength),
    daysSinceLastPractice,
    bodyPartActivity,
    categoryDistribution: categoryCounts,
    intensityScore,
    needsRest,
    restReasons,
  };
}

export function getRecoveryRecommendation(
  analysis: PracticeAnalysis
): RecoveryRecommendation {
  const overworkedParts = analysis.bodyPartActivity
    .filter((bp) => bp.intensity > 60)
    .map((bp) => bp.bodyPart);

  const underworkedParts = analysis.bodyPartActivity
    .filter((bp) => bp.intensity < 30 && bp.intensity > 0)
    .map((bp) => bp.bodyPart);

  // Determine recommendation type
  let type: RecoveryRecommendation["type"] = "active_recovery";
  let title = "Active Recovery Day";
  let description = "Light movement to maintain flexibility while allowing recovery.";
  let suggestedDuration = 20;

  if (analysis.needsRest || analysis.intensityScore > 80) {
    type = "rest";
    title = "Full Rest Day";
    description =
      "Your body has been working hard. Take a complete rest day with optional gentle stretching.";
    suggestedDuration = 10;
  } else if (analysis.intensityScore > 60) {
    type = "restorative";
    title = "Restorative Practice";
    description =
      "Focus on passive, supported poses to help your body recover and restore.";
    suggestedDuration = 25;
  } else if (analysis.intensityScore > 40) {
    type = "gentle";
    title = "Gentle Flow";
    description =
      "A light, mindful practice focusing on mobility and breath work.";
    suggestedDuration = 30;
  }

  // Build suggested poses based on overworked areas
  const suggestedPoses: string[] = [];

  // Add recovery poses for overworked areas
  overworkedParts.forEach((part) => {
    const recoveryPosesForPart = RECOVERY_POSES[part] || [];
    recoveryPosesForPart.forEach((pose) => {
      if (!suggestedPoses.includes(pose)) {
        suggestedPoses.push(pose);
      }
    });
  });

  // Add general restorative poses
  RESTORATIVE_POSES.forEach((pose) => {
    if (!suggestedPoses.includes(pose) && suggestedPoses.length < 8) {
      suggestedPoses.push(pose);
    }
  });

  // Limit to 8 poses
  const limitedPoses = suggestedPoses.slice(0, 8);

  return {
    type,
    title,
    description,
    suggestedPoses: limitedPoses,
    suggestedDuration,
    focusAreas: underworkedParts.slice(0, 3),
    avoidAreas: overworkedParts.slice(0, 3),
  };
}

export function getBodyPartColor(intensity: number): string {
  if (intensity >= 80) return "#ef4444"; // red-500 - overworked
  if (intensity >= 60) return "#f97316"; // orange-500 - heavily worked
  if (intensity >= 40) return "#eab308"; // yellow-500 - moderately worked
  if (intensity >= 20) return "#22c55e"; // green-500 - lightly worked
  return "#94a3b8"; // slate-400 - barely worked
}

export function getIntensityLabel(intensity: number): string {
  if (intensity >= 80) return "Overworked";
  if (intensity >= 60) return "Heavy";
  if (intensity >= 40) return "Moderate";
  if (intensity >= 20) return "Light";
  return "Minimal";
}
