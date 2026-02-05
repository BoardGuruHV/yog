"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, RefreshCw } from "lucide-react";
import Link from "next/link";
import BodyMap from "@/components/bodymap/BodyMap";

interface TopPose {
  id: string;
  name: string;
  count: number;
}

interface BodyPartData {
  id: string;
  label: string;
  side: string;
  practiceCount: number;
  percentage: number;
  intensity: number;
  lastPracticed: string | null;
  topPoses: TopPose[];
}

interface BodyMapData {
  totalPractices: number;
  bodyParts: Record<string, BodyPartData>;
  balanceScore: number;
  frontFocus: number;
  backFocus: number;
  recommendations: string[];
}

export default function BodyMapPage() {
  const [data, setData] = useState<BodyMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bodymap?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch body map data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  const timeRanges = [
    { label: "7 days", value: 7 },
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
    { label: "All time", value: 365 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/progress"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Body Focus Map
                </h1>
                <p className="text-sm text-gray-500">
                  Visualize which body parts you've been targeting
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
        {/* Time Range Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Time Range:</span>
            </div>
            <div className="flex gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDays(range.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    days === range.value
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Loading body map data...</p>
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

        {/* Body Map */}
        {data && !loading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <BodyMap
              bodyParts={data.bodyParts}
              totalPractices={data.totalPractices}
              balanceScore={data.balanceScore}
              frontFocus={data.frontFocus}
              backFocus={data.backFocus}
              recommendations={data.recommendations}
            />
          </div>
        )}

        {/* Empty State */}
        {data && data.totalPractices === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center mt-6">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧘</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Practice Data Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start practicing yoga poses to see which body parts you're
                focusing on. Your body map will fill in as you practice.
              </p>
              <Link
                href="/programs"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start a Practice Session
              </Link>
            </div>
          </div>
        )}

        {/* Body Part List */}
        {data && data.totalPractices > 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Body Parts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(data.bodyParts)
                .sort((a, b) => b.intensity - a.intensity)
                .map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{
                          backgroundColor:
                            part.intensity === 0
                              ? "#e5e7eb"
                              : part.intensity < 20
                                ? "#dcfce7"
                                : part.intensity < 40
                                  ? "#bbf7d0"
                                  : part.intensity < 60
                                    ? "#86efac"
                                    : part.intensity < 80
                                      ? "#4ade80"
                                      : "#22c55e",
                        }}
                      />
                      <span className="font-medium text-gray-700">
                        {part.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {part.intensity}%
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({part.practiceCount} practices)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
