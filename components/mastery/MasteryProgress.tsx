"use client";

import { Trophy, Target, Clock, Flame } from "lucide-react";
import MasteryBadge from "./MasteryBadge";

interface MasteryStats {
  totalAsanas: number;
  practicedAsanas: number;
  masteredCount: number;
  proficientCount: number;
  comfortableCount: number;
  practicingCount: number;
  learningCount: number;
  notStartedCount: number;
  totalPractices: number;
  totalDurationMinutes: number;
  overallProgress: number;
  masteryProgress: number;
}

interface MasteryProgressProps {
  stats: MasteryStats;
}

export default function MasteryProgress({ stats }: MasteryProgressProps) {
  // Level distribution for visual bar
  const levelDistribution = [
    { level: 5, count: stats.masteredCount, color: "bg-amber-500" },
    { level: 4, count: stats.proficientCount, color: "bg-purple-500" },
    { level: 3, count: stats.comfortableCount, color: "bg-green-500" },
    { level: 2, count: stats.practicingCount, color: "bg-blue-500" },
    { level: 1, count: stats.learningCount, color: "bg-gray-400" },
  ];

  const totalPracticed = stats.practicedAsanas;
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.masteredCount}
          </div>
          <div className="text-sm text-gray-500">Poses Mastered</div>
          <div className="text-xs text-gray-400 mt-1">
            of {stats.totalAsanas} total
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.practicedAsanas}
          </div>
          <div className="text-sm text-gray-500">Poses Practiced</div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.overallProgress}% of library
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Flame className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalPractices}
          </div>
          <div className="text-sm text-gray-500">Total Practices</div>
          <div className="text-xs text-gray-400 mt-1">across all poses</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(stats.totalDurationMinutes)}
          </div>
          <div className="text-sm text-gray-500">Total Practice Time</div>
          <div className="text-xs text-gray-400 mt-1">accumulated</div>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Mastery Distribution</h3>

        {/* Stacked Progress Bar */}
        <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex mb-4">
          {levelDistribution.map((level) => {
            const percentage =
              totalPracticed > 0 ? (level.count / stats.totalAsanas) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div
                key={level.level}
                className={`${level.color} h-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
                title={`Level ${level.level}: ${level.count} poses`}
              />
            );
          })}
          {stats.notStartedCount > 0 && (
            <div
              className="bg-gray-200 h-full"
              style={{
                width: `${(stats.notStartedCount / stats.totalAsanas) * 100}%`,
              }}
              title={`Not started: ${stats.notStartedCount} poses`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center">
          {[5, 4, 3, 2, 1].map((level) => {
            const count =
              level === 5
                ? stats.masteredCount
                : level === 4
                ? stats.proficientCount
                : level === 3
                ? stats.comfortableCount
                : level === 2
                ? stats.practicingCount
                : stats.learningCount;

            return (
              <div key={level} className="flex items-center gap-2">
                <MasteryBadge level={level} size="sm" />
                <span className="text-sm text-gray-500">({count})</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-sm" />
            <span className="text-xs text-gray-500">
              Not Started ({stats.notStartedCount})
            </span>
          </div>
        </div>
      </div>

      {/* Mastery Journey */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Mastery Journey</h3>
        <div className="relative">
          {/* Journey Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Journey Steps */}
          <div className="space-y-6">
            {[
              {
                level: 1,
                practices: "0-4",
                desc: "Begin your journey with each pose",
              },
              {
                level: 2,
                practices: "5-19",
                desc: "Build familiarity and basic form",
              },
              {
                level: 3,
                practices: "20-49",
                desc: "Develop confidence and ease",
              },
              {
                level: 4,
                practices: "50-99",
                desc: "Refine alignment and breath",
              },
              {
                level: 5,
                practices: "100+",
                desc: "Achieve mastery and teach others",
              },
            ].map((step, index) => {
              const currentCount =
                step.level === 1
                  ? stats.learningCount
                  : step.level === 2
                  ? stats.practicingCount
                  : step.level === 3
                  ? stats.comfortableCount
                  : step.level === 4
                  ? stats.proficientCount
                  : stats.masteredCount;

              return (
                <div key={step.level} className="relative flex items-start gap-4">
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                      currentCount > 0
                        ? "bg-sage-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.level}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MasteryBadge level={step.level} size="sm" />
                      <span className="text-sm text-gray-500">
                        {step.practices} practices
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                    {currentCount > 0 && (
                      <p className="text-xs text-sage-600 mt-1">
                        {currentCount} pose{currentCount !== 1 ? "s" : ""} at this
                        level
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
