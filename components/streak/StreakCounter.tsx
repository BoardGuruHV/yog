"use client";

import { Flame, Snowflake, Trophy } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  freezesLeft: number;
  totalPractices: number;
  practicedToday: boolean;
  compact?: boolean;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  freezesLeft,
  totalPractices,
  practicedToday,
  compact = false,
}: StreakCounterProps) {
  // Determine streak status and color
  const getStreakColor = () => {
    if (currentStreak === 0) return "text-gray-400";
    if (currentStreak >= 100) return "text-purple-500";
    if (currentStreak >= 30) return "text-orange-500";
    if (currentStreak >= 7) return "text-yellow-500";
    return "text-red-500";
  };

  const getStreakBgColor = () => {
    if (currentStreak === 0) return "bg-gray-100";
    if (currentStreak >= 100) return "bg-purple-50";
    if (currentStreak >= 30) return "bg-orange-50";
    if (currentStreak >= 7) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getFlameSize = () => {
    if (currentStreak >= 100) return "scale-125";
    if (currentStreak >= 30) return "scale-110";
    return "scale-100";
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getStreakBgColor()}`}
      >
        <Flame className={`w-4 h-4 ${getStreakColor()} ${getFlameSize()}`} />
        <span className={`font-bold text-sm ${getStreakColor()}`}>
          {currentStreak}
        </span>
        {practicedToday && (
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Main Streak Display */}
      <div className="flex items-center justify-center mb-6">
        <div className={`relative p-6 rounded-full ${getStreakBgColor()}`}>
          <Flame
            className={`w-16 h-16 ${getStreakColor()} ${getFlameSize()} transition-transform ${
              currentStreak > 0 ? "animate-pulse" : ""
            }`}
          />
          {practicedToday && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Streak Count */}
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold ${getStreakColor()} mb-1`}>
          {currentStreak}
        </div>
        <div className="text-gray-500">
          {currentStreak === 1 ? "day streak" : "day streak"}
        </div>
        {!practicedToday && currentStreak > 0 && (
          <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">
            Practice today to keep your streak!
          </div>
        )}
        {practicedToday && (
          <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
            Practiced today - great job!
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Longest Streak */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900">{longestStreak}</div>
          <div className="text-xs text-gray-500">Best Streak</div>
        </div>

        {/* Total Practices */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="w-5 h-5 mx-auto mb-1 flex items-center justify-center text-green-500">
            🧘
          </div>
          <div className="text-xl font-bold text-gray-900">{totalPractices}</div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>

        {/* Freezes Left */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Snowflake className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900">{freezesLeft}</div>
          <div className="text-xs text-gray-500">Freezes</div>
        </div>
      </div>

      {/* Freeze Info */}
      <div className="mt-4 text-center text-xs text-gray-400">
        Streak freezes protect your streak when you miss a day (2 per month)
      </div>
    </div>
  );
}
