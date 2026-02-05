"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, RefreshCw, AlertCircle } from "lucide-react";
import StreakCounter from "@/components/streak/StreakCounter";
import StreakCalendar from "@/components/streak/StreakCalendar";
import StreakMilestone from "@/components/streak/StreakMilestone";
import StreakFreezeButton from "@/components/streak/StreakFreezeButton";

interface StreakData {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastPractice: string | null;
    freezesLeft: number;
    totalPractices: number;
  };
  practiceDays: Array<{
    date: string;
    duration: number;
    sessions: number;
    wasFrozen: boolean;
  }>;
  milestones: {
    next: number | null;
    recent: number[];
    all: Array<{ days: number; achieved: boolean }>;
  };
  practicedToday: boolean;
}

export default function StreaksPage() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreakData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/streak");

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to view your streak data");
          return;
        }
        throw new Error("Failed to fetch streak data");
      }

      const data = await response.json();
      setStreakData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  const handleFreezeUsed = () => {
    fetchStreakData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Flame className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">Loading your streak...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50 to-white">
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-orange-500 to-red-500 text-white">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-orange-200 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Practice Streak</h1>
                <p className="text-orange-200 mt-1">
                  Track your daily practice consistency
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-500 mb-4">
              {error.includes("sign in")
                ? "You need to be signed in to track your practice streak."
                : "We couldn't load your streak data. Please try again."}
            </p>
            {error.includes("sign in") ? (
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={fetchStreakData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  const { streak, practiceDays, milestones, practicedToday } = streakData;

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Practice Streak</h1>
              <p className="text-orange-200 mt-1">
                Track your daily practice consistency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Streak Counter */}
        <StreakCounter
          currentStreak={streak.currentStreak}
          longestStreak={streak.longestStreak}
          freezesLeft={streak.freezesLeft}
          totalPractices={streak.totalPractices}
          practicedToday={practicedToday}
        />

        {/* Freeze Button (show if streak > 0 and not practiced today) */}
        {streak.currentStreak > 0 && !practicedToday && (
          <StreakFreezeButton
            freezesLeft={streak.freezesLeft}
            currentStreak={streak.currentStreak}
            onFreezeUsed={handleFreezeUsed}
          />
        )}

        {/* Two Column Layout for Calendar and Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <StreakCalendar practiceDays={practiceDays} />

          {/* Milestones */}
          <StreakMilestone
            milestones={milestones.all}
            currentStreak={streak.currentStreak}
            nextMilestone={milestones.next}
          />
        </div>

        {/* Tips Section */}
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
          <h3 className="font-semibold text-gray-900 mb-3">
            Tips for Building Your Streak
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Practice at the same time each day to build a habit
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Even a 5-minute session counts toward your streak
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Use streak freezes wisely for unexpected busy days
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Set reminders to help you stay consistent
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/practice/timer"
            className="flex-1 text-center px-6 py-4 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            Start Practice Now
          </Link>
          <Link
            href="/programs"
            className="flex-1 text-center px-6 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Browse Programs
          </Link>
        </div>
      </main>
    </div>
  );
}
