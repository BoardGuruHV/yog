"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, RefreshCw, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useProgram } from "@/context/ProgramContext";

interface RecommendedAsana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  targetBodyParts: string[];
  svgPath?: string;
  durationSeconds?: number;
}

interface Recommendation {
  asana: RecommendedAsana;
  score: number;
  reasons: string[];
}

interface PoseRecommendationsProps {
  mode?: "next" | "start" | "cooldown";
  onAddPose?: (asana: RecommendedAsana) => void;
  compact?: boolean;
}

export default function PoseRecommendations({
  mode = "next",
  onAddPose,
  compact = false,
}: PoseRecommendationsProps) {
  const { state, addAsana } = useProgram();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionAsanaIds = state.asanas.map((a) => a.asanaId);
      const currentAsanaId =
        sessionAsanaIds.length > 0
          ? sessionAsanaIds[sessionAsanaIds.length - 1]
          : null;

      // Calculate session progress
      const sessionProgress =
        state.asanas.length > 0
          ? Math.min(state.asanas.length / 10, 1) // Assume ~10 poses is a full session
          : 0;

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAsanaId,
          sessionAsanaIds,
          sessionProgress,
          mode,
          limit: compact ? 3 : 5,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations when session changes
  useEffect(() => {
    fetchRecommendations();
  }, [state.asanas.length, mode]);

  const handleAddPose = (asana: RecommendedAsana) => {
    if (onAddPose) {
      onAddPose(asana);
    } else {
      // Default: add to program
      addAsana({
        id: asana.id,
        nameEnglish: asana.nameEnglish,
        nameSanskrit: asana.nameSanskrit,
        category: asana.category as any,
        difficulty: asana.difficulty,
        targetBodyParts: asana.targetBodyParts,
        svgPath: asana.svgPath || "",
        durationSeconds: asana.durationSeconds || 30,
        description: "",
        benefits: [],
      });
    }

    // Refresh recommendations after adding
    setTimeout(fetchRecommendations, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-amber-600 bg-amber-50";
    return "text-gray-600 bg-gray-50";
  };

  const getModeTitle = () => {
    switch (mode) {
      case "start":
        return "Start Your Session";
      case "cooldown":
        return "Cool Down Poses";
      default:
        return "Recommended Next";
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case "start":
        return "Great poses to begin your practice";
      case "cooldown":
        return "Gentle poses to end your session";
      default:
        return "Based on your current sequence";
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <span className="text-sm font-medium text-gray-700">
              {getModeTitle()}
            </span>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-sage-500 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <button
                key={rec.asana.id}
                onClick={() => handleAddPose(rec.asana)}
                className="w-full flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-sage-300 hover:shadow-sm transition-all text-left"
              >
                {rec.asana.svgPath && (
                  <div className="w-10 h-10 bg-gray-50 rounded-lg p-1 flex-shrink-0">
                    <Image
                      src={rec.asana.svgPath}
                      alt={rec.asana.nameEnglish}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {rec.asana.nameEnglish}
                  </p>
                  {rec.reasons[0] && (
                    <p className="text-xs text-gray-500 truncate">
                      {rec.reasons[0]}
                    </p>
                  )}
                </div>
                <Plus className="w-4 h-4 text-sage-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sage-600" />
            <h3 className="font-semibold text-gray-800">{getModeTitle()}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">{getModeDescription()}</p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sage-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="text-sage-600 hover:text-sage-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No recommendations available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.asana.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-sage-50 transition-colors group"
            >
              {/* Rank */}
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-medium text-gray-600 shadow-sm">
                {index + 1}
              </div>

              {/* Image */}
              {rec.asana.svgPath && (
                <div className="w-14 h-14 bg-white rounded-xl p-2 flex-shrink-0">
                  <Image
                    src={rec.asana.svgPath}
                    alt={rec.asana.nameEnglish}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-800">
                    {rec.asana.nameEnglish}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(
                      rec.score
                    )}`}
                  >
                    {Math.round(rec.score * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-500">{rec.asana.nameSanskrit}</p>
                {rec.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rec.reasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white rounded-full text-sage-700 border border-sage-200"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAddPose(rec.asana)}
                className="p-3 bg-sage-600 text-white rounded-xl opacity-0 group-hover:opacity-100 hover:bg-sage-700 transition-all"
                title="Add to program"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* View All Link */}
      {recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href="/"
            className="flex items-center justify-center gap-2 text-sage-600 hover:text-sage-700 font-medium text-sm"
          >
            Browse all poses
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
