"use client";

import { X } from "lucide-react";

interface TopPose {
  id: string;
  name: string;
  count: number;
}

interface BodyPartProps {
  id: string;
  label: string;
  practiceCount: number;
  percentage: number;
  intensity: number;
  lastPracticed: string | null;
  topPoses: TopPose[];
  onClose: () => void;
}

export default function BodyPart({
  label,
  practiceCount,
  percentage,
  intensity,
  lastPracticed,
  topPoses,
  onClose,
}: BodyPartProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity === 0) return "Not practiced";
    if (intensity < 20) return "Light focus";
    if (intensity < 40) return "Moderate focus";
    if (intensity < 60) return "Good focus";
    if (intensity < 80) return "Strong focus";
    return "Primary focus";
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-gray-100 text-gray-500";
    if (intensity < 20) return "bg-green-100 text-green-700";
    if (intensity < 40) return "bg-green-200 text-green-700";
    if (intensity < 60) return "bg-green-300 text-green-800";
    if (intensity < 80) return "bg-green-400 text-green-900";
    return "bg-green-500 text-white";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Intensity Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(
              intensity
            )}`}
          >
            {getIntensityLabel(intensity)}
          </span>
          <span className="text-sm text-gray-500">{intensity}% intensity</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Practices</p>
            <p className="text-lg font-semibold text-gray-900">{practiceCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Share</p>
            <p className="text-lg font-semibold text-gray-900">{percentage}%</p>
          </div>
        </div>

        {/* Last Practiced */}
        <div>
          <p className="text-sm text-gray-500">Last practiced</p>
          <p className="font-medium text-gray-700">{formatDate(lastPracticed)}</p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Focus level</span>
            <span>{intensity}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${intensity}%` }}
            />
          </div>
        </div>

        {/* Top Poses */}
        {topPoses.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Top poses for this area</p>
            <div className="space-y-2">
              {topPoses.map((pose, index) => (
                <div
                  key={pose.id + index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">{pose.name}</span>
                  <span className="text-gray-500">{pose.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
