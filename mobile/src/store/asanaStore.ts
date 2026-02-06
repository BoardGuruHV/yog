import { create } from "zustand";
import { Asana, FilterState, Category } from "@/types";
import { getAsanas, getAsanaById, buildFilterParams } from "@/api/endpoints/asanas";

interface AsanaStore {
  asanas: Asana[];
  selectedAsana: Asana | null;
  filters: FilterState;
  isLoading: boolean;
  hasMore: boolean;
  total: number;
  error: string | null;

  fetchAsanas: (reset?: boolean) => Promise<void>;
  fetchAsanaById: (id: string) => Promise<Asana | null>;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSelectedAsana: (asana: Asana | null) => void;
}

const initialFilters: FilterState = {
  categories: [],
  difficulty: [],
  bodyParts: [],
  search: "",
};

export const useAsanaStore = create<AsanaStore>((set, get) => ({
  asanas: [],
  selectedAsana: null,
  filters: initialFilters,
  isLoading: false,
  hasMore: true,
  total: 0,
  error: null,

  fetchAsanas: async (reset = false) => {
    const { filters, asanas } = get();

    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    const params = buildFilterParams(filters);
    params.limit = 20;
    params.offset = reset ? 0 : asanas.length;

    const response = await getAsanas(params);

    if (response.success && response.data) {
      const newAsanas = reset
        ? response.data.asanas
        : [...asanas, ...response.data.asanas];

      set({
        asanas: newAsanas,
        hasMore: response.data.hasMore,
        total: response.data.total,
        isLoading: false,
      });
    } else {
      set({
        error: response.error?.message || "Failed to fetch asanas",
        isLoading: false,
      });
    }
  },

  fetchAsanaById: async (id: string) => {
    // Check if we already have it in the list
    const existing = get().asanas.find((a) => a.id === id);
    if (existing) {
      set({ selectedAsana: existing });
      return existing;
    }

    const response = await getAsanaById(id);

    if (response.success && response.data) {
      set({ selectedAsana: response.data });
      return response.data;
    }

    return null;
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    // Refetch with new filters
    get().fetchAsanas(true);
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchAsanas(true);
  },

  setSelectedAsana: (asana) => {
    set({ selectedAsana: asana });
  },
}));
