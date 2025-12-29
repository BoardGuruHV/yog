"use client";

import { useState } from "react";
import {
  X,
  Target,
  Clock,
  Flame,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react";

interface GoalCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

const GOAL_TEMPLATES = [
  {
    title: "Weekly Practice",
    description: "Practice yoga 3 times this week",
    type: "frequency",
    target: 3,
    unit: "sessions",
    period: "weekly",
    icon: Calendar,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Practice Time",
    description: "Complete 150 minutes of yoga this week",
    type: "duration",
    target: 150,
    unit: "minutes",
    period: "weekly",
    icon: Clock,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Build a Streak",
    description: "Practice for 7 consecutive days",
    type: "streak",
    target: 7,
    unit: "days",
    period: null,
    icon: Flame,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "30-Day Challenge",
    description: "Practice for 30 consecutive days",
    type: "streak",
    target: 30,
    unit: "days",
    period: null,
    icon: Flame,
    color: "bg-red-100 text-red-600",
  },
];

export default function GoalCreator({
  isOpen,
  onClose,
  onGoalCreated,
}: GoalCreatorProps) {
  const [step, setStep] = useState<"templates" | "custom">("templates");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Custom goal form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("custom");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("times");
  const [period, setPeriod] = useState<string | null>(null);
  const [deadline, setDeadline] = useState("");

  const resetForm = () => {
    setStep("templates");
    setTitle("");
    setDescription("");
    setType("custom");
    setTarget("");
    setUnit("times");
    setPeriod(null);
    setDeadline("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const createGoal = async (goalData: {
    title: string;
    description?: string;
    type: string;
    target: number;
    unit: string;
    period?: string | null;
    deadline?: string | null;
  }) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        throw new Error("Failed to create goal");
      }

      onGoalCreated();
      handleClose();
    } catch (err) {
      setError("Failed to create goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: (typeof GOAL_TEMPLATES)[0]) => {
    createGoal({
      title: template.title,
      description: template.description,
      type: template.type,
      target: template.target,
      unit: template.unit,
      period: template.period,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !target) {
      setError("Please fill in all required fields");
      return;
    }

    createGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      target: parseInt(target),
      unit,
      period: period || undefined,
      deadline: deadline || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-800">
            {step === "templates" ? "Set a New Goal" : "Custom Goal"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === "templates" ? (
            <>
              {/* Template Selection */}
              <p className="text-gray-600 mb-4">
                Choose a goal template or create your own
              </p>

              <div className="space-y-3 mb-6">
                {GOAL_TEMPLATES.map((template, idx) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTemplateSelect(template)}
                      disabled={isSubmitting}
                      className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-sage-300 hover:bg-sage-50 transition-all text-left disabled:opacity-50"
                    >
                      <div className={`p-3 rounded-xl ${template.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{template.title}</p>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                      {isSubmitting && (
                        <Loader2 className="w-5 h-5 text-sage-600 animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Goal Button */}
              <button
                onClick={() => setStep("custom")}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-sage-400 hover:bg-sage-50 transition-all text-gray-600 hover:text-sage-700"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Create Custom Goal</span>
              </button>
            </>
          ) : (
            /* Custom Goal Form */
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Master Crow Pose"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about your goal..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none resize-none"
                />
              </div>

              {/* Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target *
                  </label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="10"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none bg-white"
                  >
                    <option value="times">times</option>
                    <option value="sessions">sessions</option>
                    <option value="minutes">minutes</option>
                    <option value="days">days</option>
                    <option value="hours">hours</option>
                  </select>
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat Period (optional)
                </label>
                <div className="flex gap-2">
                  {["daily", "weekly", "monthly"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(period === p ? null : p)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all capitalize ${
                        period === p
                          ? "border-sage-500 bg-sage-50 text-sage-700"
                          : "border-gray-200 text-gray-600 hover:border-sage-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep("templates")}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Create Goal
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
