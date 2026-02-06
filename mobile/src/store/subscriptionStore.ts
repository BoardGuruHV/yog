import { create } from "zustand";
import { Subscription, SubscriptionTier, Feature, TIER_LIMITS } from "@/types";
import { getSubscription } from "@/api/endpoints/subscription";

interface SubscriptionStore {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;

  fetchSubscription: () => Promise<void>;
  hasFeature: (feature: Feature) => boolean;
  getTier: () => SubscriptionTier;
  isPremium: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,

  fetchSubscription: async () => {
    set({ isLoading: true, error: null });

    const response = await getSubscription();

    if (response.success && response.data) {
      set({
        subscription: response.data,
        isLoading: false,
      });
    } else {
      // Default to FREE tier on error
      set({
        subscription: {
          tier: "FREE",
          status: "ACTIVE",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
        isLoading: false,
      });
    }
  },

  hasFeature: (feature: Feature) => {
    const tier = get().getTier();
    const limits = TIER_LIMITS[tier];
    const value = limits[feature];
    return typeof value === "boolean" ? value : value > 0;
  },

  getTier: () => {
    const { subscription } = get();
    return subscription?.tier || "FREE";
  },

  isPremium: () => {
    const tier = get().getTier();
    return tier === "PREMIUM" || tier === "PRO";
  },
}));
