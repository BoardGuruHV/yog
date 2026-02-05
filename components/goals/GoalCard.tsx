"use client";

import { useState } from "react";
import {
  Target,
  Clock,
  Flame,
  Calendar,
  CheckCircle,
  MoreVertical,
  Trash2,
  Edit,
  Plus,
  Minus,
  Trophy,
} from "lucide-react";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: string;
  target: number;
  current: number;
  unit: string;
  period?: string;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
  percentComplete: number;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate?: (goalId: string, updates: Partial<Goal>) => void;
  onDelete?: (goalId: string) => void;
  onIncrement?: (goalId: string, amount: number) => void;
  compact?: boolean;
}

const GOAL_TYPE_CONFIG = {
  frequency: {
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  duration: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  streak: {
    icon: Flame,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  pose: {
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  custom: {
    icon: Target,
    color: "text-sage-600",
    bgColor: "bg-sage-100",
  },
};

export default function GoalCard({
  goal,
  onUpdate,
  onDelete,
  onIncrement,
  compact = false,
}: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = GOAL_TYPE_CONFIG[goal.type as keyof typeof GOAL_TYPE_CONFIG] || GOAL_TYPE_CONFIG.custom;
  const Icon = config.icon;

  const handleIncrement = async (amount: number) => {
    if (isUpdating || goal.completed) return;
    setIsUpdating(true);
    try {
      await onIncrement?.(goal.id, amount);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
          goal.completed
            ? "bg-green-50 border-green-200"
            : "bg-white border-gray-100 hover:border-sage-200"
        }`}
      >
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          {goal.completed ? (
            <Trophy className="w-4 h-4 text-green-600" />
          ) : (
            <Icon className={`w-4 h-4 ${config.color}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${goal.completed ? "text-green-700" : "text-gray-800"}`}>
            {goal.title}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  goal.completed ? "bg-green-500" : "bg-sage-500"
                }`}
                style={{ width: `${goal.percentComplete}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {goal.current}/{goal.target}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white rounded-2xl border shadow-xs p-5 transition-all ${
        goal.completed ? "border-green-200 bg-green-50/30" : "border-gray-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
            {goal.completed ? (
              <Trophy className="w-5 h-5 text-green-600" />
            ) : (
              <Icon className={`w-5 h-5 ${config.color}`} />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${goal.completed ? "text-green-700" : "text-gray-800"}`}>
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-gray-500 mt-0.5">{goal.description}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.(goal.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-800">
            {goal.current} / {goal.target} {goal.unit}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              goal.completed
                ? "bg-linear-to-r from-green-400 to-green-500"
                : "bg-linear-to-r from-sage-400 to-sage-600"
            }`}
            style={{ width: `${goal.percentComplete}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-lg font-bold ${
              goal.completed ? "text-green-600" : "text-sage-600"
            }`}
          >
            {goal.percentComplete}%
          </span>
          {goal.period && (
            <span className="text-xs text-gray-400 capitalize">{goal.period}</span>
          )}
        </div>
      </div>

      {/* Deadline */}
      {goal.deadline && !goal.completed && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span
            className={
              new Date(goal.deadline) < new Date() ? "text-red-600" : "text-gray-600"
            }
          >
            {formatDeadline(goal.deadline)}
          </span>
        </div>
      )}

      {/* Completed Badge */}
      {goal.completed && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-green-100 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-700">Goal Achieved!</p>
            {goal.completedAt && (
              <p className="text-xs text-green-600">
                Completed on {new Date(goal.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Increment Buttons */}
      {!goal.completed && goal.type === "custom" && onIncrement && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleIncrement(-1)}
            disabled={goal.current <= 0 || isUpdating}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleIncrement(1)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
