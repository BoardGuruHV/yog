import apiClient from "../client";
import { ApiResponse, Favorite, Asana } from "@/types";

export interface FavoritesResponse {
  favorites: Favorite[];
}

export async function getFavorites(): Promise<ApiResponse<FavoritesResponse>> {
  try {
    const response = await apiClient.get<ApiResponse<FavoritesResponse>>("/favorites");
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<FavoritesResponse> };
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

export async function addFavorite(asanaId: string): Promise<ApiResponse<Favorite>> {
  try {
    const response = await apiClient.post<ApiResponse<Favorite>>("/favorites", {
      asanaId,
    });
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Favorite> } };
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

export async function removeFavorite(
  asanaId: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/favorites/${asanaId}`
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

export async function isFavorite(asanaId: string): Promise<boolean> {
  try {
    const response = await getFavorites();
    if (response.success && response.data) {
      return response.data.favorites.some((f) => f.asanaId === asanaId);
    }
    return false;
  } catch {
    return false;
  }
}
