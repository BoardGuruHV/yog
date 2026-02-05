"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProgram } from "@/context/ProgramContext";
import { Asana } from "@/types";
import { Template } from "@/types/template";
import {
  X,
  Clock,
  Copy,
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

interface TemplateDetailProps {
  template: Template;
  onClose: () => void;
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
  morning: "from-amber-500 to-orange-500",
  evening: "from-indigo-500 to-purple-500",
  office: "from-blue-500 to-cyan-500",
  athletic: "from-green-500 to-emerald-500",
  relaxation: "from-purple-500 to-pink-500",
  strength: "from-red-500 to-orange-500",
  flexibility: "from-teal-500 to-cyan-500",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TemplateDetail({ template, onClose }: TemplateDetailProps) {
  const router = useRouter();
  const { clearProgram, addAsana, updateName, updateDescription } = useProgram();
  const Icon = iconMap[template.icon || "Activity"] || Activity;
  const gradientColors = categoryColors[template.category] || "from-gray-500 to-gray-600";

  const handleUseTemplate = async () => {
    // Track usage
    try {
      await fetch(`/api/templates/${template.id}`, { method: "POST" });
    } catch (e) {
      console.error("Error tracking template usage:", e);
    }

    // Clear current program and add template poses
    clearProgram();
    updateName(template.name);
    updateDescription(template.description);

    // Add each asana from the template
    for (const item of template.asanaSequence) {
      if (item.asana) {
        // Cast to Asana type since the API returns all required fields
        addAsana(item.asana as unknown as Asana);
      }
    }

    // Navigate to program builder
    router.push("/program");
    onClose();
  };

  const totalDurationSeconds = template.asanaSequence.reduce(
    (sum, item) => sum + item.duration,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-linear-to-r ${gradientColors} text-white p-6`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{template.name}</h2>
                {template.featured && (
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                )}
              </div>
              <p className="text-white/80 mt-1">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {template.duration} minutes
            </span>
            <span>{template.asanaSequence.length} poses</span>
            <div className="flex items-center gap-1">
              <span className="text-sm mr-1">Difficulty:</span>
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= template.difficulty
                      ? "bg-white"
                      : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {/* Goals */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Goals</h3>
            <div className="flex flex-wrap gap-2">
              {template.goals.map((goal) => (
                <span
                  key={goal}
                  className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm"
                >
                  {goal.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Sequence */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Sequence ({formatDuration(totalDurationSeconds)} total)
            </h3>
            <div className="space-y-2">
              {template.asanaSequence.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-400 bg-white rounded-full">
                    {index + 1}
                  </span>

                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                    {item.asana?.svgPath ? (
                      <Image
                        src={item.asana.svgPath}
                        alt={item.asana.nameEnglish}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <span className="text-gray-300 text-lg">?</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {item.asana?.nameEnglish || "Unknown Pose"}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-500 truncate">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-700">
                      {formatDuration(item.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUseTemplate}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors font-medium"
          >
            <Copy className="w-4 h-4" />
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}
