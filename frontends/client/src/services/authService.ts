import { apiClient } from './apiClient';
import { LoginCredentials, UserRole } from '../types';

export interface AuthUser {
  id: string;
  telegram_id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  access_token?: string;
  refresh_token?: string;
}

class AuthService {
  // Проверка авторизации
  public isAuthenticated(): boolean {
    return !!apiClient.getAuthToken();
  }

  // Авторизация через Telegram
  public async loginWithTelegram(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{
        user: AuthUser;
        access_token: string;
        refresh_token: string;
      }>('/auth/telegram', {
        telegramId: credentials.telegramId,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        username: credentials.username,
      });

      if (response.success && response.data) {
        // Сохраняем токен
        apiClient.setAuthToken(response.data.access_token);
        
        return {
          success: true,
          user: response.data.user,
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        };
      }

      return {
        success: false,
        message: response.message || 'Ошибка авторизации',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Ошибка авторизации',
      };
    }
  }

  // Получение профиля пользователя
  public async getProfile(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<AuthUser>('/user/profile');
      
      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Ошибка получения профиля:', error);
      return null;
    }
  }

  // Обновление токена
  public async refreshToken(): Promise<void> {
    try {
      const response = await apiClient.post<{ access_token: string }>('/auth/refresh');
      
      if (response.success && response.data) {
        apiClient.setAuthToken(response.data.access_token);
      } else {
        throw new Error('Ошибка обновления токена');
      }
    } catch (error: any) {
      this.logout();
      throw error;
    }
  }

  // Выход из системы
  public logout(): void {
    apiClient.removeAuthToken();
  }
}

export const authService = new AuthService();

