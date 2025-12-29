"use client";

import { Target, Zap, Moon, Heart, Dumbbell, Brain } from "lucide-react";

interface StepGoalsProps {
  selectedGoals: string[];
  onChange: (goals: string[]) => void;
}

const GOALS = [
  {
    id: "flexibility",
    label: "Improve Flexibility",
    icon: Target,
    description: "Increase range of motion and reduce stiffness",
  },
  {
    id: "strength",
    label: "Build Strength",
    icon: Dumbbell,
    description: "Develop muscle tone and core stability",
  },
  {
    id: "relaxation",
    label: "Relaxation & Stress Relief",
    icon: Moon,
    description: "Calm the mind and release tension",
  },
  {
    id: "energy",
    label: "Boost Energy",
    icon: Zap,
    description: "Invigorate body and increase vitality",
  },
  {
    id: "balance",
    label: "Improve Balance",
    icon: Heart,
    description: "Enhance stability and coordination",
  },
  {
    id: "mindfulness",
    label: "Mindfulness & Focus",
    icon: Brain,
    description: "Cultivate present-moment awareness",
  },
];

export default function StepGoals({ selectedGoals, onChange }: StepGoalsProps) {
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onChange(selectedGoals.filter((g) => g !== goalId));
    } else {
      onChange([...selectedGoals, goalId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          What are your goals?
        </h2>
        <p className="text-gray-500 mt-1">Select one or more goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoals.includes(goal.id);

          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-sage-500 bg-sage-50 shadow-md"
                  : "border-gray-200 hover:border-sage-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? "bg-sage-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{goal.label}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {goal.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedGoals.length === 0 && (
        <p className="text-center text-amber-600 text-sm mt-4">
          Please select at least one goal to continue
        </p>
      )}
    </div>
  );
}
