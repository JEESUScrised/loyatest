import { useState, useEffect, useCallback } from 'react';
import { venueApi } from '../services/venueApi';
import { 
  VenueInfoResponse,
  VenueBalanceResponse,
  VenueBalanceWeeklyResponse,
  VenueBalanceHourlyResponse,
  VenueStatsResponse,
  DateRangeParams
} from '../types';

// Хук для информации о заведении
export const useVenueInfo = (venueCode: string) => {
  const [venueInfo, setVenueInfo] = useState<VenueInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenueInfo = useCallback(async () => {
    if (!venueCode) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await venueApi.getVenueInfo(venueCode);
      setVenueInfo(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки информации о заведении');
    } finally {
      setIsLoading(false);
    }
  }, [venueCode]);

  useEffect(() => {
    fetchVenueInfo();
  }, [fetchVenueInfo]);

  return {
    venueInfo,
    isLoading,
    error,
    refetch: fetchVenueInfo
  };
};

// Хук для баланса заведения
export const useVenueBalance = (venueCode: string) => {
  const [balance, setBalance] = useState<VenueBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!venueCode) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await venueApi.getVenueBalance(venueCode);
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки баланса заведения');
    } finally {
      setIsLoading(false);
    }
  }, [venueCode]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance
  };
};

// Хук для недельного баланса заведения
export const useVenueBalanceWeekly = (venueCode: string, dateRange?: DateRangeParams) => {
  const [weeklyData, setWeeklyData] = useState<VenueBalanceWeeklyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyData = useCallback(async () => {
    if (!venueCode) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await venueApi.getVenueBalanceWeekly(venueCode, dateRange);
      setWeeklyData(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки недельных данных');
    } finally {
      setIsLoading(false);
    }
  }, [venueCode, dateRange]);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  return {
    weeklyData,
    isLoading,
    error,
    refetch: fetchWeeklyData
  };
};

// Хук для почасового баланса заведения
export const useVenueBalanceHourly = (venueCode: string, dateRange?: DateRangeParams) => {
  const [hourlyData, setHourlyData] = useState<VenueBalanceHourlyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHourlyData = useCallback(async () => {
    if (!venueCode) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await venueApi.getVenueBalanceHourly(venueCode, dateRange);
      setHourlyData(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки почасовых данных');
    } finally {
      setIsLoading(false);
    }
  }, [venueCode, dateRange]);

  useEffect(() => {
    fetchHourlyData();
  }, [fetchHourlyData]);

  return {
    hourlyData,
    isLoading,
    error,
    refetch: fetchHourlyData
  };
};

// Хук для статистики заведения
export const useVenueStats = (venueCode: string) => {
  const [stats, setStats] = useState<VenueStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!venueCode) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await venueApi.getVenueStats(venueCode);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки статистики заведения');
    } finally {
      setIsLoading(false);
    }
  }, [venueCode]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};
