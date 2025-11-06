import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение статистики заведения
  const getVenueStats = useCallback(async (venueCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/venue/${venueCode}/stats`);

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

  // Получение баланса заведения
  const getVenueBalance = useCallback(async (venueCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/venue/${venueCode}/balance`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка получения баланса');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка получения баланса';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получение еженедельного отчета
  const getWeeklyReport = useCallback(async (venueCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/venue/${venueCode}/balance/weekly`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка получения отчета');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка получения отчета';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получение почасового отчета
  const getHourlyReport = useCallback(async (venueCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/venue/${venueCode}/balance/hourly`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка получения отчета');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка получения отчета';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получение информации о заведении
  const getVenueInfo = useCallback(async (venueCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/venue/${venueCode}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка получения информации');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка получения информации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getVenueStats,
    getVenueBalance,
    getWeeklyReport,
    getHourlyReport,
    getVenueInfo,
    clearError: () => setError(null)
  };
};
