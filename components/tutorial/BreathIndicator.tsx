"use client";

import { useEffect, useState } from "react";

interface BreathIndicatorProps {
  breathCue: "inhale" | "exhale" | "hold" | null;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

const BREATH_CONFIG = {
  inhale: {
    label: "Inhale",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    ringColor: "ring-blue-400",
    icon: "↑",
  },
  exhale: {
    label: "Exhale",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    ringColor: "ring-purple-400",
    icon: "↓",
  },
  hold: {
    label: "Hold",
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    ringColor: "ring-amber-400",
    icon: "○",
  },
};

export default function BreathIndicator({
  breathCue,
  isActive = false,
  size = "md",
}: BreathIndicatorProps) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isActive && breathCue) {
      setAnimating(true);
    } else {
      setAnimating(false);
    }
  }, [isActive, breathCue]);

  if (!breathCue) return null;

  const config = BREATH_CONFIG[breathCue];

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          ${sizeClasses[size]}
          ${config.bgColor}
          ${config.color}
          rounded-full flex items-center justify-center font-bold
          transition-all duration-300
          ${isActive ? `ring-4 ${config.ringColor} ring-opacity-50` : ""}
          ${animating && breathCue === "inhale" ? "animate-pulse scale-110" : ""}
          ${animating && breathCue === "exhale" ? "animate-pulse scale-90" : ""}
          ${animating && breathCue === "hold" ? "animate-pulse" : ""}
        `}
      >
        {config.icon}
      </div>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

export function BreathAnimation({ breathCue }: { breathCue: string | null }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!breathCue) return;

    let interval: NodeJS.Timeout;

    if (breathCue === "inhale") {
      // Grow over 4 seconds
      interval = setInterval(() => {
        setScale((prev) => Math.min(prev + 0.01, 1.3));
      }, 40);
    } else if (breathCue === "exhale") {
      // Shrink over 4 seconds
      interval = setInterval(() => {
        setScale((prev) => Math.max(prev - 0.01, 0.8));
      }, 40);
    }

    return () => clearInterval(interval);
  }, [breathCue]);

  return (
    <div
      className="w-24 h-24 rounded-full bg-linear-to-br from-sage-200 to-sage-400 transition-transform duration-100 flex items-center justify-center"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center">
        <span className="text-sage-700 font-medium text-sm">
          {breathCue === "inhale" && "Breathe In"}
          {breathCue === "exhale" && "Breathe Out"}
          {breathCue === "hold" && "Hold"}
        </span>
      </div>
    </div>
  );
}
