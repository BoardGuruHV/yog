import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as Keychain from "react-native-keychain";
import { ApiResponse } from "@/types";

// API base URL - should be configured for your environment
const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api"
  : "https://yog.app/api";

// Token storage keys
const ACCESS_TOKEN_KEY = "yog_access_token";
const REFRESH_TOKEN_KEY = "yog_refresh_token";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
export async function getAccessToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ACCESS_TOKEN_KEY,
    });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_KEY,
    });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
}

export async function setTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Keychain.setGenericPassword("token", accessToken, {
    service: ACCESS_TOKEN_KEY,
  });
  await Keychain.setGenericPassword("token", refreshToken, {
    service: REFRESH_TOKEN_KEY,
  });
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_KEY });
  await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_KEY });
}

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Try to refresh the token
        const response = await axios.post<
          ApiResponse<{ accessToken: string; refreshToken: string }>
        >(`${API_BASE_URL}/auth/mobile/refresh`, {
          refreshToken,
        });

        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          await setTokens(accessToken, newRefreshToken);

          processQueue();
          return apiClient(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError);
        await clearTokens();
        // Emit event for auth store to handle logout
        authEventEmitter.emit("logout");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Simple event emitter for auth events
type AuthEventHandler = () => void;
const authEventEmitter = {
  listeners: new Map<string, AuthEventHandler[]>(),
  emit(event: string) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach((handler) => handler());
  },
  on(event: string, handler: AuthEventHandler) {
    const handlers = this.listeners.get(event) || [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
    return () => {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    };
  },
};

export { apiClient, authEventEmitter };
export default apiClient;
