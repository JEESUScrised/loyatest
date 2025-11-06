import axios from 'axios';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types/api-endpoints';

// Базовый API клиент
export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Интерцептор для обработки ответов
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Установка токена авторизации
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Удаление токена авторизации
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // GET запрос
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // POST запрос
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PUT запрос
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // DELETE запрос
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Обработка ошибок
  private handleError(error: any): ApiError {
    if (error.response) {
      // Сервер ответил с кодом ошибки
      return {
        success: false,
        message: error.response.data?.message || 'Ошибка сервера',
        details: error.response.data?.details,
      };
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      return {
        success: false,
        message: 'Ошибка сети. Проверьте подключение к интернету.',
      };
    } else {
      // Что-то пошло не так при настройке запроса
      return {
        success: false,
        message: error.message || 'Неизвестная ошибка',
      };
    }
  }
}

// Создание экземпляра API клиента
export const apiClient = new ApiClient();

// Экспорт для использования в других модулях
export default apiClient;
