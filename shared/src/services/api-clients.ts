import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { authService } from './auth';
import {
  // User API types
  UserProfileResponse,
  UserRegisterRequest,
  UserRegisterResponse,
  UseCodeRequest,
  UseCodeResponse,
  CheckCodeRequest,
  CheckCodeResponse,
  PointsHistoryResponse,
  DailyBonusResponse,
  ReferralStatsResponse,
  
  // Venue API types
  CreateVenueRequest,
  CreateVenueResponse,
  GenerateCodeRequest,
  GenerateCodeResponse,
  VenueInfoResponse,
  VenueBalanceResponse,
  VenueBalanceWeeklyResponse,
  VenueBalanceHourlyResponse,
  VenueStatsResponse,
  
  // Admin API types
  AdminDashboardResponse,
  AdminVenuesBalanceResponse,
  AdminVenuesTopEarnersResponse,
  AdminVenuesTopSpendersResponse,
  AdminTransactionsSummaryResponse,
  
  // Menu API types
  MenuResponse,
  MenuItemPurchaseRequest,
  MenuItemPurchaseResponse,
  
  // Orders API types
  CreateOrderRequest,
  CreateOrderResponse,
  MyOrdersResponse,
  
  // Notifications API types
  NotificationsResponse,
  MarkNotificationReadRequest,
  MarkNotificationReadResponse,
  
  // Common types
  PaginationParams,
  DateRangeParams,
  ApiResponse
} from '../types/api-endpoints';

// Базовый API клиент
class BaseApiClient {
  protected api: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен авторизации к каждому запросу
    this.api.interceptors.request.use((config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Обрабатываем ошибки авторизации
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  protected async handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): Promise<T> {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'API Error');
    }
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, { params });
    return this.handleResponse(response);
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data);
    return this.handleResponse(response);
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data);
    return this.handleResponse(response);
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url);
    return this.handleResponse(response);
  }
}

// API клиент для пользователей
export class UserApiClient extends BaseApiClient {
  // Получить профиль пользователя
  async getProfile(): Promise<UserProfileResponse['data']> {
    return this.get('/user/profile');
  }

  // Регистрация пользователя
  async register(data: UserRegisterRequest): Promise<UserRegisterResponse> {
    return this.post('/user/register', data);
  }

  // Использовать код
  async useCode(data: UseCodeRequest): Promise<UseCodeResponse['data']> {
    return this.post('/user/use-code', data);
  }

  // Проверить код
  async checkCode(data: CheckCodeRequest): Promise<CheckCodeResponse['data']> {
    return this.post('/user/check-code', data);
  }

  // Получить историю баллов
  async getPointsHistory(params?: PaginationParams): Promise<PointsHistoryResponse['data']> {
    return this.get('/user/points-history', params);
  }

  // Получить ежедневный бонус
  async claimDailyBonus(): Promise<DailyBonusResponse['data']> {
    return this.post('/user/claim-daily-bonus');
  }

  // Получить статистику рефералов
  async getReferralStats(): Promise<ReferralStatsResponse['data']> {
    return this.get('/user/referral-stats');
  }
}

// API клиент для заведений
export class VenueApiClient extends BaseApiClient {
  // Создать заведение
  async createVenue(data: CreateVenueRequest): Promise<CreateVenueResponse['data']> {
    return this.post('/venue/create', data);
  }

  // Сгенерировать код
  async generateCode(data: GenerateCodeRequest): Promise<GenerateCodeResponse['data']> {
    return this.post('/venue/generate-code', data);
  }

  // Получить информацию о заведении
  async getVenueInfo(venueCode: string): Promise<VenueInfoResponse['data']> {
    return this.get(`/venue/${venueCode}`);
  }

  // Получить баланс заведения
  async getVenueBalance(venueCode: string): Promise<VenueBalanceResponse['data']> {
    return this.get(`/venue/${venueCode}/balance`);
  }

  // Получить недельный баланс заведения
  async getVenueBalanceWeekly(venueCode: string, params?: DateRangeParams): Promise<VenueBalanceWeeklyResponse['data']> {
    return this.get(`/venue/${venueCode}/balance/weekly`, params);
  }

  // Получить почасовой баланс заведения
  async getVenueBalanceHourly(venueCode: string, params?: DateRangeParams): Promise<VenueBalanceHourlyResponse['data']> {
    return this.get(`/venue/${venueCode}/balance/hourly`, params);
  }

  // Получить статистику заведения
  async getVenueStats(venueCode: string): Promise<VenueStatsResponse['data']> {
    return this.get(`/venue/${venueCode}/stats`);
  }
}

// API клиент для администраторов
export class AdminApiClient extends BaseApiClient {
  // Получить дашборд администратора
  async getDashboard(): Promise<AdminDashboardResponse['data']> {
    return this.get('/admin/dashboard');
  }

  // Получить баланс всех заведений
  async getVenuesBalance(): Promise<AdminVenuesBalanceResponse['data']> {
    return this.get('/admin/venues/balance');
  }

  // Получить топ заведений по заработку
  async getVenuesTopEarners(): Promise<AdminVenuesTopEarnersResponse['data']> {
    return this.get('/admin/venues/top-earners');
  }

  // Получить топ пользователей по тратам
  async getVenuesTopSpenders(): Promise<AdminVenuesTopSpendersResponse['data']> {
    return this.get('/admin/venues/top-spenders');
  }

  // Получить сводку транзакций
  async getTransactionsSummary(params?: DateRangeParams): Promise<AdminTransactionsSummaryResponse['data']> {
    return this.get('/admin/transactions/summary', params);
  }
}

// API клиент для меню
export class MenuApiClient extends BaseApiClient {
  // Получить меню заведения
  async getMenu(venueCode: string): Promise<MenuResponse['data']> {
    return this.get(`/menu/${venueCode}`);
  }

  // Покупка товара из меню
  async purchaseItem(venueCode: string, itemId: string, data: MenuItemPurchaseRequest): Promise<MenuItemPurchaseResponse['data']> {
    return this.post(`/menu/${venueCode}/item/${itemId}/purchase`, data);
  }
}

// API клиент для заказов
export class OrdersApiClient extends BaseApiClient {
  // Создать заказ
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse['data']> {
    return this.post('/orders/create', data);
  }

  // Получить мои заказы
  async getMyOrders(params?: PaginationParams): Promise<MyOrdersResponse['data']> {
    return this.get('/orders/my', params);
  }
}

// API клиент для уведомлений
export class NotificationsApiClient extends BaseApiClient {
  // Получить уведомления
  async getNotifications(params?: PaginationParams): Promise<NotificationsResponse['data']> {
    return this.get('/notifications', params);
  }

  // Отметить уведомление как прочитанное
  async markAsRead(data: MarkNotificationReadRequest): Promise<MarkNotificationReadResponse> {
    return this.post('/notifications/mark-read', data);
  }
}

// Экспортируем singleton instances
export const userApi = new UserApiClient();
export const venueApi = new VenueApiClient();
export const adminApi = new AdminApiClient();
export const menuApi = new MenuApiClient();
export const ordersApi = new OrdersApiClient();
export const notificationsApi = new NotificationsApiClient();
