import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { GenerateCodeResponse } from '../types';

export const useCashier = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [venueCode, setVenueCode] = useState<string>('VKU'); // По умолчанию

  // Генерация кода покупки
  const generateCode = useCallback(async (purchaseAmount: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Моковая генерация кода для демонстрации
      const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mockResponse = {
        success: true,
        data: {
          code: mockCode,
          purchaseAmount,
          venueCode,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 минут
        }
      };

      if (mockResponse.success && mockResponse.data) {
        setCurrentCode(mockResponse.data.code);
        return mockResponse.data;
      } else {
        throw new Error('Ошибка генерации кода');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка генерации кода';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [venueCode]);

  // Получение истории кодов
  const getCodeHistory = useCallback(async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/cashier/codes?${queryParams.toString()}`);

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

  // Получение статистики продаж
  const getSalesStats = useCallback(async (params?: {
    period?: 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/cashier/stats?${queryParams.toString()}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка получения статистики');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка получения статистики';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Авторизация кассира
  const authenticateCashier = useCallback(async (credentials: {
    venueCode: string;
    cashierCode: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post('/cashier/auth', credentials);

      if (response.success && response.data) {
        setVenueCode(credentials.venueCode);
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка авторизации');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка авторизации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    currentCode,
    venueCode,
    setVenueCode,
    generateCode,
    getCodeHistory,
    getSalesStats,
    authenticateCashier,
    clearError: () => setError(null),
    clearCurrentCode: () => setCurrentCode(null)
  };
};
