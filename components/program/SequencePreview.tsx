"use client";

import Image from "next/image";
import { Clock, Plus, X } from "lucide-react";

interface SequenceAsana {
  asanaId: string;
  asana: {
    id: string;
    nameEnglish: string;
    nameSanskrit: string;
    category: string;
    difficulty: number;
    svgPath: string;
  };
  duration: number;
  purpose: string;
  order: number;
}

interface SequencePreviewProps {
  title: string;
  description: string;
  sequence: SequenceAsana[];
  totalDuration: number;
  onAdd: () => void;
  onClose: () => void;
  isLoading?: boolean;
  position: "start" | "end";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function SequencePreview({
  title,
  description,
  sequence,
  totalDuration,
  onAdd,
  onClose,
  isLoading = false,
  position,
}: SequencePreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage-500 to-sage-600 text-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sage-100 text-sm mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {formatDuration(totalDuration)} total • {sequence.length} poses
          </span>
        </div>
      </div>

      {/* Sequence list */}
      <div className="max-h-64 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-sage-600 border-t-transparent rounded-full" />
          </div>
        ) : sequence.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No poses could be generated. Try adding more poses to your program.
          </p>
        ) : (
          <div className="space-y-2">
            {sequence.map((item, index) => (
              <div
                key={item.asanaId}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-400 bg-white rounded-full">
                  {index + 1}
                </span>

                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.asana.svgPath ? (
                    <Image
                      src={item.asana.svgPath}
                      alt={item.asana.nameEnglish}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="text-gray-300 text-lg">🧘</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {item.asana.nameEnglish}
                  </p>
                  <p className="text-xs text-gray-500">{item.purpose}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700">
                    {formatDuration(item.duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onAdd}
          disabled={isLoading || sequence.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Plus className="w-4 h-4" />
          Add to {position === "start" ? "Beginning" : "End"} of Program
        </button>
      </div>
    </div>
  );
}
