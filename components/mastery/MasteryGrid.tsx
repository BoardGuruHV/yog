"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, TrendingUp, Calendar } from "lucide-react";
import MasteryBadge from "./MasteryBadge";

interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  svgPath: string;
}

interface MasteryItem {
  id: string;
  level: number;
  practiceCount: number;
  totalDuration: number;
  bestHoldTime: number;
  lastPracticed: string | null;
  asana: Asana;
  practicesUntilNextLevel: number;
}

interface MasteryGridProps {
  masteries: MasteryItem[];
  showFilters?: boolean;
}

type SortOption = "level" | "practices" | "recent" | "name";
type FilterLevel = "all" | 1 | 2 | 3 | 4 | 5;

export default function MasteryGrid({
  masteries,
  showFilters = true,
}: MasteryGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("level");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Get unique categories
  const categories = Array.from(new Set(masteries.map((m) => m.asana.category)));

  // Filter masteries
  const filteredMasteries = masteries.filter((m) => {
    if (filterLevel !== "all" && m.level !== filterLevel) return false;
    if (filterCategory !== "all" && m.asana.category !== filterCategory)
      return false;
    return true;
  });

  // Sort masteries
  const sortedMasteries = [...filteredMasteries].sort((a, b) => {
    switch (sortBy) {
      case "level":
        return b.level - a.level || b.practiceCount - a.practiceCount;
      case "practices":
        return b.practiceCount - a.practiceCount;
      case "recent":
        if (!a.lastPracticed) return 1;
        if (!b.lastPracticed) return -1;
        return (
          new Date(b.lastPracticed).getTime() -
          new Date(a.lastPracticed).getTime()
        );
      case "name":
        return a.asana.nameEnglish.localeCompare(b.asana.nameEnglish);
      default:
        return 0;
    }
  });

  const formatDuration = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
    if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}m`;
    }
    return `${seconds}s`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (masteries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">🧘</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Mastery Progress Yet
        </h3>
        <p className="text-gray-500 mb-4">
          Start practicing poses to track your mastery progress!
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
        >
          Browse Poses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) =>
                setFilterLevel(
                  e.target.value === "all"
                    ? "all"
                    : (parseInt(e.target.value, 10) as FilterLevel)
                )
              }
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="all">All Levels</option>
              <option value="5">Mastered</option>
              <option value="4">Proficient</option>
              <option value="3">Comfortable</option>
              <option value="2">Practicing</option>
              <option value="1">Learning</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
          >
            <option value="level">Sort by Level</option>
            <option value="practices">Sort by Practices</option>
            <option value="recent">Sort by Recent</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {sortedMasteries.length} of {masteries.length} poses
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedMasteries.map((mastery) => (
          <Link
            key={mastery.id}
            href={`/asana/${mastery.asana.id}`}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-50 p-4">
              <Image
                src={mastery.asana.svgPath}
                alt={mastery.asana.nameEnglish}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform"
              />
              {/* Mastery Badge */}
              <div className="absolute top-2 right-2">
                <MasteryBadge level={mastery.level} size="sm" showLabel={false} />
              </div>
              {/* Progress Ring */}
              <div className="absolute bottom-2 right-2">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke={
                        mastery.level === 5
                          ? "#f59e0b"
                          : mastery.level === 4
                          ? "#8b5cf6"
                          : mastery.level === 3
                          ? "#22c55e"
                          : mastery.level === 2
                          ? "#3b82f6"
                          : "#9ca3af"
                      }
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        16 *
                        (1 -
                          (mastery.level === 5
                            ? 1
                            : mastery.practiceCount /
                              (mastery.level === 1
                                ? 5
                                : mastery.level === 2
                                ? 20
                                : mastery.level === 3
                                ? 50
                                : 100)))
                      }`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                    {mastery.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate">
                {mastery.asana.nameEnglish}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {mastery.asana.nameSanskrit}
              </p>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>{mastery.practiceCount}x</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(mastery.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span className="truncate">
                    {formatDate(mastery.lastPracticed)}
                  </span>
                </div>
              </div>

              {/* Next Level Progress */}
              {mastery.level < 5 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Next level</span>
                    <span>{mastery.practicesUntilNextLevel} more</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((mastery.practiceCount -
                            (mastery.level === 1
                              ? 0
                              : mastery.level === 2
                              ? 5
                              : mastery.level === 3
                              ? 20
                              : 50)) /
                            (mastery.level === 1
                              ? 5
                              : mastery.level === 2
                              ? 15
                              : mastery.level === 3
                              ? 30
                              : 50)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
