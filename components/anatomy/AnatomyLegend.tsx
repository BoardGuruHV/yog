"use client";

import { ENGAGEMENT_COLORS, MUSCLES, MuscleInfo } from "@/lib/anatomy/muscles";
import { Flame, Zap, ArrowDownUp } from "lucide-react";

interface AnatomyLegendProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  stretchedMuscles: string[];
  hoveredMuscle: string | null;
  onMuscleHover: (muscleId: string | null) => void;
  onMuscleClick: (muscleId: string) => void;
}

const ENGAGEMENT_ICONS = {
  primary: Flame,
  secondary: Zap,
  stretched: ArrowDownUp,
};

export default function AnatomyLegend({
  primaryMuscles,
  secondaryMuscles,
  stretchedMuscles,
  hoveredMuscle,
  onMuscleHover,
  onMuscleClick,
}: AnatomyLegendProps) {
  const renderMuscleList = (
    muscles: string[],
    type: "primary" | "secondary" | "stretched"
  ) => {
    if (muscles.length === 0) return null;

    const colors = ENGAGEMENT_COLORS[type];
    const Icon = ENGAGEMENT_ICONS[type];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: colors.fill, border: `2px solid ${colors.stroke}` }}
          />
          <Icon className="w-4 h-4" style={{ color: colors.stroke }} />
          <span className="text-sm font-medium text-gray-700">{colors.label}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pl-6">
          {muscles.map((muscleId) => {
            const muscle = MUSCLES[muscleId];
            if (!muscle) return null;

            const isHovered = hoveredMuscle === muscleId;

            return (
              <button
                key={muscleId}
                onMouseEnter={() => onMuscleHover(muscleId)}
                onMouseLeave={() => onMuscleHover(null)}
                onClick={() => onMuscleClick(muscleId)}
                className={`
                  px-2 py-1 rounded-md text-xs font-medium transition-all
                  ${isHovered ? "scale-105 shadow-md" : ""}
                `}
                style={{
                  backgroundColor: isHovered ? colors.fill : `${colors.fill}40`,
                  color: colors.stroke,
                  border: `1px solid ${colors.stroke}`,
                  boxShadow: isHovered ? `0 0 0 2px ${colors.stroke}40` : undefined,
                }}
              >
                {muscle.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const hasMuscles = primaryMuscles.length > 0 || secondaryMuscles.length > 0 || stretchedMuscles.length > 0;

  if (!hasMuscles) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p className="text-sm">No muscle data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderMuscleList(primaryMuscles, "primary")}
      {renderMuscleList(secondaryMuscles, "secondary")}
      {renderMuscleList(stretchedMuscles, "stretched")}
    </div>
  );
}

// Compact inline legend for smaller displays
export function LegendInline() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {(Object.entries(ENGAGEMENT_COLORS) as [keyof typeof ENGAGEMENT_COLORS, typeof ENGAGEMENT_COLORS[keyof typeof ENGAGEMENT_COLORS]][]).map(
        ([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-xs"
              style={{ backgroundColor: colors.fill, border: `1px solid ${colors.stroke}` }}
            />
            <span className="text-gray-600">{colors.label}</span>
          </div>
        )
      )}
    </div>
  );
}
