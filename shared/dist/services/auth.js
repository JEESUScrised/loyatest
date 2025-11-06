import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
// Сервис для работы с авторизацией
export class AuthService {
    constructor() {
        this.token = null;
        // Загружаем токен из localStorage при инициализации
        this.token = this.getStoredToken();
        this.setupAxiosInterceptors();
    }
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    // Получение токена из localStorage
    getStoredToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }
    // Сохранение токена в localStorage
    setStoredToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }
    // Удаление токена из localStorage
    removeStoredToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }
    // Настройка axios interceptors для автоматического добавления токена
    setupAxiosInterceptors() {
        // Request interceptor - добавляем токен к каждому запросу
        axios.interceptors.request.use((config) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor - обрабатываем ошибки авторизации
        axios.interceptors.response.use((response) => response, (error) => {
            var _a;
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                // Токен недействителен, очищаем его
                this.logout();
            }
            return Promise.reject(error);
        });
    }
    // Регистрация/авторизация через Telegram
    async loginWithTelegram(credentials) {
        var _a, _b;
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/register`, credentials);
            if (response.data.success && response.data.token) {
                this.token = response.data.token;
                this.setStoredToken(response.data.token);
                return response.data;
            }
            throw new Error(response.data.message || 'Ошибка авторизации');
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Ошибка подключения к серверу');
        }
    }
    // Получение профиля пользователя
    async getProfile() {
        var _a, _b;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/user/profile`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Ошибка получения профиля');
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Ошибка подключения к серверу');
        }
    }
    // Обновление токена
    async refreshToken() {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`);
            if (response.data.success && response.data.token) {
                this.token = response.data.token;
                this.setStoredToken(response.data.token);
            }
        }
        catch (error) {
            // Если не удалось обновить токен, выходим
            this.logout();
            throw error;
        }
    }
    // Выход из системы
    logout() {
        this.token = null;
        this.removeStoredToken();
    }
    // Проверка валидности токена
    isTokenValid() {
        if (!this.token)
            return false;
        try {
            const payload = this.decodeToken(this.token);
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
        }
        catch (_a) {
            return false;
        }
    }
    // Декодирование JWT токена
    decodeToken(token) {
        if (!token) {
            throw new Error('Token is required');
        }
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''));
        return JSON.parse(jsonPayload);
    }
    // Получение текущего токена
    getToken() {
        return this.token;
    }
    // Проверка авторизации
    isAuthenticated() {
        return this.isTokenValid();
    }
}
// Экспортируем singleton instance
export const authService = AuthService.getInstance();
