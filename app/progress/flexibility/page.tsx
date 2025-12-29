"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Ruler,
  Camera,
  Filter,
  X,
  Loader2,
  BarChart3,
} from "lucide-react";
import PhotoCapture from "@/components/flexibility/PhotoCapture";
import MeasurementInput from "@/components/flexibility/MeasurementInput";
import ProgressComparison from "@/components/flexibility/ProgressComparison";
import FlexibilityTimeline from "@/components/flexibility/FlexibilityTimeline";

interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  svgPath: string;
}

interface FlexibilityEntry {
  id: string;
  measurement: number | null;
  measurementType: string;
  photoPath: string | null;
  notes: string | null;
  bodyPart: string | null;
  createdAt: string;
  asana: Asana;
}

interface FlexibilityStat {
  asanaId: string;
  asanaName: string;
  totalEntries: number;
  latestMeasurement: number | null;
  firstMeasurement: number | null;
  improvement: number | null;
  measurementType: string;
  bodyPart: string | null;
}

export default function FlexibilityProgressPage() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<FlexibilityEntry[]>([]);
  const [stats, setStats] = useState<FlexibilityStat[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [asanas, setAsanas] = useState<Asana[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsana, setSelectedAsana] = useState<Asana | null>(null);
  const [filterAsana, setFilterAsana] = useState<string>("all");
  const [filterBodyPart, setFilterBodyPart] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"timeline" | "comparison" | "stats">("timeline");

  // Form state
  const [measurement, setMeasurement] = useState<number | null>(null);
  const [measurementType, setMeasurementType] = useState("reach");
  const [bodyPart, setBodyPart] = useState("");
  const [notes, setNotes] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
      fetchAsanas();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/flexibility");
      if (response.ok) {
        const data = await response.json();
        setEntries(data.logs || []);
        setStats(data.stats || []);
        setBodyParts(data.bodyParts || []);
      }
    } catch (error) {
      console.error("Error fetching flexibility data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsanas = async () => {
    try {
      const response = await fetch("/api/asanas");
      if (response.ok) {
        const data = await response.json();
        setAsanas(data.asanas || []);
      }
    } catch (error) {
      console.error("Error fetching asanas:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsana) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/flexibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asanaId: selectedAsana.id,
          measurement,
          measurementType,
          bodyPart: bodyPart || null,
          notes: notes || null,
          photoPath: photoData, // In production, you'd upload to storage first
        }),
      });

      if (response.ok) {
        await fetchData();
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error creating entry:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/flexibility?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEntries(entries.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const resetForm = () => {
    setSelectedAsana(null);
    setMeasurement(null);
    setMeasurementType("reach");
    setBodyPart("");
    setNotes("");
    setPhotoData(null);
  };

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    if (filterAsana !== "all" && entry.asana.id !== filterAsana) return false;
    if (filterBodyPart !== "all" && entry.bodyPart !== filterBodyPart)
      return false;
    return true;
  });

  // Get unique asanas from entries
  const practicedAsanaIds = Array.from(new Set(entries.map((e) => e.asana.id)));

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sage-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading your flexibility progress...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ruler className="w-8 h-8 text-sage-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Track Your Flexibility
          </h1>
          <p className="text-gray-500 mb-6">
            Sign in to track your flexibility progress with photos and measurements.
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/stats"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Flexibility Progress
              </h1>
              <p className="text-gray-500">
                Track your flexibility improvements over time
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2">
            {[
              { id: "timeline", label: "Timeline", icon: BarChart3 },
              { id: "comparison", label: "Compare", icon: Camera },
              { id: "stats", label: "Progress", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as typeof viewMode)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    viewMode === tab.id
                      ? "bg-sage-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {entries.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterAsana}
                onChange={(e) => setFilterAsana(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="all">All Poses</option>
                {practicedAsanaIds.map((id) => {
                  const entry = entries.find((e) => e.asana.id === id);
                  return (
                    <option key={id} value={id}>
                      {entry?.asana.nameEnglish}
                    </option>
                  );
                })}
              </select>
            </div>

            {bodyParts.length > 0 && (
              <select
                value={filterBodyPart}
                onChange={(e) => setFilterBodyPart(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="all">All Body Parts</option>
                {bodyParts.map((part) => (
                  <option key={part} value={part}>
                    {part.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Timeline View */}
        {viewMode === "timeline" && (
          <FlexibilityTimeline
            entries={filteredEntries}
            onDelete={handleDelete}
          />
        )}

        {/* Comparison View */}
        {viewMode === "comparison" && (
          <div className="space-y-6">
            {filterAsana !== "all" ? (
              <ProgressComparison
                entries={filteredEntries}
                asanaName={
                  entries.find((e) => e.asana.id === filterAsana)?.asana
                    .nameEnglish || ""
                }
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-gray-500">
                  Select a specific pose from the filter to compare your progress
                  photos.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats View */}
        {viewMode === "stats" && (
          <div className="space-y-4">
            {stats.length > 0 ? (
              stats.map((stat) => (
                <div
                  key={stat.asanaId}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {stat.asanaName}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {stat.totalEntries} entries
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">First</p>
                      <p className="font-medium text-gray-700">
                        {stat.firstMeasurement !== null
                          ? `${stat.firstMeasurement}${
                              stat.measurementType === "angle"
                                ? "°"
                                : stat.measurementType === "hold"
                                ? "s"
                                : "cm"
                            }`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Latest</p>
                      <p className="font-medium text-gray-700">
                        {stat.latestMeasurement !== null
                          ? `${stat.latestMeasurement}${
                              stat.measurementType === "angle"
                                ? "°"
                                : stat.measurementType === "hold"
                                ? "s"
                                : "cm"
                            }`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Improvement</p>
                      <p
                        className={`font-medium ${
                          stat.improvement === null
                            ? "text-gray-400"
                            : stat.improvement > 0
                            ? "text-green-600"
                            : stat.improvement < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {stat.improvement !== null
                          ? `${stat.improvement > 0 ? "+" : ""}${stat.improvement}${
                              stat.measurementType === "angle"
                                ? "°"
                                : stat.measurementType === "hold"
                                ? "s"
                                : "cm"
                            }`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {stat.bodyPart && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Body part:{" "}
                        {stat.bodyPart
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Progress Data Yet
                </h3>
                <p className="text-gray-500">
                  Add entries with measurements to see your progress stats.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Flexibility Entry
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {/* Pose Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Pose
                </label>
                {selectedAsana ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden">
                      <Image
                        src={selectedAsana.svgPath}
                        alt={selectedAsana.nameEnglish}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedAsana.nameEnglish}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedAsana.nameSanskrit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAsana(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <select
                    value=""
                    onChange={(e) => {
                      const asana = asanas.find((a) => a.id === e.target.value);
                      setSelectedAsana(asana || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                    required
                  >
                    <option value="">Choose a pose...</option>
                    {asanas.map((asana) => (
                      <option key={asana.id} value={asana.id}>
                        {asana.nameEnglish}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Measurement Input */}
              <MeasurementInput
                value={measurement}
                onChange={setMeasurement}
                measurementType={measurementType}
                onMeasurementTypeChange={setMeasurementType}
                bodyPart={bodyPart}
                onBodyPartChange={setBodyPart}
              />

              {/* Photo Capture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Photo (Optional)
                </label>
                <PhotoCapture
                  onCapture={setPhotoData}
                  existingPhoto={photoData || undefined}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did this feel? Any observations?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedAsana || submitting}
                className="w-full py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Entry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
