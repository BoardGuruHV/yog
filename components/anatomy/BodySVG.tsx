"use client";

import { MUSCLES, MuscleInfo, ENGAGEMENT_COLORS, EngagementType } from "@/lib/anatomy/muscles";

interface BodySVGProps {
  side: "front" | "back";
  highlightedMuscles: {
    primary: string[];
    secondary: string[];
    stretched: string[];
  };
  hoveredMuscle: string | null;
  onMuscleHover: (muscleId: string | null) => void;
  onMuscleClick: (muscleId: string) => void;
}

// Simplified muscle region paths for the body diagram
const MUSCLE_PATHS: Record<string, { front?: string; back?: string }> = {
  // Head and neck area
  trapezius: {
    back: "M 45,15 Q 50,12 55,15 L 58,25 Q 50,22 42,25 Z",
  },

  // Shoulders
  deltoids: {
    front: "M 32,20 Q 28,22 30,28 L 35,26 Q 36,22 32,20 M 68,20 Q 72,22 70,28 L 65,26 Q 64,22 68,20",
    back: "M 32,20 Q 28,22 30,28 L 35,26 Q 36,22 32,20 M 68,20 Q 72,22 70,28 L 65,26 Q 64,22 68,20",
  },

  // Chest
  pectorals: {
    front: "M 38,24 Q 50,22 62,24 L 60,34 Q 50,32 40,34 Z",
  },

  // Upper arms
  biceps: {
    front: "M 28,28 L 32,28 L 30,42 L 26,42 Z M 68,28 L 72,28 L 74,42 L 70,42 Z",
  },
  triceps: {
    back: "M 28,28 L 32,28 L 30,42 L 26,42 Z M 68,28 L 72,28 L 74,42 L 70,42 Z",
  },

  // Forearms
  forearms: {
    front: "M 24,44 L 28,44 L 22,60 L 18,60 Z M 72,44 L 76,44 L 82,60 L 78,60 Z",
    back: "M 24,44 L 28,44 L 22,60 L 18,60 Z M 72,44 L 76,44 L 82,60 L 78,60 Z",
  },

  // Core - front
  rectusAbdominis: {
    front: "M 45,36 L 55,36 L 55,54 L 45,54 Z",
  },
  obliques: {
    front: "M 38,38 L 44,36 L 44,52 L 40,54 Z M 56,36 L 62,38 L 60,54 L 56,52 Z",
  },
  transverseAbdominis: {
    front: "M 40,48 L 60,48 L 58,54 L 42,54 Z",
  },

  // Back muscles
  latissimusDorsi: {
    back: "M 35,28 L 42,30 L 40,48 L 35,46 Z M 58,30 L 65,28 L 65,46 L 60,48 Z",
  },
  rhomboids: {
    back: "M 42,22 L 50,20 L 50,32 L 42,30 Z M 50,20 L 58,22 L 58,30 L 50,32 Z",
  },
  erectorSpinae: {
    back: "M 46,24 L 54,24 L 54,52 L 46,52 Z",
  },

  // Glutes
  gluteus: {
    back: "M 38,52 Q 50,50 62,52 L 60,64 Q 50,66 40,64 Z",
  },

  // Hip flexors
  hipFlexors: {
    front: "M 42,52 L 50,54 L 50,60 L 44,58 Z M 50,54 L 58,52 L 56,58 L 50,60 Z",
  },

  // Thighs
  quadriceps: {
    front: "M 40,56 L 48,58 L 46,78 L 38,76 Z M 52,58 L 60,56 L 62,76 L 54,78 Z",
  },
  hamstrings: {
    back: "M 40,64 L 48,66 L 46,82 L 38,80 Z M 52,66 L 60,64 L 62,80 L 54,82 Z",
  },
  adductors: {
    front: "M 46,60 L 50,58 L 50,76 L 46,74 Z M 50,58 L 54,60 L 54,74 L 50,76 Z",
  },

  // Lower legs
  calves: {
    back: "M 40,82 L 46,84 L 44,96 L 38,94 Z M 54,84 L 60,82 L 62,94 L 56,96 Z",
  },
  tibialis: {
    front: "M 40,80 L 46,82 L 44,96 L 38,94 Z M 54,82 L 60,80 L 62,94 L 56,96 Z",
  },
};

