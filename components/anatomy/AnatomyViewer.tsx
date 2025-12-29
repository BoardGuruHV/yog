"use client";

import { useState, useEffect } from "react";
import { Activity, Loader2, RotateCcw, Eye } from "lucide-react";
import BodySVG from "./BodySVG";
import AnatomyLegend, { LegendInline } from "./AnatomyLegend";
import MuscleDetail from "./MuscleDetail";

interface AnatomyData {
  id: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  stretchedMuscles: string[];
  notes: string | null;
}

interface AnatomyViewerProps {
  asanaId: string;
  asanaName: string;
  compact?: boolean;
}

export default function AnatomyViewer({
  asanaId,
  asanaName,
  compact = false,
}: AnatomyViewerProps) {
  const [anatomy, setAnatomy] = useState<AnatomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  useEffect(() => {
    fetchAnatomy();
  }, [asanaId]);

  const fetchAnatomy = async () => {
    try {
      const res = await fetch(`/api/anatomy/${asanaId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.anatomy) {
          setAnatomy(data.anatomy);
        }
      }
    } catch (error) {
      console.error("Error fetching anatomy:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementType = (muscleId: string): "primary" | "secondary" | "stretched" | null => {
    if (!anatomy) return null;
    if (anatomy.primaryMuscles.includes(muscleId)) return "primary";
    if (anatomy.secondaryMuscles.includes(muscleId)) return "secondary";
    if (anatomy.stretchedMuscles.includes(muscleId)) return "stretched";
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!anatomy) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Muscle Anatomy</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Eye className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-gray-600 text-sm">
            Anatomy diagram for <strong>{asanaName}</strong> coming soon
          </p>
        </div>
      </div>
    );
  }

  const highlightedMuscles = {
    primary: anatomy.primaryMuscles,
    secondary: anatomy.secondaryMuscles,
    stretched: anatomy.stretchedMuscles,
  };

  if (compact) {
    return (
      <div className="bg-emerald-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">Muscles Engaged</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {[...anatomy.primaryMuscles, ...anatomy.secondaryMuscles].slice(0, 5).map((m) => (
            <span
              key={m}
              className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs"
            >
              {m}
            </span>
          ))}
          {anatomy.primaryMuscles.length + anatomy.secondaryMuscles.length > 5 && (
            <span className="px-2 py-0.5 text-emerald-600 text-xs">
              +{anatomy.primaryMuscles.length + anatomy.secondaryMuscles.length - 5} more
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-emerald-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Muscle Anatomy</h3>
              <p className="text-sm text-gray-500">
                Interactive muscle engagement diagram
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveSide("front")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeSide === "front"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setActiveSide("back")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeSide === "back"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Body diagram */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100/50">
            <BodySVG
              side={activeSide}
              highlightedMuscles={highlightedMuscles}
              hoveredMuscle={hoveredMuscle}
              onMuscleHover={setHoveredMuscle}
              onMuscleClick={setSelectedMuscle}
            />

            {/* Reset button */}
            {selectedMuscle && (
              <button
                onClick={() => setSelectedMuscle(null)}
                className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Clear selection
              </button>
            )}
          </div>

          {/* Legend and details */}
          <div className="space-y-4">
            {selectedMuscle ? (
              <MuscleDetail
                muscleId={selectedMuscle}
                engagementType={getEngagementType(selectedMuscle)}
                onClose={() => setSelectedMuscle(null)}
              />
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100/50">
                <h4 className="font-medium text-gray-800 mb-3">Muscles Engaged</h4>
                <AnatomyLegend
                  primaryMuscles={anatomy.primaryMuscles}
                  secondaryMuscles={anatomy.secondaryMuscles}
                  stretchedMuscles={anatomy.stretchedMuscles}
                  hoveredMuscle={hoveredMuscle}
                  onMuscleHover={setHoveredMuscle}
                  onMuscleClick={setSelectedMuscle}
                />
              </div>
            )}

            {/* Notes */}
            {anatomy.notes && (
              <div className="bg-white/50 rounded-lg p-4 border border-emerald-100/50">
                <h4 className="font-medium text-gray-800 mb-2 text-sm">
                  Anatomical Notes
                </h4>
                <p className="text-sm text-gray-600">{anatomy.notes}</p>
              </div>
            )}

            {/* Inline legend */}
            <div className="pt-2">
              <LegendInline />
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="px-6 pb-6">
        <div className="bg-emerald-100/50 rounded-lg p-3 text-xs text-emerald-700">
          <strong>Tip:</strong> Hover over muscles on the diagram or in the legend to
          highlight them. Click for more details about each muscle group.
        </div>
      </div>
    </div>
  );
}
