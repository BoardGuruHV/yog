/**
 * Client-safe utility functions for body map visualization
 */

/**
 * Get color based on intensity value (0-100)
 */
export function getIntensityColor(intensity: number): string {
  if (intensity === 0) return "#e5e7eb"; // gray-200
  if (intensity < 20) return "#dcfce7"; // green-100
  if (intensity < 40) return "#bbf7d0"; // green-200
  if (intensity < 60) return "#86efac"; // green-300
  if (intensity < 80) return "#4ade80"; // green-400
  return "#22c55e"; // green-500
}

// Body part definitions (client-safe constants)
export const BODY_PARTS = {
  // Front body
  neck: { id: "neck", label: "Neck", side: "front" },
  shoulders: { id: "shoulders", label: "Shoulders", side: "both" },
  chest: { id: "chest", label: "Chest", side: "front" },
  core: { id: "core", label: "Core/Abs", side: "front" },
  arms: { id: "arms", label: "Arms", side: "both" },
  wrists: { id: "wrists", label: "Wrists", side: "both" },
  hips: { id: "hips", label: "Hips", side: "both" },
  quadriceps: { id: "quadriceps", label: "Quadriceps", side: "front" },
  knees: { id: "knees", label: "Knees", side: "both" },
  ankles: { id: "ankles", label: "Ankles", side: "both" },
  // Back body
  upper_back: { id: "upper_back", label: "Upper Back", side: "back" },
  lower_back: { id: "lower_back", label: "Lower Back", side: "back" },
  spine: { id: "spine", label: "Spine", side: "back" },
  glutes: { id: "glutes", label: "Glutes", side: "back" },
  hamstrings: { id: "hamstrings", label: "Hamstrings", side: "back" },
  calves: { id: "calves", label: "Calves", side: "back" },
} as const;

export type BodyPartId = keyof typeof BODY_PARTS;

export interface BodyPartFocus {
  id: BodyPartId;
  label: string;
  side: string;
  practiceCount: number;
  percentage: number;
  intensity: number;
  lastPracticed: Date | null;
  topPoses: {
    id: string;
    name: string;
    count: number;
  }[];
}

export interface BodyMapData {
  totalPractices: number;
  bodyParts: Record<BodyPartId, BodyPartFocus>;
  balanceScore: number;
  frontFocus: number;
  backFocus: number;
  recommendations: string[];
}
