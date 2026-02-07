import apiClient from '../client';
import { ApiResponse, Program } from '@/types';

export interface ProgramsResponse {
  programs: Program[];
}

export interface CreateProgramRequest {
  name: string;
  description?: string;
  asanas: Array<{
    asanaId: string;
    duration: number;
    notes?: string;
  }>;
}

export async function getPrograms(): Promise<ApiResponse<ProgramsResponse>> {
  try {
    const response = await apiClient.get<ApiResponse<ProgramsResponse>>('/programs');
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<ProgramsResponse> };
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

export async function getProgramById(id: string): Promise<ApiResponse<Program>> {
  try {
    const response = await apiClient.get<ApiResponse<Program>>(`/programs/${id}`);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Program> } };
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

export async function createProgram(
  data: CreateProgramRequest
): Promise<ApiResponse<Program>> {
  try {
    const response = await apiClient.post<ApiResponse<Program>>('/programs', data);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Program> } };
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

export async function updateProgram(
  id: string,
  data: Partial<CreateProgramRequest>
): Promise<ApiResponse<Program>> {
  try {
    const response = await apiClient.put<ApiResponse<Program>>(`/programs/${id}`, data);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<Program> } };
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

export async function deleteProgram(
  id: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/programs/${id}`
    );
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: ApiResponse<{ success: boolean }> };
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
