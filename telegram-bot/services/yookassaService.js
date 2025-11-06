const axios = require('axios');

class YooKassaService {
  constructor() {
    this.apiKey = process.env.YOOKASSA_API_KEY;
    this.shopId = process.env.YOOKASSA_SHOP_ID;
    this.baseUrl = process.env.YOOKASSA_BASE_URL;
  }

  /**
   * Создает платеж в ЮKassa
   * @param {Object} paymentData - Данные платежа
   * @param {number} paymentData.amount - Сумма платежа
   * @param {string} paymentData.description - Описание платежа
   * @param {string} paymentData.returnUrl - URL возврата после оплаты
   * @param {Object} paymentData.metadata - Дополнительные данные
   * @returns {Promise<Object>} - Результат создания платежа
   */
  async createPayment(paymentData) {
    try {
      const idempotenceKey = this.generateIdempotenceKey();
      
      const requestBody = {
        amount: {
          value: paymentData.amount.toFixed(2),
          currency: 'RUB'
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: paymentData.returnUrl
        },
        description: paymentData.description,
        metadata: paymentData.metadata || {}
      };

      const response = await axios.post(`${this.baseUrl}/payments`, requestBody, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.shopId}:${this.apiKey}`).toString('base64')}`,
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          status: response.data.status,
          confirmation: {
            type: response.data.confirmation.type,
            confirmation_url: response.data.confirmation.confirmation_url
          }
        }
      };
    } catch (error) {
      console.error('Ошибка создания платежа ЮKassa:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Получает статус платежа
   * @param {string} paymentId - ID платежа
   * @returns {Promise<Object>} - Статус платежа
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.shopId}:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          status: response.data.status,
          amount: response.data.amount,
          created_at: response.data.created_at,
          description: response.data.description,
          metadata: response.data.metadata
        }
      };
    } catch (error) {
      console.error('Ошибка получения статуса платежа:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Генерирует уникальный ключ идемпотентности
   * @returns {string} - Ключ идемпотентности
   */
  generateIdempotenceKey() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = YooKassaService;
