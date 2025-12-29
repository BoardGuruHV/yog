"use client";

import {
  Clock,
  Calendar,
  Flame,
  Trophy,
  TrendingUp,
  Smile,
  Target,
  Activity,
} from "lucide-react";

interface OverviewStats {
  totalMinutes: number;
  totalHours: number;
  totalSessions: number;
  daysPracticed: number;
  avgSessionLength: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  avgMoodImprovement: number;
}

interface StatsOverviewProps {
  stats: OverviewStats;
  period: string;
}

export default function StatsOverview({ stats, period }: StatsOverviewProps) {
  const periodLabel = {
    week: "This Week",
    month: "This Month",
    year: "This Year",
    all: "All Time",
  }[period] || "This Month";

  const statCards = [
    {
      label: "Total Practice Time",
      value: stats.totalHours >= 1 ? `${stats.totalHours}h` : `${stats.totalMinutes}m`,
      subValue: stats.totalHours >= 1 ? `${stats.totalMinutes} minutes` : undefined,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Sessions Completed",
      value: stats.totalSessions.toString(),
      subValue: `${stats.avgSessionLength}m avg`,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Days Practiced",
      value: stats.daysPracticed.toString(),
      subValue: periodLabel,
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak}`,
      subValue: "days",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      label: "Longest Streak",
      value: `${stats.longestStreak}`,
      subValue: "days",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Consistency Score",
      value: `${stats.consistencyScore}%`,
      subValue: getConsistencyLabel(stats.consistencyScore),
      icon: Target,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Mood Improvement",
      value: stats.avgMoodImprovement > 0 ? `+${stats.avgMoodImprovement}` : stats.avgMoodImprovement.toString(),
      subValue: "avg per session",
      icon: Smile,
      color: stats.avgMoodImprovement > 0 ? "text-green-500" : "text-gray-500",
      bgColor: stats.avgMoodImprovement > 0 ? "bg-green-50" : "bg-gray-50",
    },
    {
      label: "Progress Trend",
      value: getTrendEmoji(stats.consistencyScore),
      subValue: getTrendLabel(stats.consistencyScore),
      icon: TrendingUp,
      color: "text-teal-500",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
            {stat.subValue && (
              <div className="text-xs text-gray-400">{stat.subValue}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getConsistencyLabel(score: number): string {
  if (score >= 80) return "Excellent!";
  if (score >= 60) return "Good";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Building";
  return "Getting started";
}

function getTrendEmoji(score: number): string {
  if (score >= 80) return "🚀";
  if (score >= 60) return "📈";
  if (score >= 40) return "➡️";
  if (score >= 20) return "🌱";
  return "🎯";
}

function getTrendLabel(score: number): string {
  if (score >= 80) return "Crushing it!";
  if (score >= 60) return "On track";
  if (score >= 40) return "Steady";
  if (score >= 20) return "Growing";
  return "New journey";
}
