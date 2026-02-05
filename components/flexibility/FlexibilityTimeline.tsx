"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

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

interface FlexibilityTimelineProps {
  entries: FlexibilityEntry[];
  onDelete?: (id: string) => void;
  showAsanaInfo?: boolean;
}

export default function FlexibilityTimeline({
  entries,
  onDelete,
  showAsanaInfo = true,
}: FlexibilityTimelineProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      full: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
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

  const getMeasurementLabel = (type: string) => {
    switch (type) {
      case "reach":
        return "Reach";
      case "angle":
        return "Angle";
      case "hold":
        return "Hold";
      default:
        return "Value";
    }
  };

  const getBodyPartLabel = (part: string | null) => {
    if (!part) return null;
    return part.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Calculate improvement from previous entry (same asana)
  const getImprovement = (entry: FlexibilityEntry, index: number) => {
    if (entry.measurement === null) return null;

    // Find the next entry (older) for the same asana
    for (let i = index + 1; i < entries.length; i++) {
      if (
        entries[i].asana.id === entry.asana.id &&
        entries[i].measurement !== null &&
        entries[i].measurementType === entry.measurementType
      ) {
        return entry.measurement - (entries[i].measurement || 0);
      }
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">📏</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Progress Entries Yet
        </h3>
        <p className="text-gray-500 mb-4">
          Start tracking your flexibility progress by adding your first entry!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const { full: dateStr, time } = formatDate(entry.createdAt);
        const isExpanded = expandedEntries.has(entry.id);
        const improvement = getImprovement(entry, index);

        return (
          <div
            key={entry.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpanded(entry.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Asana image */}
                  {showAsanaInfo && (
                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={entry.asana.svgPath}
                        alt={entry.asana.nameEnglish}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  )}

                  <div>
                    {showAsanaInfo && (
                      <Link
                        href={`/asana/${entry.asana.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-gray-900 hover:text-sage-600"
                      >
                        {entry.asana.nameEnglish}
                      </Link>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                      <span className="text-gray-300">•</span>
                      <span>{time}</span>
                    </div>

                    {entry.bodyPart && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-sm text-xs">
                        {getBodyPartLabel(entry.bodyPart)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Measurement */}
                  {entry.measurement !== null && (
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {entry.measurement}
                        {getMeasurementUnit(entry.measurementType)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getMeasurementLabel(entry.measurementType)}
                      </div>
                    </div>
                  )}

                  {/* Improvement indicator */}
                  {improvement !== null && (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        improvement > 0
                          ? "bg-green-50 text-green-600"
                          : improvement < 0
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {improvement > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : improvement < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      <span>
                        {improvement > 0 ? "+" : ""}
                        {improvement.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Photo indicator */}
                  {entry.photoPath && (
                    <div className="text-gray-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}

                  {/* Expand/collapse */}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4 space-y-4">
                  {/* Photo */}
                  {entry.photoPath && (
                    <div className="relative aspect-video max-w-md rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={entry.photoPath}
                        alt="Progress photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{entry.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {onDelete && (
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              "Are you sure you want to delete this entry?"
                            )
                          ) {
                            onDelete(entry.id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
