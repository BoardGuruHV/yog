import apiClient from "../client";
import { ApiResponse, Streak, PracticeLog } from "@/types";

export async function getStreak(): Promise<ApiResponse<Streak>> {
  try {
    const response = await apiClient.get<ApiResponse<Streak>>("/streak");
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Streak> } };
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

export interface LogPracticeRequest {
  programId?: string;
  durationSeconds: number;
  notes?: string;
}

export async function logPractice(
  data: LogPracticeRequest
): Promise<ApiResponse<PracticeLog>> {
  try {
    const response = await apiClient.post<ApiResponse<PracticeLog>>("/streak", data);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<PracticeLog> } };
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

export interface PracticeHistoryResponse {
  logs: PracticeLog[];
  total: number;
}

export async function getPracticeHistory(
  limit = 30
): Promise<ApiResponse<PracticeHistoryResponse>> {
  try {
    const response = await apiClient.get<ApiResponse<PracticeHistoryResponse>>(
      `/streak/history?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<PracticeHistoryResponse> };
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