// Body outline paths
const BODY_OUTLINE = {
  front: `
    M 50,5
    C 42,5 38,10 38,16
    L 38,18
    C 32,18 28,22 28,26
    L 24,44
    C 22,48 18,56 18,60
    L 20,62
    C 24,58 28,46 30,42
    L 32,28
    C 34,24 38,22 38,22
    L 38,24
    C 38,32 40,36 40,36
    L 38,56
    C 36,62 36,76 38,82
    L 38,96
    C 38,100 42,102 46,102
    L 46,96
    C 44,82 44,68 46,58
    L 50,54
    L 54,58
    C 56,68 56,82 54,96
    L 54,102
    C 58,102 62,100 62,96
    L 62,82
    C 64,76 64,62 62,56
    L 60,36
    C 60,36 62,32 62,24
    L 62,22
    C 62,22 66,24 68,28
    L 70,42
    C 72,46 76,58 80,62
    L 82,60
    C 82,56 78,48 76,44
    L 72,26
    C 72,22 68,18 62,18
    L 62,16
    C 62,10 58,5 50,5
    Z
  `,
  back: `
    M 50,5
    C 42,5 38,10 38,16
    L 38,18
    C 32,18 28,22 28,26
    L 24,44
    C 22,48 18,56 18,60
    L 20,62
    C 24,58 28,46 30,42
    L 32,28
    C 34,24 38,22 38,22
    L 38,24
    C 38,32 40,36 40,36
    L 38,56
    C 36,62 36,76 38,82
    L 38,96
    C 38,100 42,102 46,102
    L 46,96
    C 44,82 44,68 46,62
    L 50,58
    L 54,62
    C 56,68 56,82 54,96
    L 54,102
    C 58,102 62,100 62,96
    L 62,82
    C 64,76 64,62 62,56
    L 60,36
    C 60,36 62,32 62,24
    L 62,22
    C 62,22 66,24 68,28
    L 70,42
    C 72,46 76,58 80,62
    L 82,60
    C 82,56 78,48 76,44
    L 72,26
    C 72,22 68,18 62,18
    L 62,16
    C 62,10 58,5 50,5
    Z
  `,
};

function getMuscleEngagementType(
  muscleId: string,
  highlightedMuscles: BodySVGProps["highlightedMuscles"]
): EngagementType | null {
  if (highlightedMuscles.primary.includes(muscleId)) return "primary";
  if (highlightedMuscles.secondary.includes(muscleId)) return "secondary";
  if (highlightedMuscles.stretched.includes(muscleId)) return "stretched";
  return null;
}

export default function BodySVG({
  side,
  highlightedMuscles,
  hoveredMuscle,
  onMuscleHover,
  onMuscleClick,
}: BodySVGProps) {
  return (
    <svg
      viewBox="0 0 100 110"
      className="w-full h-full max-h-[400px]"
      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
    >
      {/* Body outline */}
      <path
        d={BODY_OUTLINE[side]}
        fill="#f5f5f4"
        stroke="#d6d3d1"
        strokeWidth="0.5"
      />

      {/* Muscle regions */}
      {Object.entries(MUSCLE_PATHS).map(([muscleId, paths]) => {
        const path = paths[side];
        if (!path) return null;

        const engagementType = getMuscleEngagementType(muscleId, highlightedMuscles);
        const isHovered = hoveredMuscle === muscleId;
        const muscle = MUSCLES[muscleId];

        if (!engagementType && !isHovered) return null;

        const colors = engagementType
          ? ENGAGEMENT_COLORS[engagementType]
          : { fill: "rgba(156, 163, 175, 0.3)", stroke: "#9ca3af" };

        return (
          <g key={muscleId}>
            <path
              d={path}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={isHovered ? "1.5" : "0.8"}
              className="cursor-pointer transition-all duration-200"
              style={{
                transform: isHovered ? "scale(1.02)" : "scale(1)",
                transformOrigin: "center",
              }}
              onMouseEnter={() => onMuscleHover(muscleId)}
              onMouseLeave={() => onMuscleHover(null)}
              onClick={() => onMuscleClick(muscleId)}
            />
            {/* Label on hover */}
            {isHovered && muscle && (
              <text
                x="50"
                y="108"
                textAnchor="middle"
                className="text-[4px] font-medium fill-gray-700 pointer-events-none"
              >
                {muscle.name}
              </text>
            )}
          </g>
        );
      })}

      {/* Side label */}
      <text
        x="50"
        y="4"
        textAnchor="middle"
        className="text-[4px] font-semibold fill-gray-500 uppercase tracking-wider"
      >
        {side === "front" ? "Front" : "Back"}
      </text>
    </svg>
  );
}
