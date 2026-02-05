"use client";

import { useState, useEffect } from "react";
import { BarChart3, Clock, Target, TrendingUp, Loader2 } from "lucide-react";

interface ProgressData {
  weeklyMinutes: number[];
  totalMinutesThisWeek: number;
  totalSessionsThisWeek: number;
  weeklyGoal: number;
  percentComplete: number;
  trend: "up" | "down" | "same";
  comparisonText: string;
}

export default function ProgressWidget() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/dashboard/progress");
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-6 h-full">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-sage-400 animate-spin" />
        </div>
      </div>
    );
  }

  // Default values if no progress data
  const data = progress || {
    weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
    totalMinutesThisWeek: 0,
    totalSessionsThisWeek: 0,
    weeklyGoal: 150,
    percentComplete: 0,
    trend: "same" as const,
    comparisonText: "Start practicing to see your progress!",
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxMinutes = Math.max(...data.weeklyMinutes, 30); // Minimum scale of 30 min

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sage-600" />
          <h3 className="font-semibold text-gray-800">Weekly Progress</h3>
        </div>
        <div className="flex items-center gap-1 text-sm">
          {data.trend === "up" && (
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              Improving
            </span>
          )}
          {data.trend === "down" && (
            <span className="flex items-center gap-1 text-amber-600">
              <TrendingUp className="w-4 h-4 rotate-180" />
              Declining
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-sage-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-sage-600 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{data.totalMinutesThisWeek}</p>
          <p className="text-xs text-gray-500">minutes</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{data.totalSessionsThisWeek}</p>
          <p className="text-xs text-gray-500">sessions</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{data.percentComplete}%</p>
          <p className="text-xs text-gray-500">of goal</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-4">
        <div className="flex items-end justify-between gap-2 h-32">
          {data.weeklyMinutes.map((minutes, idx) => {
            const height = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
            const isToday = idx === new Date().getDay() - 1 || (new Date().getDay() === 0 && idx === 6);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{minutes}m</span>
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: "100px" }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                      isToday ? "bg-sage-500" : "bg-sage-300"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className={`text-xs ${isToday ? "font-semibold text-sage-600" : "text-gray-400"}`}>
                  {dayLabels[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Weekly Goal</span>
          <span className="text-gray-800 font-medium">
            {data.totalMinutesThisWeek} / {data.weeklyGoal} min
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-sage-400 to-sage-600 rounded-full transition-all"
            style={{ width: `${Math.min(data.percentComplete, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{data.comparisonText}</p>
      </div>
    </div>
  );
}
