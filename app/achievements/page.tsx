"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import AchievementGrid from "@/components/achievements/AchievementGrid";
import UnlockAnimation from "@/components/achievements/UnlockAnimation";

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

interface NewAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
}

interface AchievementsData {
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
  byCategory: Record<string, Achievement[]>;
  recentUnlocks: Achievement[];
  newAchievements: NewAchievement[];
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/achievements");
      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }
      const result: AchievementsData = await response.json();
      setData(result);

      // Show unlock animation for new achievements
      if (result.newAchievements && result.newAchievements.length > 0) {
        setNewAchievements(result.newAchievements);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDismissNewAchievements = async (achievementIds: string[]) => {
    setNewAchievements([]);

    // Mark as notified
    try {
      await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementIds }),
      });
    } catch (err) {
      console.error("Failed to mark achievements as notified:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unlock Animation */}
      {newAchievements.length > 0 && (
        <UnlockAnimation
          achievements={newAchievements}
          onDismiss={handleDismissNewAchievements}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Achievements
                </h1>
                <p className="text-sm text-gray-500">
                  Track your yoga journey milestones
                </p>
              </div>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Loading achievements...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Achievements Content */}
        {data && !loading && !error && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Your Progress
                    </h2>
                    <p className="text-sm text-gray-500">
                      {data.unlockedCount} of {data.totalCount} achievements unlocked
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">
                    {data.totalPoints}
                  </p>
                  <p className="text-sm text-gray-500">Total Points</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Completion</span>
                  <span>{data.completionPercentage}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${data.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Unlocks */}
            {data.recentUnlocks && data.recentUnlocks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recently Unlocked
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {data.recentUnlocks.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex-shrink-0 flex items-center gap-3 bg-green-50 rounded-lg px-4 py-2"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {achievement.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          +{achievement.points} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Achievements */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <AchievementGrid
                byCategory={data.byCategory}
                totalPoints={data.totalPoints}
                unlockedCount={data.unlockedCount}
                totalCount={data.totalCount}
              />
            </div>
          </div>
        )}

        {/* Empty State for logged out users */}
        {!data && !loading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sign In to Track Achievements
              </h3>
              <p className="text-gray-500 mb-6">
                Log in to start earning achievements and track your yoga journey.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
