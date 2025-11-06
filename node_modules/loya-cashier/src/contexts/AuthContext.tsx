import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  AuthContextType, 
  AuthUser, 
  UserRole,
  AuthState 
} from '../types';
import { authService } from '../services/authService';

interface CashierLoginCredentials {
  username: string;
  password: string;
}

interface CashierAuthContextType extends Omit<AuthContextType, 'login'> {
  login: (credentials: CashierLoginCredentials) => Promise<void>;
}

const AuthContext = createContext<CashierAuthContextType | undefined>(undefined);

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
  }, []);

  // Авторизация
  const login = async (credentials: CashierLoginCredentials): Promise<void> => {
    try {
      setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

      // Для кассира используем авторизацию по логину и паролю
      // Пока что создаем моковый ответ, так как authService.loginWithCredentials не существует
      const mockResponse = {
        success: true,
        user: {
          id: '1',
          username: credentials.username,
          role: UserRole.CASHIER,
          email: `${credentials.username}@cashier.loya`,
          first_name: credentials.username,
          is_active: true,
          venue_id: 'venue-1',
          venue_code: 'VKU',
          venue_name: 'Vkusno & Tochka'
        }
      };
      
      if (mockResponse.success && mockResponse.user) {
        setState({
          user: mockResponse.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Ошибка авторизации');
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

  const value: CashierAuthContextType = {
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
export const useAuth = (): CashierAuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
