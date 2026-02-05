"use client";

import { MUSCLES, ENGAGEMENT_COLORS } from "@/lib/anatomy/muscles";
import { X, Info } from "lucide-react";

interface MuscleDetailProps {
  muscleId: string;
  engagementType: "primary" | "secondary" | "stretched" | null;
  onClose: () => void;
}

export default function MuscleDetail({
  muscleId,
  engagementType,
  onClose,
}: MuscleDetailProps) {
  const muscle = MUSCLES[muscleId];

  if (!muscle) return null;

  const colors = engagementType ? ENGAGEMENT_COLORS[engagementType] : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-sm"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        {colors && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.fill, border: `2px solid ${colors.stroke}` }}
          >
            <Info className="w-5 h-5" style={{ color: colors.stroke }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{muscle.name}</h4>
          <p className="text-sm text-gray-500 mb-2">{muscle.group}</p>
          <p className="text-sm text-gray-700">{muscle.description}</p>

          {engagementType && (
            <div
              className="mt-3 px-3 py-1.5 rounded-md text-sm font-medium inline-block"
              style={{
                backgroundColor: colors?.fill,
                color: colors?.stroke,
              }}
            >
              {colors?.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
