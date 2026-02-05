"use client";

import { Star, Lock, CheckCircle2 } from "lucide-react";

interface Milestone {
  days: number;
  achieved: boolean;
}

interface StreakMilestoneProps {
  milestones: Milestone[];
  currentStreak: number;
  nextMilestone: number | null;
}

const milestoneInfo: Record<
  number,
  { name: string; icon: string; color: string; description: string }
> = {
  7: {
    name: "Week Warrior",
    icon: "🌟",
    color: "from-yellow-400 to-amber-500",
    description: "7 days of consistent practice",
  },
  30: {
    name: "Monthly Master",
    icon: "🔥",
    color: "from-orange-400 to-red-500",
    description: "30 days of dedication",
  },
  60: {
    name: "Two-Month Champion",
    icon: "💪",
    color: "from-purple-400 to-indigo-500",
    description: "60 days of commitment",
  },
  100: {
    name: "Century Yogi",
    icon: "🏆",
    color: "from-amber-500 to-yellow-600",
    description: "100 days of mastery",
  },
  365: {
    name: "Year of Yoga",
    icon: "👑",
    color: "from-purple-600 to-pink-600",
    description: "One full year of practice",
  },
};

export default function StreakMilestone({
  milestones,
  currentStreak,
  nextMilestone,
}: StreakMilestoneProps) {
  const achievedMilestones = milestones.filter((m) => m.achieved);
  const unachievedMilestones = milestones.filter((m) => !m.achieved);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-gray-900">Milestones</h3>
      </div>

      {/* Next Milestone Progress */}
      {nextMilestone && (
        <div className="mb-6 p-4 bg-linear-to-r from-purple-50 to-indigo-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Next: {milestoneInfo[nextMilestone]?.name}
            </span>
            <span className="text-sm text-gray-500">
              {currentStreak}/{nextMilestone} days
            </span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div
              className={`h-full bg-linear-to-r ${
                milestoneInfo[nextMilestone]?.color || "from-purple-500 to-indigo-500"
              } rounded-full transition-all duration-500`}
              style={{
                width: `${Math.min((currentStreak / nextMilestone) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {nextMilestone - currentStreak} days to go!
          </div>
        </div>
      )}

      {/* Milestone Grid */}
      <div className="space-y-3">
        {milestones.map((milestone) => {
          const info = milestoneInfo[milestone.days];
          const isNext = milestone.days === nextMilestone;

          return (
            <div
              key={milestone.days}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${
                  milestone.achieved
                    ? "border-green-200 bg-green-50"
                    : isNext
                    ? "border-purple-200 bg-purple-50"
                    : "border-gray-100 bg-gray-50 opacity-60"
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-2xl
                    ${
                      milestone.achieved
                        ? `bg-linear-to-r ${info?.color} text-white`
                        : "bg-gray-200"
                    }
                  `}
                >
                  {milestone.achieved ? (
                    info?.icon
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        milestone.achieved ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {info?.name || `${milestone.days} Days`}
                    </span>
                    {milestone.achieved && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{info?.description}</p>
                </div>

                {/* Days Badge */}
                <div
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${
                      milestone.achieved
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  {milestone.days}d
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">
            {achievedMilestones.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">{milestones.length}</span>{" "}
          milestones achieved
        </div>
      </div>
    </div>
  );
}
