import axios from 'axios';
// Базовый API клиент
export class ApiClient {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Интерцептор для обработки ответов
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('API Error:', error);
            return Promise.reject(this.handleError(error));
        });
    }
    // Установка токена авторизации
    setAuthToken(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // Удаление токена авторизации
    removeAuthToken() {
        delete this.client.defaults.headers.common['Authorization'];
    }
    // GET запрос
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    // POST запрос
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    // PUT запрос
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    // DELETE запрос
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
    // Обработка ошибок
    handleError(error) {
        var _a, _b;
        if (error.response) {
            // Сервер ответил с кодом ошибки
            return {
                success: false,
                message: ((_a = error.response.data) === null || _a === void 0 ? void 0 : _a.message) || 'Ошибка сервера',
                details: (_b = error.response.data) === null || _b === void 0 ? void 0 : _b.details,
            };
        }
        else if (error.request) {
            // Запрос был отправлен, но ответа не получено
            return {
                success: false,
                message: 'Ошибка сети. Проверьте подключение к интернету.',
            };
        }
        else {
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
