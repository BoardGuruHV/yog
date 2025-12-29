"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  Plus,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Trophy,
  Filter,
  CheckCircle,
} from "lucide-react";
import GoalCard, { Goal } from "@/components/goals/GoalCard";
import GoalCreator from "@/components/goals/GoalCreator";

type FilterType = "all" | "active" | "completed";

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [filter, setFilter] = useState<FilterType>("active");

  const fetchGoals = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === "all" || filter === "completed") {
        params.set("completed", "true");
      }

      const response = await fetch(`/api/goals?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filteredGoals = data.goals;

        if (filter === "completed") {
          filteredGoals = data.goals.filter((g: Goal) => g.completed);
        } else if (filter === "active") {
          filteredGoals = data.goals.filter((g: Goal) => !g.completed);
        }

        setGoals(filteredGoals);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  const recalculateGoals = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/goals/progress", { method: "PUT" });
      await fetchGoals();
    } catch (error) {
      console.error("Failed to recalculate goals:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/goals");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGoals();
    }
  }, [status, fetchGoals]);

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleIncrementGoal = async (goalId: string, amount: number) => {
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

        if (data.justCompleted) {
          // Could show a celebration animation here
        }
      }
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sage-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Target className="w-8 h-8" />
                Your Goals
              </h1>
              <p className="text-sage-200 mt-2">
                Set goals and track your yoga journey
              </p>
            </div>
            <button
              onClick={() => setShowCreator(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-sage-700 rounded-lg hover:bg-sage-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Goal
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & Refresh */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["active", "completed", "all"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                    filter === f
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={recalculateGoals}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sage-600 hover:bg-sage-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="text-sm">Sync Progress</span>
          </button>
        </div>

        {/* Stats Summary */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-sage-600">{goals.length}</p>
              <p className="text-sm text-gray-500">Total Goals</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{activeGoals.length}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{completedGoals.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-sage-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === "completed"
                ? "No completed goals yet"
                : "No goals set"}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "completed"
                ? "Complete some goals to see them here"
                : "Create your first goal to start tracking your progress"}
            </p>
            {filter !== "completed" && (
              <button
                onClick={() => setShowCreator(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Goal
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onIncrement={handleIncrementGoal}
              />
            ))}
          </div>
        )}

        {/* Completed Goals Section */}
        {filter === "all" && completedGoals.length > 0 && activeGoals.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Completed Goals
              </h2>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm">
                {completedGoals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Goal Creator Modal */}
      <GoalCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onGoalCreated={fetchGoals}
      />
    </div>
  );
}
