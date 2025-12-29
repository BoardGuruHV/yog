"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, ArrowRight, Plus, Loader2, Trophy } from "lucide-react";
import GoalCard, { Goal } from "@/components/goals/GoalCard";

export default function GoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        // Get only active (non-completed) goals, max 3
        const activeGoals = data.goals
          .filter((g: Goal) => !g.completed)
          .slice(0, 3);
        setGoals(activeGoals);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = async (goalId: string, amount: number) => {
    try {
      const response = await fetch("/api/goals/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, increment: amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals((prev) =>
          prev.map((g) => (g.id === goalId ? data.goal : g))
        );

        // Remove completed goals from display after a delay
        if (data.justCompleted) {
          setTimeout(() => {
            setGoals((prev) => prev.filter((g) => g.id !== goalId));
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 h-full">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-sage-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-sage-600" />
          <h3 className="font-semibold text-gray-800">Your Goals</h3>
        </div>
        <Link
          href="/goals"
          className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              compact
              onIncrement={handleIncrement}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-sage-600" />
          </div>
          <p className="text-gray-600 mb-2">No active goals</p>
          <p className="text-sm text-gray-500 mb-4">
            Set goals to track your yoga progress
          </p>
          <Link
            href="/goals"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Goal
          </Link>
        </div>
      )}
    </div>
  );
}
