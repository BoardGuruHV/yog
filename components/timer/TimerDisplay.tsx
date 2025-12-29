"use client";

import { formatTime } from "@/lib/timer/engine";

interface TimerDisplayProps {
  timeRemaining: number;
  totalDuration: number;
  label?: string;
  size?: "small" | "large";
  showProgress?: boolean;
  urgent?: boolean;
}

export default function TimerDisplay({
  timeRemaining,
  totalDuration,
  label,
  size = "large",
  showProgress = true,
  urgent = false,
}: TimerDisplayProps) {
  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;
  const isUrgent = urgent || timeRemaining <= 5;

  const sizeClasses = {
    small: "text-2xl",
    large: "text-6xl md:text-8xl",
  };

  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="text-sm uppercase tracking-wider text-gray-400 mb-2">
          {label}
        </p>
      )}

      <div className="relative">
        {/* Circular progress ring for large size */}
        {size === "large" && showProgress && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.827} 282.7`}
              className={isUrgent ? "text-red-500" : "text-sage-600"}
              style={{
                transition: "stroke-dasharray 0.5s ease-out",
              }}
            />
          </svg>
        )}

        {/* Time display */}
        <div
          className={`font-mono font-bold tabular-nums ${sizeClasses[size]} ${
            isUrgent ? "text-red-500 animate-pulse" : "text-gray-900"
          } ${size === "large" ? "p-8" : ""}`}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Linear progress bar for small size */}
      {size === "small" && showProgress && (
        <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              isUrgent ? "bg-red-500" : "bg-sage-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
