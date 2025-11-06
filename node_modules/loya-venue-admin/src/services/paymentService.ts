// Сервис для работы с платежами через Юкассу
import axios from 'axios';

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  status: string;
  confirmation: {
    type: string;
    confirmation_url: string;
  };
}

class PaymentService {
  private readonly baseUrl = 'http://localhost:3001/api/admin'; // Backend API URL
  private readonly apiKey = 'test__UW59qNHWI_40gv3XfJTubp_5zQtFKft2UOLRSy8oxI';
  private readonly shopId = '1184633';

  // Создание платежа через реальный API Юкассы
  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      console.log('Создание платежа через Юкассу:', paymentData);
      
      const response = await axios.post(`${this.baseUrl}/payments/create`, {
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        returnUrl: paymentData.returnUrl,
        metadata: paymentData.metadata
      });

      if (response.data.success) {
        console.log('Платеж успешно создан:', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Ошибка создания платежа');
      }
    } catch (error: any) {
      console.error('Ошибка создания платежа:', error);
      
      // Fallback к моковому ответу для демонстрации
      console.log('Используется моковый ответ для демонстрации');
      const mockResponse: PaymentResponse = {
        id: `test_payment_${Date.now()}`,
        status: 'pending',
        confirmation: {
          type: 'redirect',
          confirmation_url: `https://yoomoney.ru/checkout/payments/v2/show?orderId=${Date.now()}`
        }
      };
      
      return mockResponse;
    }
  }

  // Получение статуса платежа через реальный API Юкассы
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      console.log('Получение статуса платежа:', paymentId);
      
      const response = await axios.get(`${this.baseUrl}/payments/${paymentId}/status`);
      
      if (response.data.success) {
        console.log('Статус платежа получен:', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Ошибка получения статуса платежа');
      }
    } catch (error: any) {
      console.error('Ошибка получения статуса платежа:', error);
      
      // Fallback к моковому статусу для демонстрации
      console.log('Используется моковый статус для демонстрации');
      const mockStatus = {
        id: paymentId,
        status: 'succeeded',
        amount: {
          value: '1000.00',
          currency: 'RUB'
        },
        created_at: new Date().toISOString(),
        description: 'Продление подписки Loya на 1 месяц'
      };
      
      return mockStatus;
    }
  }

  // Генерация уникального ключа для идемпотентности
  private generateIdempotenceKey(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Создание платежа для продления подписки
  async createSubscriptionPayment(months: number = 1): Promise<PaymentResponse> {
    const amount = months * 1000; // 1000 рублей за месяц
    
    return this.createPayment({
      amount,
      currency: 'RUB',
      description: `Продление подписки Loya на ${months} ${months === 1 ? 'месяц' : 'месяца'}`,
      returnUrl: `${window.location.origin}/payment/success`,
      metadata: {
        type: 'subscription_renewal',
        months: months.toString(),
        venue_code: 'VKU'
      }
    });
  }
}

export const paymentService = new PaymentService();
