import axios from 'axios';
import type { Account, MetricsRequest, MetricsResponse, Platform } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  /**
   * Fetch available accounts for a specific platform
   */
  getAccounts: async (platform: Platform): Promise<Account[]> => {
    const response = await apiClient.get<Account[]>(`/accounts/${platform}`);
    return response.data;
  },

  /**
   * Fetch metrics for the specified account and date range
   */
  getMetrics: async (request: MetricsRequest): Promise<MetricsResponse> => {
    const response = await apiClient.post<MetricsResponse>('/metrics', request);
    return response.data;
  },
};

export default api;
