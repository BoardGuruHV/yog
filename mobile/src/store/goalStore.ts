import { create } from "zustand";
import { Goal } from "@/types";
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  CreateGoalRequest,
} from "@/api/endpoints/goals";

interface GoalStore {
  goals: Goal[];
  activeGoals: Goal[];
  completedGoals: Goal[];
  selectedGoal: Goal | null;
  isLoading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  fetchGoalById: (id: string) => Promise<Goal | null>;
  createGoal: (data: CreateGoalRequest) => Promise<boolean>;
  updateGoal: (id: string, data: Partial<CreateGoalRequest>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  setSelectedGoal: (goal: Goal | null) => void;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  activeGoals: [],
  completedGoals: [],
  selectedGoal: null,
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });

    const response = await getGoals();

    if (response.success && response.data) {
      const goals = response.data.goals;
      const now = new Date();

      const active = goals.filter(
        (g) => !g.completed && new Date(g.endDate) >= now
      );
      const completed = goals.filter(
        (g) => g.completed || new Date(g.endDate) < now
      );

      set({
        goals,
        activeGoals: active,
        completedGoals: completed,
        isLoading: false,
      });
    } else {
      set({
        error: response.error?.message || "Failed to fetch goals",
        isLoading: false,
      });
    }
  },

  fetchGoalById: async (id: string) => {
    const existing = get().goals.find((g) => g.id === id);
    if (existing) {
      set({ selectedGoal: existing });
      return existing;
    }

    const response = await getGoalById(id);

    if (response.success && response.data) {
      set({ selectedGoal: response.data });
      return response.data;
    }

    return null;
  },

  createGoal: async (data: CreateGoalRequest) => {
    const response = await createGoal(data);

    if (response.success) {
      get().fetchGoals();
      return true;
    }

    return false;
  },

  updateGoal: async (id: string, data) => {
    const response = await updateGoal(id, data);

    if (response.success) {
      get().fetchGoals();
      return true;
    }

    return false;
  },

  deleteGoal: async (id: string) => {
    const response = await deleteGoal(id);

    if (response.success) {
      get().fetchGoals();
      return true;
    }

    return false;
  },

  setSelectedGoal: (goal) => {
    set({ selectedGoal: goal });
  },
}));
