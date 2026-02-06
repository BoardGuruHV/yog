import apiClient, { setTokens, clearTokens } from "../client";
import { ApiResponse, User } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/mobile/login",
      data
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      await setTokens(accessToken, refreshToken);
    }

    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<AuthResponse> } };
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

export async function register(
  data: RegisterRequest
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/mobile/register",
      data
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      await setTokens(accessToken, refreshToken);
    }

    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<AuthResponse> } };
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

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/mobile/logout");
  } catch {
    // Ignore logout errors
  } finally {
    await clearTokens();
  }
}

export async function getProfile(): Promise<ApiResponse<User>> {
  try {
    const response = await apiClient.get<ApiResponse<User>>("/profile");
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<User> } };
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

export async function updateProfile(
  data: Partial<Pick<User, "name" | "image">>
): Promise<ApiResponse<User>> {
  try {
    const response = await apiClient.put<ApiResponse<User>>("/profile", data);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: ApiResponse<User> } };
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
