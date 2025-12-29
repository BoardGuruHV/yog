"use client";

import { AlertTriangle, Target } from "lucide-react";

interface Condition {
  id: string;
  name: string;
  description: string | null;
}

interface StepConditionsProps {
  conditions: Condition[];
  selectedConditions: string[];
  focusAreas: string[];
  onConditionsChange: (conditions: string[]) => void;
  onFocusAreasChange: (areas: string[]) => void;
}

const BODY_PARTS = [
  "Hips",
  "Hamstrings",
  "Shoulders",
  "Back",
  "Core",
  "Legs",
  "Arms",
  "Neck",
  "Spine",
  "Chest",
];

export default function StepConditions({
  conditions,
  selectedConditions,
  focusAreas,
  onConditionsChange,
  onFocusAreasChange,
}: StepConditionsProps) {
  const toggleCondition = (conditionId: string) => {
    if (selectedConditions.includes(conditionId)) {
      onConditionsChange(selectedConditions.filter((c) => c !== conditionId));
    } else {
      onConditionsChange([...selectedConditions, conditionId]);
    }
  };

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      onFocusAreasChange(focusAreas.filter((a) => a !== area));
    } else {
      onFocusAreasChange([...focusAreas, area]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Personalize further
        </h2>
        <p className="text-gray-500 mt-1">
          Help us create a safe and targeted program
        </p>
      </div>

      {/* Focus Areas */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-sage-600" />
          <h3 className="font-medium text-gray-700">Focus Areas (optional)</h3>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Select specific body parts you want to focus on
        </p>
        <div className="flex flex-wrap gap-2">
          {BODY_PARTS.map((part) => (
            <button
              key={part}
              onClick={() => toggleFocusArea(part)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                focusAreas.includes(part)
                  ? "bg-sage-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {part}
            </button>
          ))}
        </div>
      </div>

      {/* Health Conditions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-medium text-gray-700">
            Health Conditions (optional)
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Select any conditions so we can avoid poses that may aggravate them
        </p>
        {conditions.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {conditions.map((condition) => (
              <button
                key={condition.id}
                onClick={() => toggleCondition(condition.id)}
                className={`p-3 rounded-lg text-left text-sm transition-all ${
                  selectedConditions.includes(condition.id)
                    ? "bg-amber-50 border-2 border-amber-400"
                    : "bg-gray-50 border-2 border-transparent hover:border-gray-200"
                }`}
              >
                <div className="font-medium text-gray-700">{condition.name}</div>
                {condition.description && (
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {condition.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No conditions available</p>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This program is for general guidance only.
          Always consult with a healthcare provider before starting any new
          exercise program, especially if you have health concerns.
        </p>
      </div>
    </div>
  );
}
