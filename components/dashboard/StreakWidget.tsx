"use client";

import { useState, useEffect } from "react";
import { Flame, Trophy, Calendar, Loader2 } from "lucide-react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPractice: string | null;
  practiceToday: boolean;
  weeklyPractices: boolean[]; // Last 7 days, today is last
}

export default function StreakWidget() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const response = await fetch("/api/dashboard/streak");
      if (response.ok) {
        const data = await response.json();
        setStreak(data);
      }
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 h-full">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-sage-400 animate-spin" />
        </div>
      </div>
    );
  }

  // Default values if no streak data
  const data = streak || {
    currentStreak: 0,
    longestStreak: 0,
    lastPractice: null,
    practiceToday: false,
    weeklyPractices: [false, false, false, false, false, false, false],
  };

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  // Reorder so today is last
  const reorderedLabels = [...dayLabels.slice(today), ...dayLabels.slice(0, today)];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Practice Streak</h3>
        <div className={`p-2 rounded-full ${data.practiceToday ? "bg-orange-100" : "bg-gray-100"}`}>
          <Flame className={`w-5 h-5 ${data.practiceToday ? "text-orange-500" : "text-gray-400"}`} />
        </div>
      </div>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl font-bold text-sage-600">{data.currentStreak}</span>
          <span className="text-lg text-gray-500">days</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {data.currentStreak === 0
            ? "Start your streak today!"
            : data.practiceToday
            ? "Keep it going!"
            : "Practice today to continue!"}
        </p>
      </div>

      {/* Weekly Overview */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Last 7 days</p>
        <div className="flex justify-between gap-1">
          {data.weeklyPractices.map((practiced, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  practiced
                    ? "bg-sage-500 text-white"
                    : idx === 6
                    ? "bg-sage-100 border-2 border-dashed border-sage-300"
                    : "bg-gray-100"
                }`}
              >
                {practiced && <Flame className="w-4 h-4" />}
              </div>
              <span className="text-xs text-gray-400">{reorderedLabels[idx]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Streak */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Best streak</span>
        </div>
        <span className="font-semibold text-gray-800">{data.longestStreak} days</span>
      </div>

      {/* Last Practice */}
      {data.lastPractice && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-sage-500" />
            <span>Last practice</span>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(data.lastPractice).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
