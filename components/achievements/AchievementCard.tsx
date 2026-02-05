"use client";

import { Lock } from "lucide-react";

interface AchievementCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  progress: number;
  target: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  hidden?: boolean;
}

export default function AchievementCard({
  name,
  description,
  icon,
  points,
  rarity,
  progress,
  target,
  isUnlocked,
  unlockedAt,
  hidden,
}: AchievementCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-100 to-gray-200 border-gray-300";
      case "uncommon":
        return "from-green-50 to-green-100 border-green-300";
      case "rare":
        return "from-blue-50 to-blue-100 border-blue-300";
      case "epic":
        return "from-purple-50 to-purple-100 border-purple-300";
      case "legendary":
        return "from-yellow-50 to-amber-100 border-yellow-400";
      default:
        return "from-gray-100 to-gray-200 border-gray-300";
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case "common":
        return { label: "Common", color: "text-gray-600" };
      case "uncommon":
        return { label: "Uncommon", color: "text-green-600" };
      case "rare":
        return { label: "Rare", color: "text-blue-600" };
      case "epic":
        return { label: "Epic", color: "text-purple-600" };
      case "legendary":
        return { label: "Legendary", color: "text-yellow-600" };
      default:
        return { label: rarity, color: "text-gray-600" };
    }
  };

  const rarityInfo = getRarityLabel(rarity);
  const progressPercentage = target > 0 ? Math.min((progress / target) * 100, 100) : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show locked state for hidden achievements
  if (hidden && !isUnlocked) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-500">Hidden Achievement</h4>
            <p className="text-sm text-gray-400">Keep practicing to discover!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-linear-to-br ${getRarityColor(rarity)} border rounded-xl p-4 transition-all ${
        isUnlocked
          ? "shadow-md"
          : "opacity-75 grayscale-30"
      }`}
    >
      {/* Unlocked indicator */}
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-xs">✓</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
            isUnlocked ? "bg-white shadow-xs" : "bg-gray-200"
          }`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-semibold ${
                isUnlocked ? "text-gray-900" : "text-gray-600"
              }`}
            >
              {name}
            </h4>
            <span className={`text-xs font-medium ${rarityInfo.color}`}>
              {points} pts
            </span>
          </div>

          <p
            className={`text-sm mt-0.5 ${
              isUnlocked ? "text-gray-600" : "text-gray-500"
            }`}
          >
            {description}
          </p>

          {/* Progress bar for locked achievements */}
          {!isUnlocked && target > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {progress} / {target}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlocked date */}
          {isUnlocked && unlockedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Unlocked {formatDate(unlockedAt)}
            </p>
          )}

          {/* Rarity label */}
          <div className="mt-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isUnlocked ? rarityInfo.color : "text-gray-500"
              } ${isUnlocked ? "bg-white/50" : "bg-gray-100"}`}
            >
              {rarityInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
