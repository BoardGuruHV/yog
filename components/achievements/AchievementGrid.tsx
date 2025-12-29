"use client";

import { useState } from "react";
import AchievementCard from "./AchievementCard";
import { Trophy, Flame, Compass, Star, Sparkles } from "lucide-react";

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  hidden: boolean;
  progress: number;
  target: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementGridProps {
  byCategory: Record<string, Achievement[]>;
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
}

const CATEGORY_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  streak: {
    label: "Streak Achievements",
    icon: <Flame className="w-5 h-5" />,
    color: "text-orange-600",
  },
  practice: {
    label: "Practice Achievements",
    icon: <Trophy className="w-5 h-5" />,
    color: "text-green-600",
  },
  exploration: {
    label: "Exploration Achievements",
    icon: <Compass className="w-5 h-5" />,
    color: "text-blue-600",
  },
  mastery: {
    label: "Mastery Achievements",
    icon: <Star className="w-5 h-5" />,
    color: "text-purple-600",
  },
  special: {
    label: "Special Achievements",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-yellow-600",
  },
};

export default function AchievementGrid({
  byCategory,
  totalPoints,
  unlockedCount,
  totalCount,
}: AchievementGridProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Object.keys(byCategory);

  const getFilteredAchievements = (achievements: Achievement[]) => {
    switch (filter) {
      case "unlocked":
        return achievements.filter((a) => a.isUnlocked);
      case "locked":
        return achievements.filter((a) => !a.isUnlocked);
      default:
        return achievements;
    }
  };

  const categoriesToShow = selectedCategory
    ? [selectedCategory]
    : categories;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{unlockedCount}</p>
          <p className="text-sm text-gray-500">Unlocked</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{totalPoints}</p>
          <p className="text-sm text-gray-500">Points</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              !selectedCategory
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const info = CATEGORY_INFO[cat] || {
              label: cat,
              icon: <Trophy className="w-4 h-4" />,
              color: "text-gray-600",
            };
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {info.icon}
                {info.label.replace(" Achievements", "")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievement Categories */}
      {categoriesToShow.map((category) => {
        const achievements = getFilteredAchievements(byCategory[category] || []);
        if (achievements.length === 0) return null;

        const info = CATEGORY_INFO[category] || {
          label: category,
          icon: <Trophy className="w-5 h-5" />,
          color: "text-gray-600",
        };

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={info.color}>{info.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">
                {info.label}
              </h3>
              <span className="text-sm text-gray-500">
                ({achievements.filter((a) => a.isUnlocked).length}/
                {byCategory[category]?.length || 0})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  id={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  category={achievement.category}
                  points={achievement.points}
                  rarity={achievement.rarity}
                  progress={achievement.progress}
                  target={achievement.target}
                  isUnlocked={achievement.isUnlocked}
                  unlockedAt={achievement.unlockedAt}
                  hidden={achievement.hidden}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {categoriesToShow.every(
        (cat) => getFilteredAchievements(byCategory[cat] || []).length === 0
      ) && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === "unlocked"
              ? "No achievements unlocked yet. Keep practicing!"
              : filter === "locked"
                ? "All achievements unlocked! Amazing work!"
                : "No achievements found."}
          </p>
        </div>
      )}
    </div>
  );
}
