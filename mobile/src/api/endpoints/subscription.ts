import apiClient from "../client";
import { ApiResponse, Subscription, SubscriptionTier } from "@/types";

export async function getSubscription(): Promise<ApiResponse<Subscription>> {
  try {
    const response = await apiClient.get<ApiResponse<Subscription>>("/subscription");
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<Subscription> };
      };
      return (
        axiosError.response?.data || {
          success: false,
          error: { code: "NETWORK_ERROR", message: "Network request failed" },
        }
      );
    }
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Network request failed" },
    };
  }
}

// Note: In-app purchases will be handled differently on mobile
// These endpoints are for reference but actual purchase flows
// should use react-native-iap or similar
export interface CheckoutResponse {
  url: string;
}

export async function createCheckoutSession(
  tier: "PREMIUM" | "PRO",
  interval: "monthly" | "yearly" = "monthly"
): Promise<ApiResponse<CheckoutResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>(
      "/subscription/checkout",
      { tier, interval, platform: "mobile" }
    );
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<CheckoutResponse> };
      };
      return (
        axiosError.response?.data || {
          success: false,
          error: { code: "NETWORK_ERROR", message: "Network request failed" },
        }
      );
    }
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Network request failed" },
    };
  }
}

export async function cancelSubscription(): Promise<
  ApiResponse<{ success: boolean }>
> {
  try {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      "/subscription/cancel"
    );
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<{ success: boolean }> };
      };
      return (
        axiosError.response?.data || {
          success: false,
          error: { code: "NETWORK_ERROR", message: "Network request failed" },
        }
      );
    }
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Network request failed" },
    };
  }
}

export async function resumeSubscription(): Promise<
  ApiResponse<{ success: boolean }>
> {
  try {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      "/subscription/resume"
    );
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<{ success: boolean }> };
      };
      return (
        axiosError.response?.data || {
          success: false,
          error: { code: "NETWORK_ERROR", message: "Network request failed" },
        }
      );
    }
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Network request failed" },
    };
  }
}
