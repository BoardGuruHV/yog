"use client";

import { Clock, Sparkles, Check, RefreshCw } from "lucide-react";
import Image from "next/image";

interface AsanaInSequence {
  asanaId: string;
  duration: number;
  notes?: string;
  asana: {
    id: string;
    englishName: string;
    sanskritName: string;
    category: string;
    difficulty: number;
    imagePath: string | null;
  } | null;
}

interface GeneratedProgram {
  name: string;
  description: string;
  asanaSequence: AsanaInSequence[];
  totalDuration: number;
  warmupIncluded: boolean;
  cooldownIncluded: boolean;
}

interface StepPreviewProps {
  program: GeneratedProgram;
  onRegenerate: () => void;
  onSave: () => void;
  isLoading: boolean;
  isSaving: boolean;
}

export default function StepPreview({
  program,
  onRegenerate,
  onSave,
  isLoading,
  isSaving,
}: StepPreviewProps) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-full mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI Generated</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{program.name}</h2>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          {program.description}
        </p>
      </div>

      {/* Program Stats */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{program.totalDuration} minutes</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>{program.asanaSequence.length} poses</span>
        </div>
        {program.warmupIncluded && (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            <span>Warm-up</span>
          </div>
        )}
        {program.cooldownIncluded && (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            <span>Cool-down</span>
          </div>
        )}
      </div>

      {/* Pose Sequence */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium text-gray-700 mb-4">Pose Sequence</h3>
        <div className="space-y-3">
          {program.asanaSequence.map((item, index) => (
            <div
              key={`${item.asanaId}-${index}`}
              className="flex items-center gap-4 bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center text-sage-700 font-medium">
                {index + 1}
              </div>

              {item.asana?.imagePath && (
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.asana.imagePath}
                    alt={item.asana.englishName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800">
                  {item.asana?.englishName || "Unknown Pose"}
                </div>
                <div className="text-sm text-gray-500">
                  {item.asana?.sanskritName}
                  {item.notes && (
                    <span className="ml-2 text-sage-600">• {item.notes}</span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 text-sm text-gray-500">
                {formatDuration(item.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 border-2 border-sage-300 text-sage-700 rounded-xl hover:bg-sage-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Program
            </>
          )}
        </button>
      </div>
    </div>
  );
}
