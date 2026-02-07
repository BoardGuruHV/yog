import { create } from 'zustand';
import { User, AuthState } from '@/types';
import {
  login,
  register,
  logout,
  getProfile,
  LoginRequest,
  RegisterRequest,
} from '@/api/endpoints/auth';
import { getAccessToken, authEventEmitter } from '@/api/client';

interface AuthStore extends AuthState {
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Listen for logout events from API client
  authEventEmitter.on('logout', () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (data) => {
      set({ isLoading: true });
      const response = await login(data);

      if (response.success && response.data) {
        set({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }

      set({ isLoading: false });
      return {
        success: false,
        error: response.error?.message || 'Login failed',
      };
    },

    register: async (data) => {
      set({ isLoading: true });
      const response = await register(data);

      if (response.success && response.data) {
        set({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }

      set({ isLoading: false });
      return {
        success: false,
        error: response.error?.message || 'Registration failed',
      };
    },

    logout: async () => {
      await logout();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },

    checkAuth: async () => {
      set({ isLoading: true });

      const token = await getAccessToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Try to get profile to verify token is valid
      const response = await getProfile();
      if (response.success && response.data) {
        set({
          user: response.data,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    setUser: (user) => {
      set({ user });
    },
  };
});
