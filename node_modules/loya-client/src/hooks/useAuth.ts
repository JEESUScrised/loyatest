import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { User, TelegramData, ApiResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Регистрация пользователя
  const register = useCallback(async (telegramData: TelegramData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await apiClient.post<{ userId: string; token: string }>(
        '/user/register',
        telegramData
      );

      if (response.success && response.data) {
        // Сохраняем токен
        localStorage.setItem('auth_token', response.data.token);
        apiClient.setAuthToken(response.data.token);
        
        // Получаем профиль пользователя
        await fetchProfile();
      }
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Ошибка регистрации' 
      }));
    }
  }, []);

  // Получение профиля пользователя
  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiClient.get<{ user: User; pointsInfo: any }>('/user/profile');
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error(response.message || 'Ошибка получения профиля');
      }
    } catch (error: any) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Ошибка авторизации'
      });
    }
  }, []);

  // Выход из системы
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    apiClient.removeAuthToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }, []);

  // Инициализация при загрузке
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setAuthToken(token);
      fetchProfile();
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [fetchProfile]);

  return {
    ...authState,
    register,
    logout,
    refetch: fetchProfile
  };
};
