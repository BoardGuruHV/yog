import { create } from "zustand";
import { Favorite, Asana } from "@/types";
import { getFavorites, addFavorite, removeFavorite } from "@/api/endpoints/favorites";
import { offlineStorage } from "@/services/offline/storage";

interface FavoriteStore {
  favorites: Favorite[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<void>;
  toggleFavorite: (asanaId: string, asana?: Asana) => Promise<void>;
  isFavorite: (asanaId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });

    const response = await getFavorites();

    if (response.success && response.data) {
      const ids = new Set(response.data.favorites.map((f) => f.asanaId));
      set({
        favorites: response.data.favorites,
        favoriteIds: ids,
        isLoading: false,
      });

      // Cache favorites for offline use
      await offlineStorage.saveFavorites(response.data.favorites);
    } else {
      // Try to load from offline cache
      const cached = await offlineStorage.getFavorites();
      if (cached.length > 0) {
        const ids = new Set(cached.map((f) => f.asanaId));
        set({
          favorites: cached,
          favoriteIds: ids,
          isLoading: false,
        });
      } else {
        set({
          error: response.error?.message || "Failed to fetch favorites",
          isLoading: false,
        });
      }
    }
  },

  toggleFavorite: async (asanaId: string, asana?: Asana) => {
    const { favoriteIds, favorites } = get();
    const isFav = favoriteIds.has(asanaId);

    // Optimistic update
    if (isFav) {
      const newIds = new Set(favoriteIds);
      newIds.delete(asanaId);
      set({
        favoriteIds: newIds,
        favorites: favorites.filter((f) => f.asanaId !== asanaId),
      });
    } else {
      const newIds = new Set(favoriteIds);
      newIds.add(asanaId);
      const newFavorite: Favorite = {
        id: `temp-${Date.now()}`,
        userId: "",
        asanaId,
        asana,
        createdAt: new Date().toISOString(),
      };
      set({
        favoriteIds: newIds,
        favorites: [...favorites, newFavorite],
      });
    }

    // Make API call
    const response = isFav
      ? await removeFavorite(asanaId)
      : await addFavorite(asanaId);

    if (!response.success) {
      // Revert on failure
      get().fetchFavorites();

      // Queue for offline sync if needed
      await offlineStorage.addToSyncQueue(
        isFav ? "delete" : "create",
        "favorite",
        { asanaId }
      );
    }
  },

  isFavorite: (asanaId: string) => {
    return get().favoriteIds.has(asanaId);
  },
}));
