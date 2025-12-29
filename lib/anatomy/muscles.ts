// Muscle definitions with display info and SVG positioning

export interface MuscleInfo {
  id: string;
  name: string;
  group: string;
  side: "front" | "back" | "both";
  description: string;
  // SVG positioning for the muscle region (percentage-based)
  position: {
    x: number; // 0-100
    y: number; // 0-100
    width: number;
    height: number;
  };
}

export const MUSCLE_GROUPS = {
  UPPER_BODY: "Upper Body",
  CORE: "Core",
  LOWER_BODY: "Lower Body",
  ARMS: "Arms",
  BACK: "Back",
} as const;

export const MUSCLES: Record<string, MuscleInfo> = {
  // Front Upper Body
  pectorals: {
    id: "pectorals",
    name: "Pectorals",
    group: MUSCLE_GROUPS.UPPER_BODY,
    side: "front",
    description: "Chest muscles responsible for arm movements",
    position: { x: 30, y: 22, width: 40, height: 10 },
  },
  deltoids: {
    id: "deltoids",
    name: "Deltoids",
    group: MUSCLE_GROUPS.UPPER_BODY,
    side: "both",
    description: "Shoulder muscles for arm elevation and rotation",
    position: { x: 18, y: 18, width: 15, height: 8 },
  },
  biceps: {
    id: "biceps",
    name: "Biceps",
    group: MUSCLE_GROUPS.ARMS,
    side: "front",
    description: "Front upper arm muscles for elbow flexion",
    position: { x: 15, y: 28, width: 10, height: 12 },
  },
  triceps: {
    id: "triceps",
    name: "Triceps",
    group: MUSCLE_GROUPS.ARMS,
    side: "back",
    description: "Back upper arm muscles for elbow extension",
    position: { x: 15, y: 28, width: 10, height: 12 },
  },
  forearms: {
    id: "forearms",
    name: "Forearms",
    group: MUSCLE_GROUPS.ARMS,
    side: "both",
    description: "Lower arm muscles for wrist and grip strength",
    position: { x: 12, y: 40, width: 8, height: 14 },
  },

  // Core
  rectusAbdominis: {
    id: "rectusAbdominis",
    name: "Rectus Abdominis",
    group: MUSCLE_GROUPS.CORE,
    side: "front",
    description: "The 'six-pack' muscles for trunk flexion",
    position: { x: 40, y: 35, width: 20, height: 18 },
  },
  obliques: {
    id: "obliques",
    name: "Obliques",
    group: MUSCLE_GROUPS.CORE,
    side: "front",
    description: "Side abdominal muscles for rotation and lateral flexion",
    position: { x: 28, y: 38, width: 12, height: 14 },
  },
  transverseAbdominis: {
    id: "transverseAbdominis",
    name: "Transverse Abdominis",
    group: MUSCLE_GROUPS.CORE,
    side: "front",
    description: "Deep core stabilizer muscle",
    position: { x: 35, y: 42, width: 30, height: 10 },
  },

  // Back
  trapezius: {
    id: "trapezius",
    name: "Trapezius",
    group: MUSCLE_GROUPS.BACK,
    side: "back",
    description: "Upper back and neck muscle for shoulder movement",
    position: { x: 30, y: 12, width: 40, height: 15 },
  },
  latissimusDorsi: {
    id: "latissimusDorsi",
    name: "Latissimus Dorsi",
    group: MUSCLE_GROUPS.BACK,
    side: "back",
    description: "Large back muscle for arm pulling movements",
    position: { x: 25, y: 28, width: 50, height: 16 },
  },
  rhomboids: {
    id: "rhomboids",
    name: "Rhomboids",
    group: MUSCLE_GROUPS.BACK,
    side: "back",
    description: "Upper back muscles for shoulder blade retraction",
    position: { x: 38, y: 20, width: 24, height: 10 },
  },
  erectorSpinae: {
    id: "erectorSpinae",
    name: "Erector Spinae",
    group: MUSCLE_GROUPS.BACK,
    side: "back",
    description: "Spinal muscles for back extension and posture",
    position: { x: 42, y: 25, width: 16, height: 28 },
  },

  // Lower Body - Front
  quadriceps: {
    id: "quadriceps",
    name: "Quadriceps",
    group: MUSCLE_GROUPS.LOWER_BODY,
    side: "front",
    description: "Front thigh muscles for knee extension",
    position: { x: 32, y: 55, width: 18, height: 20 },
  },
  hipFlexors: {
    id: "hipFlexors",
    name: "Hip Flexors",
    group: MUSCLE_GROUPS.LOWER_BODY,
    side: "front",
    description: "Muscles for lifting the leg and hip flexion",
    position: { x: 35, y: 50, width: 15, height: 8 },
  },
  adductors: {
    id: "adductors",
    name: "Adductors",
    group: MUSCLE_GROUPS.LOWER_BODY,
    side: "front",
    description: "Inner thigh muscles for leg adduction",
    position: { x: 42, y: 58, width: 16, height: 15 },
  },
  tibialis: {
    id: "tibialis",
    name: "Tibialis Anterior",
    group: MUSCLE_GROUPS.LOWER_BODY,
    side: "front",
    description: "Front shin muscle for ankle dorsiflexion",
    position: { x: 38, y: 78, width: 10, height: 12 },
  },

  // Lower Body - Back
  gluteus: {
    id: "gluteus",
    name: "Gluteus",
    group: MUSCLE_GROUPS.LOWER_BODY,
    side: "back",
    description: "Buttock muscles for hip extension and rotation",
    position: { x: 30, y: 48, width: 40, height: 12 },
  },
  hamstrings: {
    id: "hamstrings",
    name: "Hamstrings",
    group: MUSCLE_GROUPS.LOWER_BODY,
    side: "back",
    description: "Back thigh muscles for knee flexion",
    position: { x: 32, y: 60, width: 18, height: 18 },
  },
  calves: {
    id: "calves",
    name: "Calves",
    group: MUSCLE_GROUPS.LOWER_BODY,
    side: "back",
    description: "Lower leg muscles for ankle plantar flexion",
    position: { x: 35, y: 78, width: 14, height: 14 },
  },
};

// Get muscle by ID
export function getMuscleInfo(muscleId: string): MuscleInfo | undefined {
  return MUSCLES[muscleId];
}

// Get all muscles for a specific body side
export function getMusclesBySide(side: "front" | "back"): MuscleInfo[] {
  return Object.values(MUSCLES).filter(
    (m) => m.side === side || m.side === "both"
  );
}

// Get muscles grouped by muscle group
export function getMusclesByGroup(): Record<string, MuscleInfo[]> {
  const grouped: Record<string, MuscleInfo[]> = {};

  Object.values(MUSCLES).forEach((muscle) => {
    if (!grouped[muscle.group]) {
      grouped[muscle.group] = [];
    }
    grouped[muscle.group].push(muscle);
  });

  return grouped;
}

// Color coding for muscle engagement types
export const ENGAGEMENT_COLORS = {
  primary: {
    fill: "rgba(239, 68, 68, 0.6)", // Red - actively engaged
    stroke: "#dc2626",
    label: "Primary (Strengthening)",
  },
  secondary: {
    fill: "rgba(251, 191, 36, 0.5)", // Amber - supporting
    stroke: "#f59e0b",
    label: "Secondary (Supporting)",
  },
  stretched: {
    fill: "rgba(59, 130, 246, 0.5)", // Blue - stretching
    stroke: "#3b82f6",
    label: "Stretched",
  },
};

export type EngagementType = keyof typeof ENGAGEMENT_COLORS;
