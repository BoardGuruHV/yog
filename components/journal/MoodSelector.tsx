"use client";

interface MoodSelectorProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  type?: "mood" | "energy";
}

const MOOD_OPTIONS = [
  { value: 1, emoji: "😔", label: "Very Low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

const ENERGY_OPTIONS = [
  { value: 1, emoji: "🔋", label: "Exhausted", color: "bg-red-100 text-red-600" },
  { value: 2, emoji: "🔋", label: "Tired", color: "bg-orange-100 text-orange-600" },
  { value: 3, emoji: "🔋", label: "Normal", color: "bg-yellow-100 text-yellow-600" },
  { value: 4, emoji: "🔋", label: "Energized", color: "bg-lime-100 text-lime-600" },
  { value: 5, emoji: "🔋", label: "Fully Charged", color: "bg-green-100 text-green-600" },
];

export default function MoodSelector({
  label,
  value,
  onChange,
  type = "mood",
}: MoodSelectorProps) {
  const options = type === "mood" ? MOOD_OPTIONS : ENERGY_OPTIONS;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(value === option.value ? null : option.value)
            }
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
              value === option.value
                ? "border-sage-500 bg-sage-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            title={option.label}
          >
            <span className="text-xl">{option.emoji}</span>
            <span className="text-xs text-gray-500 hidden sm:block">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MoodDisplay({
  value,
  type = "mood",
  size = "md",
}: {
  value: number | null;
  type?: "mood" | "energy";
  size?: "sm" | "md";
}) {
  if (!value) return null;

  const options = type === "mood" ? MOOD_OPTIONS : ENERGY_OPTIONS;
  const option = options.find((o) => o.value === value);

  if (!option) return null;

  const sizeClasses = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <span className={sizeClasses} title={option.label}>
      {option.emoji}
    </span>
  );
}

export function EnergyBar({ value }: { value: number | null }) {
  if (!value) return null;

  const colors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-lime-400",
    "bg-green-400",
  ];

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className={`w-2 h-4 rounded-xs ${
            level <= value ? colors[value - 1] : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}
