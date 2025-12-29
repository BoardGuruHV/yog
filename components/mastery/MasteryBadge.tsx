"use client";

import { Star, Award, Crown, Sparkles, GraduationCap } from "lucide-react";

interface MasteryBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const LEVEL_CONFIG = {
  1: {
    name: "Learning",
    icon: GraduationCap,
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    borderColor: "border-gray-300",
    iconColor: "text-gray-500",
  },
  2: {
    name: "Practicing",
    icon: Star,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    iconColor: "text-blue-500",
  },
  3: {
    name: "Comfortable",
    icon: Sparkles,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    iconColor: "text-green-500",
  },
  4: {
    name: "Proficient",
    icon: Award,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    iconColor: "text-purple-500",
  },
  5: {
    name: "Mastered",
    icon: Crown,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-400",
    iconColor: "text-amber-500",
  },
};

const SIZE_CONFIG = {
  sm: {
    container: "px-2 py-1",
    icon: "w-3 h-3",
    text: "text-xs",
    gap: "gap-1",
  },
  md: {
    container: "px-3 py-1.5",
    icon: "w-4 h-4",
    text: "text-sm",
    gap: "gap-1.5",
  },
  lg: {
    container: "px-4 py-2",
    icon: "w-5 h-5",
    text: "text-base",
    gap: "gap-2",
  },
};

export default function MasteryBadge({
  level,
  size = "md",
  showLabel = true,
  className = "",
}: MasteryBadgeProps) {
  const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center ${sizeConfig.gap} ${sizeConfig.container}
        ${config.bgColor} ${config.textColor}
        border ${config.borderColor} rounded-full
        font-medium ${sizeConfig.text}
        ${className}
      `}
    >
      <Icon className={`${sizeConfig.icon} ${config.iconColor}`} />
      {showLabel && <span>{config.name}</span>}
    </div>
  );
}

// Export level config for use elsewhere
export { LEVEL_CONFIG };
