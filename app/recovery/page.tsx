"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import RestDayCard from "@/components/rest/RestDayCard";
import BodyHeatmap from "@/components/rest/BodyHeatmap";
import RecoveryPoses from "@/components/rest/RecoveryPoses";
import { Asana } from "@/types";
import { BodyPartActivity } from "@/lib/recovery/analyzer";

interface RecommendationData {
  analysis: {
    totalSessions: number;
    totalMinutes: number;
    averageSessionLength: number;
    daysSinceLastPractice: number;
    intensityScore: number;
    needsRest: boolean;
    restReasons: string[];
    bodyPartActivity: BodyPartActivity[];
    categoryDistribution: Record<string, number>;
  };
  recommendation: {
    type: "rest" | "gentle" | "restorative" | "active_recovery";
    title: string;
    description: string;
    suggestedPoses: string[];
    suggestedDuration: number;
    focusAreas: string[];
    avoidAreas: string[];
    suggestedAsanas: Asana[];
  };
  isAuthenticated: boolean;
}

export default function RecoveryPage() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rest-recommendations");
      if (!res.ok) {
        throw new Error("Failed to load recommendations");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Failed to load recovery recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-2 text-sage-600 hover:text-sage-700 font-medium mt-4"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sage-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            Rest & Recovery
          </h1>
          <p className="text-sage-200 mt-2">
            Personalized recommendations based on your recent practice
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Auth notice */}
        {!data.isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">Demo Mode</p>
              <p className="text-blue-700 text-sm mt-1">
                Sign in to get personalized recommendations based on your actual practice history.
                Currently showing default recommendations.
              </p>
              <Link
                href="/login"
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Sign in to personalize →
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main recommendation card */}
          <div className="lg:col-span-2">
            <RestDayCard
              recommendation={data.recommendation}
              analysis={data.analysis}
            />

            {/* Suggested poses */}
            <div className="mt-6">
              <RecoveryPoses
                poses={data.recommendation.suggestedAsanas}
                title="Suggested Recovery Poses"
                description="Gentle poses to help your body recover and restore"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Body heatmap */}
            <BodyHeatmap bodyPartActivity={data.analysis.bodyPartActivity} />

            {/* Tips card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Recovery Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-sage-600">•</span>
                  <span>
                    Stay hydrated - drink plenty of water throughout the day
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sage-600">•</span>
                  <span>
                    Get 7-9 hours of quality sleep for optimal recovery
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sage-600">•</span>
                  <span>
                    Light walking can help with active recovery
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sage-600">•</span>
                  <span>
                    Consider foam rolling for tight muscles
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sage-600">•</span>
                  <span>
                    Listen to your body - rest when needed
                  </span>
                </li>
              </ul>
            </div>

            {/* Category distribution */}
            {Object.keys(data.analysis.categoryDistribution).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Practice Balance
                </h3>
                <div className="space-y-2">
                  {Object.entries(data.analysis.categoryDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => {
                      const total = Object.values(
                        data.analysis.categoryDistribution
                      ).reduce((sum, c) => sum + c, 0);
                      const percentage = Math.round((count / total) * 100);
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 capitalize">
                              {category.toLowerCase().replace("_", " ")}
                            </span>
                            <span className="text-gray-500">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sage-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
