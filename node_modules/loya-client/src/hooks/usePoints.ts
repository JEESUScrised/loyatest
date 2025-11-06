import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { UseCodeResponse, PointsHistoryResponse, CheckCodeResponse } from '../types';

export const usePoints = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Использование кода
  const useCode = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<UseCodeResponse>('/user/use-code', { code });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка использования кода');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка использования кода';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Проверка статуса кода
  const checkCode = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<CheckCodeResponse>(`/user/check-code/${code}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка проверки кода');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка проверки кода';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получение истории баллов
  const getPointsHistory = useCallback(async (params?: {
    page?: number;
    limit?: number;
    venueCode?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.venueCode) queryParams.append('venueCode', params.venueCode);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get<PointsHistoryResponse>(
        `/user/points-history?${queryParams.toString()}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка получения истории');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка получения истории';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получение ежедневного бонуса
  const claimDailyBonus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post('/user/claim-daily-bonus');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка получения бонуса');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка получения бонуса';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    useCode,
    checkCode,
    getPointsHistory,
    claimDailyBonus,
    clearError: () => setError(null)
  };
};
