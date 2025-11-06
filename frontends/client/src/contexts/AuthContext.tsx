import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  AuthContextType, 
  AuthUser, 
  LoginCredentials, 
  UserRole,
  AuthState 
} from '../types';
import { authService } from '../services/authService';
import { useTelegram } from '../hooks/useTelegram';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const { user: telegramUser, isReady } = useTelegram();

  // Инициализация авторизации
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

        // Проверяем, есть ли валидный токен
        if (authService.isAuthenticated()) {
          // Получаем профиль пользователя
          const user = await authService.getProfile();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else if (isReady && telegramUser) {
          // Автоматическая авторизация через Telegram
          await login({
            telegramId: telegramUser.id,
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name || '',
            username: telegramUser.username || ''
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error('Ошибка инициализации авторизации:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message || 'Ошибка авторизации'
        });
      }
    };

    initializeAuth();
  }, [isReady, telegramUser]);

  // Авторизация
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.loginWithTelegram(credentials);
      
      if (response.success && response.user) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error(response.message || 'Ошибка авторизации');
      }
    } catch (error: any) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Ошибка авторизации'
      });
      throw error;
    }
  };

  // Выход из системы
  const logout = (): void => {
    authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  // Обновление токена
  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
      const user = await authService.getProfile();
      setState((prev: AuthState) => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null
      }));
    } catch (error: any) {
      logout();
      throw error;
    }
  };

  // Проверка роли
  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  // Проверка любой из ролей
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста авторизации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
