"use client";

import { useState } from "react";
import { Ruler, RotateCw, Clock, Info } from "lucide-react";

interface MeasurementInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  measurementType: string;
  onMeasurementTypeChange: (type: string) => void;
  bodyPart: string;
  onBodyPartChange: (part: string) => void;
}

const MEASUREMENT_TYPES = [
  {
    value: "reach",
    label: "Reach Distance",
    unit: "cm",
    icon: Ruler,
    description: "How far you can reach (e.g., fingers past toes)",
  },
  {
    value: "angle",
    label: "Joint Angle",
    unit: "degrees",
    icon: RotateCw,
    description: "Angle of a joint or limb position",
  },
  {
    value: "hold",
    label: "Hold Time",
    unit: "seconds",
    icon: Clock,
    description: "How long you can hold the position",
  },
];

const BODY_PARTS = [
  { value: "hamstrings", label: "Hamstrings" },
  { value: "hips", label: "Hips" },
  { value: "shoulders", label: "Shoulders" },
  { value: "spine", label: "Spine/Back" },
  { value: "quadriceps", label: "Quadriceps" },
  { value: "calves", label: "Calves" },
  { value: "ankles", label: "Ankles" },
  { value: "wrists", label: "Wrists" },
  { value: "neck", label: "Neck" },
  { value: "full_body", label: "Full Body" },
];

export default function MeasurementInput({
  value,
  onChange,
  measurementType,
  onMeasurementTypeChange,
  bodyPart,
  onBodyPartChange,
}: MeasurementInputProps) {
  const [showInfo, setShowInfo] = useState(false);

  const currentType = MEASUREMENT_TYPES.find((t) => t.value === measurementType);
  const Icon = currentType?.icon || Ruler;

  return (
    <div className="space-y-4">
      {/* Measurement Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Measurement Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {MEASUREMENT_TYPES.map((type) => {
            const TypeIcon = type.icon;
            const isSelected = measurementType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onMeasurementTypeChange(type.value)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? "border-sage-500 bg-sage-50 text-sage-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }
                `}
              >
                <TypeIcon className="w-5 h-5" />
                <span className="text-xs font-medium">{type.label}</span>
                <span className="text-xs text-gray-400">({type.unit})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body Part Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Body Part
        </label>
        <select
          value={bodyPart}
          onChange={(e) => onBodyPartChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-sage-500"
        >
          <option value="">Select body part...</option>
          {BODY_PARTS.map((part) => (
            <option key={part.value} value={part.value}>
              {part.label}
            </option>
          ))}
        </select>
      </div>

      {/* Measurement Value Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Measurement Value
          </label>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {showInfo && currentType && (
          <div className="mb-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            {currentType.description}
          </div>
        )}

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
          <input
            type="number"
            step={measurementType === "angle" ? "1" : "0.5"}
            min="0"
            max={measurementType === "angle" ? "180" : "500"}
            value={value ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === "" ? null : parseFloat(val));
            }}
            placeholder={`Enter ${currentType?.label.toLowerCase() || "value"}`}
            className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-sage-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {currentType?.unit || "units"}
          </span>
        </div>

        {/* Quick value buttons */}
        {measurementType === "hold" && (
          <div className="mt-2 flex gap-2">
            {[30, 60, 90, 120].map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => onChange(seconds)}
                className={`
                  px-3 py-1 text-sm rounded-full border transition-colors
                  ${
                    value === seconds
                      ? "border-sage-500 bg-sage-50 text-sage-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }
                `}
              >
                {seconds}s
              </button>
            ))}
          </div>
        )}

        {measurementType === "reach" && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Tip: Measure from a reference point (e.g., floor or toes). Positive values mean you reached past the point.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
