"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface UnlockedAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
}

interface UnlockAnimationProps {
  achievements: UnlockedAchievement[];
  onDismiss: (achievementIds: string[]) => void;
}

export default function UnlockAnimation({
  achievements,
  onDismiss,
}: UnlockAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const currentAchievement = achievements[currentIndex];

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);
    }
  }, [achievements]);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsExiting(false);
      }, 200);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(achievements.map((a) => a.id));
      setIsVisible(false);
    }, 200);
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "shadow-gray-300";
      case "uncommon":
        return "shadow-green-300";
      case "rare":
        return "shadow-blue-300";
      case "epic":
        return "shadow-purple-300";
      case "legendary":
        return "shadow-yellow-300";
      default:
        return "shadow-gray-300";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-50 to-gray-100";
      case "uncommon":
        return "from-green-50 to-green-100";
      case "rare":
        return "from-blue-50 to-blue-100";
      case "epic":
        return "from-purple-50 to-purple-100";
      case "legendary":
        return "from-yellow-50 to-amber-100";
      default:
        return "from-gray-50 to-gray-100";
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case "common":
        return { label: "Common", color: "text-gray-600 bg-gray-100" };
      case "uncommon":
        return { label: "Uncommon", color: "text-green-600 bg-green-100" };
      case "rare":
        return { label: "Rare", color: "text-blue-600 bg-blue-100" };
      case "epic":
        return { label: "Epic", color: "text-purple-600 bg-purple-100" };
      case "legendary":
        return { label: "Legendary", color: "text-yellow-700 bg-yellow-100" };
      default:
        return { label: rarity, color: "text-gray-600 bg-gray-100" };
    }
  };

  if (!isVisible || !currentAchievement) return null;

  const rarityInfo = getRarityLabel(currentAchievement.rarity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm transform transition-all duration-300 ${
          isExiting
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >
        <div
          className={`bg-linear-to-br ${getRarityBg(currentAchievement.rarity)} rounded-2xl p-6 shadow-2xl ${getRarityGlow(currentAchievement.rarity)}`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Achievement content */}
          <div className="text-center">
            {/* Badge */}
            <div className="mb-4">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Achievement Unlocked!
              </span>
            </div>

            {/* Icon with glow effect */}
            <div className="relative inline-block mb-4">
              <div
                className={`absolute inset-0 blur-xl opacity-50 ${
                  currentAchievement.rarity === "legendary"
                    ? "bg-yellow-400"
                    : currentAchievement.rarity === "epic"
                      ? "bg-purple-400"
                      : currentAchievement.rarity === "rare"
                        ? "bg-blue-400"
                        : "bg-green-400"
                }`}
              />
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg text-5xl">
                {currentAchievement.icon}
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentAchievement.name}
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-4">
              {currentAchievement.description}
            </p>

            {/* Points and Rarity */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${rarityInfo.color}`}>
                {rarityInfo.label}
              </span>
              <span className="text-lg font-bold text-purple-600">
                +{currentAchievement.points} pts
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {achievements.length}
              </span>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                {currentIndex < achievements.length - 1 ? "Next" : "Close"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
