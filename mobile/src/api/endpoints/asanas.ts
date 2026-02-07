import apiClient from '../client';
import { ApiResponse, Asana, Category, FilterState } from '@/types';

export interface AsanaListParams {
  category?: Category | Category[];
  difficulty?: number | number[];
  bodyParts?: string | string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AsanaListResponse {
  asanas: Asana[];
  total: number;
  hasMore: boolean;
}

export async function getAsanas(
  params: AsanaListParams = {}
): Promise<ApiResponse<AsanaListResponse>> {
  try {
    const queryParams = new URLSearchParams();

    if (params.category) {
      const categories = Array.isArray(params.category)
        ? params.category
        : [params.category];
      categories.forEach((c) => queryParams.append('category', c));
    }

    if (params.difficulty) {
      const difficulties = Array.isArray(params.difficulty)
        ? params.difficulty
        : [params.difficulty];
      difficulties.forEach((d) => queryParams.append('difficulty', d.toString()));
    }

    if (params.bodyParts) {
      const parts = Array.isArray(params.bodyParts)
        ? params.bodyParts
        : [params.bodyParts];
      parts.forEach((p) => queryParams.append('bodyParts', p));
    }

    if (params.search) {
      queryParams.append('search', params.search);
    }

    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const response = await apiClient.get<ApiResponse<AsanaListResponse>>(
      `/asanas?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<AsanaListResponse> };
      };
      return (
        axiosError.response?.data || {
          success: false,
          error: { code: 'NETWORK_ERROR', message: 'Network request failed' },
        }
      );
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Network request failed' },
    };
  }
}

export async function getAsanaById(id: string): Promise<ApiResponse<Asana>> {
  try {
    const response = await apiClient.get<ApiResponse<Asana>>(`/asanas/${id}`);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Asana> } };
      return (
        axiosError.response?.data || {
          success: false,
          error: { code: 'NETWORK_ERROR', message: 'Network request failed' },
        }
      );
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Network request failed' },
    };
  }
}

export function buildFilterParams(filters: FilterState): AsanaListParams {
  const params: AsanaListParams = {};

  if (filters.categories.length > 0) {
    params.category = filters.categories;
  }

  if (filters.difficulty.length > 0) {
    params.difficulty = filters.difficulty;
  }

  if (filters.bodyParts.length > 0) {
    params.bodyParts = filters.bodyParts;
  }

  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }

  return params;
}
