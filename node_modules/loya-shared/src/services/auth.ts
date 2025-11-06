import axios from 'axios';
import { 
  AuthUser, 
  LoginCredentials, 
  AuthResponse, 
  TokenPayload 
} from '../types/auth';
import { API_BASE_URL } from '../utils/constants';

// Сервис для работы с авторизацией
export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Загружаем токен из localStorage при инициализации
    this.token = this.getStoredToken();
    this.setupAxiosInterceptors();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Получение токена из localStorage
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Сохранение токена в localStorage
  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Удаление токена из localStorage
  private removeStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Настройка axios interceptors для автоматического добавления токена
  private setupAxiosInterceptors(): void {
    // Request interceptor - добавляем токен к каждому запросу
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - обрабатываем ошибки авторизации
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Токен недействителен, очищаем его
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Регистрация/авторизация через Telegram
  public async loginWithTelegram(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/register`, credentials);
      
      if (response.data.success && response.data.token) {
        this.token = response.data.token;
        this.setStoredToken(response.data.token);
        return response.data;
      }
      
      throw new Error(response.data.message || 'Ошибка авторизации');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка подключения к серверу');
    }
  }

  // Получение профиля пользователя
  public async getProfile(): Promise<AuthUser> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Ошибка получения профиля');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка подключения к серверу');
    }
  }

  // Обновление токена
  public async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`);
      
      if (response.data.success && response.data.token) {
        this.token = response.data.token;
        this.setStoredToken(response.data.token);
      }
    } catch (error) {
      // Если не удалось обновить токен, выходим
      this.logout();
      throw error;
    }
  }

  // Выход из системы
  public logout(): void {
    this.token = null;
    this.removeStoredToken();
  }

  // Проверка валидности токена
  public isTokenValid(): boolean {
    if (!this.token) return false;

    try {
      const payload = this.decodeToken(this.token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Декодирование JWT токена
  private decodeToken(token: string): TokenPayload {
    if (!token) {
      throw new Error('Token is required');
    }
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  // Получение текущего токена
  public getToken(): string | null {
    return this.token;
  }

  // Проверка авторизации
  public isAuthenticated(): boolean {
    return this.isTokenValid();
  }
}

// Экспортируем singleton instance
export const authService = AuthService.getInstance();
