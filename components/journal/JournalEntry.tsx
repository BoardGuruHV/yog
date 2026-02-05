"use client";

import { useState } from "react";
import {
  Clock,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Play,
  Tag,
} from "lucide-react";
import { MoodDisplay, EnergyBar } from "./MoodSelector";
import Link from "next/link";

export interface PracticeLog {
  id: string;
  programId: string | null;
  programName: string | null;
  duration: number;
  moodBefore: number | null;
  moodAfter: number | null;
  energyLevel: number | null;
  notes: string | null;
  poses: string[] | null;
  tags: string[];
  createdAt: string;
}

interface JournalEntryProps {
  log: PracticeLog;
  onDelete?: (id: string) => void;
  onEdit?: (log: PracticeLog) => void;
}

export default function JournalEntry({
  log,
  onDelete,
  onEdit,
}: JournalEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${minutes}m`;
  };

  const getMoodChange = () => {
    if (!log.moodBefore || !log.moodAfter) return null;
    const diff = log.moodAfter - log.moodBefore;
    if (diff > 0) return { text: `+${diff}`, color: "text-green-600" };
    if (diff < 0) return { text: `${diff}`, color: "text-red-600" };
    return { text: "0", color: "text-gray-500" };
  };

  const moodChange = getMoodChange();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Time Indicator */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-sage-600" />
              </div>
              <div className="w-0.5 h-full bg-gray-100 mt-2" />
            </div>

            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(log.createdAt)}</span>
                <span>at</span>
                <span>{formatTime(log.createdAt)}</span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-800 mt-1">
                {log.programName || "Practice Session"}
              </h3>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatDuration(log.duration)}
                </span>

                {log.moodAfter && (
                  <div className="flex items-center gap-1">
                    <MoodDisplay value={log.moodAfter} size="sm" />
                    {moodChange && (
                      <span className={`text-xs font-medium ${moodChange.color}`}>
                        {moodChange.text}
                      </span>
                    )}
                  </div>
                )}

                {log.energyLevel && (
                  <EnergyBar value={log.energyLevel} />
                )}
              </div>

              {/* Tags */}
              {log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {log.tags.slice(0, expanded ? undefined : 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-sage-50 text-sage-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {!expanded && log.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                      +{log.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {log.programId && (
              <Link
                href={`/practice/guided/${log.programId}`}
                className="p-2 text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
                title="Practice again"
              >
                <Play className="w-4 h-4" />
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-10 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit?.(log);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete?.(log.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Notes */}
        {log.notes && (
          <div className="mt-3 ml-13">
            <p
              className={`text-sm text-gray-600 ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              {log.notes}
            </p>
          </div>
        )}

        {/* Expand Toggle */}
        {(log.notes || log.tags.length > 3) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 ml-13 text-sm text-sage-600 hover:text-sage-700"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show more
              </>
            )}
          </button>
        )}
      </div>

      {/* Mood Comparison (if expanded and both moods exist) */}
      {expanded && log.moodBefore && log.moodAfter && (
        <div className="px-4 pb-4 ml-13">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Mood Change</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">Before</p>
                <MoodDisplay value={log.moodBefore} />
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded-sm relative">
                <div
                  className={`absolute top-0 h-1 rounded ${
                    moodChange && moodChange.text.startsWith("+")
                      ? "bg-green-400"
                      : moodChange && moodChange.text.startsWith("-")
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                  style={{
                    width: `${Math.abs((log.moodAfter - log.moodBefore) / 4) * 100}%`,
                    left: log.moodAfter >= log.moodBefore ? "50%" : undefined,
                    right: log.moodAfter < log.moodBefore ? "50%" : undefined,
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">After</p>
                <MoodDisplay value={log.moodAfter} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
