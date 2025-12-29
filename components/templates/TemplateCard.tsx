"use client";

import Image from "next/image";
import {
  Clock,
  Star,
  Sunrise,
  Moon,
  Monitor,
  Dumbbell,
  Footprints,
  Heart,
  CloudSun,
  BedDouble,
  Activity,
  Scale,
  Sparkles,
  Expand,
  LucideIcon,
} from "lucide-react";
import { Template } from "@/types/template";

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Sunrise,
  Moon,
  Monitor,
  Dumbbell,
  Footprints,
  Heart,
  CloudSun,
  BedDouble,
  Activity,
  Scale,
  Sparkles,
  Expand,
};

const categoryColors: Record<string, string> = {
  morning: "bg-amber-100 text-amber-700",
  evening: "bg-indigo-100 text-indigo-700",
  office: "bg-blue-100 text-blue-700",
  athletic: "bg-green-100 text-green-700",
  relaxation: "bg-purple-100 text-purple-700",
  strength: "bg-red-100 text-red-700",
  flexibility: "bg-teal-100 text-teal-700",
};

const categoryLabels: Record<string, string> = {
  morning: "Morning",
  evening: "Evening",
  office: "Office",
  athletic: "Athletic",
  relaxation: "Relaxation",
  strength: "Strength",
  flexibility: "Flexibility",
};

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const Icon = iconMap[template.icon || "Activity"] || Activity;
  const categoryColor = categoryColors[template.category] || "bg-gray-100 text-gray-700";
  const categoryLabel = categoryLabels[template.category] || template.category;

  const previewAsanas = template.asanaSequence.slice(0, 4);

  return (
    <div
      onClick={() => onSelect(template)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-sage-300 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-sage-700 transition-colors">
                {template.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor}`}>
                {categoryLabel}
              </span>
            </div>
          </div>
          {template.featured && (
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Pose Preview */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          {previewAsanas.map((item, index) => (
            <div
              key={index}
              className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center"
            >
              {item.asana?.svgPath ? (
                <Image
                  src={item.asana.svgPath}
                  alt={item.asana.nameEnglish}
                  width={28}
                  height={28}
                />
              ) : (
                <span className="text-gray-300 text-sm">?</span>
              )}
            </div>
          ))}
          {template.asanaSequence.length > 4 && (
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-500">
              +{template.asanaSequence.length - 4}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              {template.duration} min
            </span>
            <span className="text-gray-600">
              {template.asanaSequence.length} poses
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= template.difficulty
                    ? "bg-sage-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1">
          {template.goals.slice(0, 3).map((goal) => (
            <span
              key={goal}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
            >
              {goal.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
