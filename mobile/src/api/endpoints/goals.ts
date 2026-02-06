import apiClient from "../client";
import { ApiResponse, Goal } from "@/types";

export interface GoalsResponse {
  goals: Goal[];
}

export interface CreateGoalRequest {
  type: "practice_days" | "duration_minutes" | "poses_completed";
  target: number;
  startDate: string;
  endDate: string;
}

export async function getGoals(): Promise<ApiResponse<GoalsResponse>> {
  try {
    const response = await apiClient.get<ApiResponse<GoalsResponse>>("/goals");
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<GoalsResponse> };
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

export async function getGoalById(id: string): Promise<ApiResponse<Goal>> {
  try {
    const response = await apiClient.get<ApiResponse<Goal>>(`/goals/${id}`);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Goal> } };
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

export async function createGoal(
  data: CreateGoalRequest
): Promise<ApiResponse<Goal>> {
  try {
    const response = await apiClient.post<ApiResponse<Goal>>("/goals", data);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Goal> } };
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

export async function updateGoal(
  id: string,
  data: Partial<CreateGoalRequest & { current: number }>
): Promise<ApiResponse<Goal>> {
  try {
    const response = await apiClient.put<ApiResponse<Goal>>(`/goals/${id}`, data);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Goal> } };
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

export async function deleteGoal(
  id: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/goals/${id}`
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
