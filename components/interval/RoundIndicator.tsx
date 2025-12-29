"use client";

import { Check, Circle } from "lucide-react";

interface RoundIndicatorProps {
  currentRound: number;
  totalRounds: number;
  isResting: boolean;
}

export default function RoundIndicator({
  currentRound,
  totalRounds,
  isResting,
}: RoundIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Round Counter */}
      <div className="text-center">
        <p className="text-sm text-white/70 uppercase tracking-wider mb-1">
          Round
        </p>
        <p className="text-4xl font-bold text-white">
          {currentRound} <span className="text-white/50">/ {totalRounds}</span>
        </p>
      </div>

      {/* Round Dots */}
      <div className="flex items-center gap-2 flex-wrap justify-center max-w-xs">
        {Array.from({ length: totalRounds }).map((_, index) => {
          const roundNumber = index + 1;
          const isCompleted = roundNumber < currentRound;
          const isCurrent = roundNumber === currentRound;

          return (
            <div
              key={index}
              className={`relative flex items-center justify-center transition-all duration-300 ${
                isCurrent ? "scale-125" : ""
              }`}
            >
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : isCurrent ? (
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isResting
                      ? "bg-blue-500 animate-pulse"
                      : "bg-orange-500 animate-pulse"
                  }`}
                >
                  <span className="text-xs font-bold text-white">
                    {roundNumber}
                  </span>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-white/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isResting ? "bg-blue-500" : "bg-orange-500"
            }`}
            style={{
              width: `${((currentRound - 1) / totalRounds) * 100 + (isResting ? 0.5 : 0) * (100 / totalRounds)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
