"use client";

import {
  Brain,
  Wind,
  Scan,
  Heart,
  Mic,
  Eye,
  Check,
  LucideIcon,
} from "lucide-react";
import { MeditationStyle, MEDITATION_STYLES } from "@/types/meditation";

interface MeditationPickerProps {
  selected: MeditationStyle | null;
  onSelect: (style: MeditationStyle) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Wind,
  Scan,
  Heart,
  Mic,
  Eye,
};

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-600",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-300",
    text: "text-cyan-600",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-600",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-300",
    text: "text-pink-600",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-600",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-600",
  },
};

export default function MeditationPicker({
  selected,
  onSelect,
}: MeditationPickerProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Choose Your Practice
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MEDITATION_STYLES.map((style) => {
          const Icon = iconMap[style.icon] || Brain;
          const colors = colorClasses[style.color] || colorClasses.purple;
          const isSelected = selected?.id === style.id;

          return (
            <button
              key={style.id}
              onClick={() => onSelect(style)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-${style.color}-400`
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-full ${colors.text} bg-white flex items-center justify-center`}
                >
                  <Check className="w-3 h-3" />
                </div>
              )}

              <div
                className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center mb-3`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{style.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {style.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {style.benefits.slice(0, 2).map((benefit) => (
                  <span
                    key={benefit}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
