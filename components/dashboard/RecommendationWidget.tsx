"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, RefreshCw, Loader2, Sun, Moon, Coffee } from "lucide-react";

interface RecommendedAsana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  svgPath: string;
  reason: string;
}

interface Recommendation {
  greeting: string;
  message: string;
  asanas: RecommendedAsana[];
  timeOfDay: "morning" | "afternoon" | "evening";
}

export default function RecommendationWidget() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRecommendation();
  }, []);

  const fetchRecommendation = async () => {
    try {
      const response = await fetch("/api/dashboard/recommendations");
      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRecommendation();
  };

  const getTimeIcon = () => {
    if (!recommendation) return Sun;
    switch (recommendation.timeOfDay) {
      case "morning":
        return Coffee;
      case "afternoon":
        return Sun;
      case "evening":
        return Moon;
      default:
        return Sun;
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

  const TimeIcon = getTimeIcon();

  // Default recommendations if none from API
  const data = recommendation || {
    greeting: "Good day!",
    message: "Here are some poses to get you started",
    asanas: [],
    timeOfDay: "afternoon" as const,
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-800">For You</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Time-based greeting */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-linear-to-r from-sage-50 to-purple-50 rounded-xl">
        <TimeIcon className="w-5 h-5 text-sage-600" />
        <div>
          <p className="font-medium text-gray-800">{data.greeting}</p>
          <p className="text-xs text-gray-500">{data.message}</p>
        </div>
      </div>

      {/* Recommended Asanas */}
      {data.asanas.length > 0 ? (
        <div className="space-y-3">
          {data.asanas.slice(0, 3).map((asana) => (
            <Link
              key={asana.id}
              href={`/asana/${asana.id}`}
              className="flex items-center gap-3 p-2 hover:bg-sage-50 rounded-lg transition-colors group"
            >
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center shrink-0">
                <Image
                  src={asana.svgPath}
                  alt={asana.nameEnglish}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{asana.nameEnglish}</p>
                <p className="text-xs text-gray-500 truncate">{asana.reason}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sage-600 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">Practice more to get personalized recommendations!</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-3 text-sage-600 hover:text-sage-700 text-sm font-medium"
          >
            Browse Asanas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* View More */}
      {data.asanas.length > 3 && (
        <Link
          href="/"
          className="mt-4 flex items-center justify-center gap-2 text-sage-600 hover:text-sage-700 text-sm font-medium"
        >
          View more recommendations
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
