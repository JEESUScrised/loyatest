import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { authService } from './auth';
// Базовый API клиент
class BaseApiClient {
    constructor(baseURL = API_BASE_URL) {
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
        this.api.interceptors.response.use((response) => response, (error) => {
            var _a;
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                authService.logout();
            }
            return Promise.reject(error);
        });
    }
    async handleResponse(response) {
        if (response.data.success) {
            return response.data.data;
        }
        else {
            throw new Error(response.data.message || 'API Error');
        }
    }
    async get(url, params) {
        const response = await this.api.get(url, { params });
        return this.handleResponse(response);
    }
    async post(url, data) {
        const response = await this.api.post(url, data);
        return this.handleResponse(response);
    }
    async put(url, data) {
        const response = await this.api.put(url, data);
        return this.handleResponse(response);
    }
    async delete(url) {
        const response = await this.api.delete(url);
        return this.handleResponse(response);
    }
}
// API клиент для пользователей
export class UserApiClient extends BaseApiClient {
    // Получить профиль пользователя
    async getProfile() {
        return this.get('/user/profile');
    }
    // Регистрация пользователя
    async register(data) {
        return this.post('/user/register', data);
    }
    // Использовать код
    async useCode(data) {
        return this.post('/user/use-code', data);
    }
    // Проверить код
    async checkCode(data) {
        return this.post('/user/check-code', data);
    }
    // Получить историю баллов
    async getPointsHistory(params) {
        return this.get('/user/points-history', params);
    }
    // Получить ежедневный бонус
    async claimDailyBonus() {
        return this.post('/user/claim-daily-bonus');
    }
    // Получить статистику рефералов
    async getReferralStats() {
        return this.get('/user/referral-stats');
    }
}
// API клиент для заведений
export class VenueApiClient extends BaseApiClient {
    // Создать заведение
    async createVenue(data) {
        return this.post('/venue/create', data);
    }
    // Сгенерировать код
    async generateCode(data) {
        return this.post('/venue/generate-code', data);
    }
    // Получить информацию о заведении
    async getVenueInfo(venueCode) {
        return this.get(`/venue/${venueCode}`);
    }
    // Получить баланс заведения
    async getVenueBalance(venueCode) {
        return this.get(`/venue/${venueCode}/balance`);
    }
    // Получить недельный баланс заведения
    async getVenueBalanceWeekly(venueCode, params) {
        return this.get(`/venue/${venueCode}/balance/weekly`, params);
    }
    // Получить почасовой баланс заведения
    async getVenueBalanceHourly(venueCode, params) {
        return this.get(`/venue/${venueCode}/balance/hourly`, params);
    }
    // Получить статистику заведения
    async getVenueStats(venueCode) {
        return this.get(`/venue/${venueCode}/stats`);
    }
}
// API клиент для администраторов
export class AdminApiClient extends BaseApiClient {
    // Получить дашборд администратора
    async getDashboard() {
        return this.get('/admin/dashboard');
    }
    // Получить баланс всех заведений
    async getVenuesBalance() {
        return this.get('/admin/venues/balance');
    }
    // Получить топ заведений по заработку
    async getVenuesTopEarners() {
        return this.get('/admin/venues/top-earners');
    }
    // Получить топ пользователей по тратам
    async getVenuesTopSpenders() {
        return this.get('/admin/venues/top-spenders');
    }
    // Получить сводку транзакций
    async getTransactionsSummary(params) {
        return this.get('/admin/transactions/summary', params);
    }
}
// API клиент для меню
export class MenuApiClient extends BaseApiClient {
    // Получить меню заведения
    async getMenu(venueCode) {
        return this.get(`/menu/${venueCode}`);
    }
    // Покупка товара из меню
    async purchaseItem(venueCode, itemId, data) {
        return this.post(`/menu/${venueCode}/item/${itemId}/purchase`, data);
    }
}
// API клиент для заказов
export class OrdersApiClient extends BaseApiClient {
    // Создать заказ
    async createOrder(data) {
        return this.post('/orders/create', data);
    }
    // Получить мои заказы
    async getMyOrders(params) {
        return this.get('/orders/my', params);
    }
}
// API клиент для уведомлений
export class NotificationsApiClient extends BaseApiClient {
    // Получить уведомления
    async getNotifications(params) {
        return this.get('/notifications', params);
    }
    // Отметить уведомление как прочитанное
    async markAsRead(data) {
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
