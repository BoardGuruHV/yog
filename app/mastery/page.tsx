"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Trophy, ArrowLeft, Loader2 } from "lucide-react";
import MasteryProgress from "@/components/mastery/MasteryProgress";
import MasteryGrid from "@/components/mastery/MasteryGrid";

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

interface MasteryData {
  masteries: MasteryItem[];
  stats: MasteryStats;
}

export default function MasteryPage() {
  const { data: session, status } = useSession();
  const [masteryData, setMasteryData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMasteryData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchMasteryData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mastery");
      if (!response.ok) {
        throw new Error("Failed to fetch mastery data");
      }
      const data = await response.json();
      setMasteryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sage-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading your mastery progress...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-sage-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Track Your Mastery
          </h1>
          <p className="text-gray-500 mb-6">
            Sign in to track your progress and see how you&apos;re advancing in your yoga practice.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchMasteryData}
            className="px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pose Mastery</h1>
              <p className="text-gray-500">
                Track your progress as you master each yoga pose
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {masteryData ? (
          <div className="space-y-8">
            {/* Progress Overview */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Progress
              </h2>
              <MasteryProgress stats={masteryData.stats} />
            </section>

            {/* Mastery Grid */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Practiced Poses
              </h2>
              <MasteryGrid masteries={masteryData.masteries} />
            </section>

            {/* Unpracticed Poses CTA */}
            {masteryData.stats.notStartedCount > 0 && (
              <section className="bg-linear-to-r from-sage-50 to-green-50 rounded-xl border border-sage-200 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {masteryData.stats.notStartedCount} poses waiting to be discovered
                    </h3>
                    <p className="text-gray-600">
                      Explore new poses to expand your practice and build your mastery.
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors whitespace-nowrap"
                  >
                    Browse All Poses
                  </Link>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">🧘</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start Your Mastery Journey
            </h3>
            <p className="text-gray-500 mb-4">
              Practice poses to begin tracking your mastery progress.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
            >
              Explore Poses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
