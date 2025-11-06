import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/userApi';
import { 
  UserProfileResponse,
  UseCodeRequest,
  CheckCodeRequest,
  PointsHistoryResponse,
  DailyBonusResponse,
  ReferralStatsResponse
} from '../types';

// Хук для работы с профилем пользователя
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfileResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile
  };
};

// Хук для использования кода
export const useUseCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCode = useCallback(async (data: UseCodeRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await userApi.useCode(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка использования кода');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    useCode,
    isLoading,
    error
  };
};

// Хук для проверки кода
export const useCheckCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCode = useCallback(async (data: CheckCodeRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await userApi.checkCode(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка проверки кода');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    checkCode,
    isLoading,
    error
  };
};

// Хук для истории баллов
export const usePointsHistory = (page: number = 1, limit: number = 20) => {
  const [history, setHistory] = useState<PointsHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userApi.getPointsHistory({ page, limit });
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки истории');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory
  };
};

// Хук для ежедневного бонуса
export const useDailyBonus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimBonus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await userApi.claimDailyBonus();
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка получения бонуса');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    claimBonus,
    isLoading,
    error
  };
};

// Хук для статистики рефералов
export const useReferralStats = () => {
  const [stats, setStats] = useState<ReferralStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userApi.getReferralStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки статистики рефералов');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
