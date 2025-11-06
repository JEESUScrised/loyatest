import { useState, useCallback } from 'react';
import { venueApi } from '../services/venueApi';
import { 
  GenerateCodeRequest,
  GenerateCodeResponse,
  VenueInfoResponse,
  VenueBalanceResponse
} from '../types';

// Хук для генерации кода
export const useGenerateCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<GenerateCodeResponse | null>(null);

  const generateCode = useCallback(async (data: GenerateCodeRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await venueApi.generateCode(data);
      setLastGeneratedCode(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка генерации кода');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLastCode = useCallback(() => {
    setLastGeneratedCode(null);
  }, []);

  return {
    generateCode,
    lastGeneratedCode,
    clearLastCode,
    isLoading,
    error
  };
};

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

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance
  };
};
