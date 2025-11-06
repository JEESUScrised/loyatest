import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Определяем базовый URL API
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для добавления токена авторизации
    this.instance.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor для обработки ответов
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Токен истек или невалиден
          this.removeAuthToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Установить токен авторизации
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  // Удалить токен авторизации
  public removeAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  // Проверить наличие токена
  public getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  // GET запрос
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get(url, config);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
        message: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
      };
    }
  }

  // POST запрос
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post(url, data, config);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
        message: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
      };
    }
  }

  // PUT запрос
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put(url, data, config);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
        message: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
      };
    }
  }

  // DELETE запрос
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete(url, config);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
        message: error.response?.data?.message || error.message || 'Ошибка при выполнении запроса',
      };
    }
  }
}

export const apiClient = new ApiClient();

