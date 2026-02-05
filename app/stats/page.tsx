"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw, AlertCircle } from "lucide-react";
import StatsOverview from "@/components/stats/StatsOverview";
import PracticeChart from "@/components/stats/PracticeChart";
import CategoryBreakdown from "@/components/stats/CategoryBreakdown";
import ActivityHeatmap from "@/components/stats/ActivityHeatmap";

type Period = "week" | "month" | "year" | "all";

interface StatsData {
  overview: {
    totalMinutes: number;
    totalHours: number;
    totalSessions: number;
    daysPracticed: number;
    avgSessionLength: number;
    currentStreak: number;
    longestStreak: number;
    consistencyScore: number;
    avgMoodImprovement: number;
  };
  charts: {
    dailyPractice: Array<{ date: string; minutes: number; sessions: number }>;
    weeklyPractice: Array<{ week: string; minutes: number; sessions: number }>;
    timeOfDay: Array<{ name: string; value: number; time: string }>;
    categories: Array<{ name: string; value: number }>;
    bodyParts: Array<{ name: string; value: number }>;
    heatmap: Array<{ date: string; value: number; sessions: number }>;
  };
  period: string;
}

export default function StatsPage() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("month");

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(`/api/stats?period=${period}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to view your statistics");
          return;
        }
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStatsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const periodOptions: { value: Period; label: string }[] = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">Loading your statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-500 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Practice Statistics
                </h1>
                <p className="text-blue-200 mt-1">
                  Track your yoga journey with detailed analytics
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h2>
            <p className="text-gray-500 mb-4">
              {error.includes("sign in")
                ? "You need to be signed in to view your practice statistics."
                : "We couldn't load your statistics. Please try again."}
            </p>
            {error.includes("sign in") ? (
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={fetchStats}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
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

  if (!statsData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Practice Statistics
                </h1>
                <p className="text-blue-200 mt-1">
                  Track your yoga journey with detailed analytics
                </p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex bg-white/10 rounded-lg p-1">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    period === option.value
                      ? "bg-white text-blue-600"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overview Stats */}
        <StatsOverview stats={statsData.overview} period={period} />

        {/* Practice Over Time Chart */}
        <PracticeChart
          dailyData={statsData.charts.dailyPractice}
          weeklyData={statsData.charts.weeklyPractice}
        />

        {/* Category and Time Breakdowns */}
        <CategoryBreakdown
          categories={statsData.charts.categories}
          timeOfDay={statsData.charts.timeOfDay}
          bodyParts={statsData.charts.bodyParts}
        />

        {/* Activity Heatmap (only show for year/all) */}
        {(period === "year" || period === "all") && (
          <ActivityHeatmap data={statsData.charts.heatmap} />
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/journal"
            className="flex-1 text-center px-6 py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            View Practice Journal
          </Link>
          <Link
            href="/streaks"
            className="flex-1 text-center px-6 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Check Your Streak
          </Link>
          <Link
            href="/goals"
            className="flex-1 text-center px-6 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Manage Goals
          </Link>
        </div>
      </main>
    </div>
  );
}
