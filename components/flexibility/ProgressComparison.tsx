"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FlexibilityEntry {
  id: string;
  measurement: number | null;
  measurementType: string;
  photoPath: string | null;
  notes: string | null;
  bodyPart: string | null;
  createdAt: string;
}

interface ProgressComparisonProps {
  entries: FlexibilityEntry[];
  asanaName: string;
}

export default function ProgressComparison({
  entries,
  asanaName,
}: ProgressComparisonProps) {
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(entries.length - 1);

  // Filter entries with photos
  const entriesWithPhotos = entries.filter((e) => e.photoPath);

  if (entriesWithPhotos.length < 2) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-gray-500">
          {entriesWithPhotos.length === 0
            ? "No photos to compare. Add photos to your entries to see your progress!"
            : "Add at least 2 photos to compare your progress over time."}
        </p>
      </div>
    );
  }

  const beforeEntry = entriesWithPhotos[beforeIndex];
  const afterEntry = entriesWithPhotos[afterIndex];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMeasurementUnit = (type: string) => {
    switch (type) {
      case "reach":
        return "cm";
      case "angle":
        return "°";
      case "hold":
        return "s";
      default:
        return "";
    }
  };

  const improvement =
    beforeEntry.measurement !== null && afterEntry.measurement !== null
      ? afterEntry.measurement - beforeEntry.measurement
      : null;

  const ImprovementIcon =
    improvement === null
      ? Minus
      : improvement > 0
      ? TrendingUp
      : improvement < 0
      ? TrendingDown
      : Minus;

  const improvementColor =
    improvement === null
      ? "text-gray-400"
      : improvement > 0
      ? "text-green-500"
      : improvement < 0
      ? "text-red-500"
      : "text-gray-400";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Progress Comparison</h3>
        <span className="text-sm text-gray-500">{asanaName}</span>
      </div>

      {/* Comparison View */}
      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Before</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBeforeIndex(Math.max(0, beforeIndex - 1))}
                disabled={beforeIndex === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setBeforeIndex(
                    Math.min(entriesWithPhotos.length - 2, beforeIndex + 1)
                  )
                }
                disabled={beforeIndex >= entriesWithPhotos.length - 2}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            {beforeEntry.photoPath && (
              <Image
                src={beforeEntry.photoPath}
                alt="Before photo"
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(beforeEntry.createdAt)}</span>
            </div>
            {beforeEntry.measurement !== null && (
              <div className="font-medium text-gray-900">
                {beforeEntry.measurement}
                {getMeasurementUnit(beforeEntry.measurementType)}
              </div>
            )}
          </div>
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">After</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAfterIndex(Math.max(beforeIndex + 1, afterIndex - 1))}
                disabled={afterIndex <= beforeIndex + 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setAfterIndex(
                    Math.min(entriesWithPhotos.length - 1, afterIndex + 1)
                  )
                }
                disabled={afterIndex >= entriesWithPhotos.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            {afterEntry.photoPath && (
              <Image
                src={afterEntry.photoPath}
                alt="After photo"
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(afterEntry.createdAt)}</span>
            </div>
            {afterEntry.measurement !== null && (
              <div className="font-medium text-gray-900">
                {afterEntry.measurement}
                {getMeasurementUnit(afterEntry.measurementType)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Improvement Summary */}
      {improvement !== null && (
        <div
          className={`
          flex items-center justify-center gap-2 p-3 rounded-lg
          ${improvement > 0 ? "bg-green-50" : improvement < 0 ? "bg-red-50" : "bg-gray-50"}
        `}
        >
          <ImprovementIcon className={`w-5 h-5 ${improvementColor}`} />
          <span className={`font-semibold ${improvementColor}`}>
            {improvement > 0 ? "+" : ""}
            {improvement}
            {getMeasurementUnit(afterEntry.measurementType)}
          </span>
          <span className="text-gray-500 text-sm">
            {improvement > 0
              ? "improvement"
              : improvement < 0
              ? "decrease"
              : "no change"}
          </span>
        </div>
      )}

      {/* Time span */}
      <div className="text-center text-sm text-gray-500">
        {Math.ceil(
          (new Date(afterEntry.createdAt).getTime() -
            new Date(beforeEntry.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )}{" "}
        days between photos
      </div>
    </div>
  );
}
