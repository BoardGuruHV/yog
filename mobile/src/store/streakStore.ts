import { create } from "zustand";
import { Streak, PracticeLog } from "@/types";
import { getStreak, logPractice, getPracticeHistory, LogPracticeRequest } from "@/api/endpoints/streak";
import { offlineStorage } from "@/services/offline/storage";

interface StreakStore {
  streak: Streak | null;
  practiceHistory: PracticeLog[];
  isLoading: boolean;
  error: string | null;

  fetchStreak: () => Promise<void>;
  fetchPracticeHistory: () => Promise<void>;
  logPractice: (data: LogPracticeRequest) => Promise<boolean>;
}

export const useStreakStore = create<StreakStore>((set, get) => ({
  streak: null,
  practiceHistory: [],
  isLoading: false,
  error: null,

  fetchStreak: async () => {
    set({ isLoading: true, error: null });

    const response = await getStreak();

    if (response.success && response.data) {
      set({
        streak: response.data,
        isLoading: false,
      });

      // Cache for offline
      await offlineStorage.saveStreak(response.data);
    } else {
      // Try offline cache
      const cached = await offlineStorage.getStreak();
      if (cached) {
        set({ streak: cached, isLoading: false });
      } else {
        set({
          error: response.error?.message || "Failed to fetch streak",
          isLoading: false,
        });
      }
    }
  },

  fetchPracticeHistory: async () => {
    const response = await getPracticeHistory(30);

    if (response.success && response.data) {
      set({ practiceHistory: response.data.logs });
    }
  },

  logPractice: async (data: LogPracticeRequest) => {
    const response = await logPractice(data);

    if (response.success) {
      // Refresh streak after logging practice
      get().fetchStreak();
      get().fetchPracticeHistory();
      return true;
    }

    // Queue for offline sync
    await offlineStorage.addToSyncQueue("create", "practice", data);
    return false;
  },
}));
