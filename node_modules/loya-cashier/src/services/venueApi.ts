import { apiClient } from './apiClient';
import {
  GenerateCodeRequest,
  GenerateCodeResponse,
  VenueInfoResponse,
  VenueBalanceResponse,
} from '../types';

class VenueApi {
  // Генерация кода
  public async generateCode(data: GenerateCodeRequest): Promise<GenerateCodeResponse> {
    const response = await apiClient.post<GenerateCodeResponse>('/cashier/generate-code', {
      purchaseAmount: data.purchaseAmount,
      venueCode: data.venueCode,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка генерации кода');
  }

  // Получение информации о заведении
  public async getVenueInfo(venueCode: string): Promise<VenueInfoResponse> {
    const response = await apiClient.get<VenueInfoResponse>(`/venue/info/${venueCode}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения информации о заведении');
  }

  // Получение баланса заведения
  public async getVenueBalance(venueCode: string): Promise<VenueBalanceResponse> {
    const response = await apiClient.get<VenueBalanceResponse>(`/venue/balance/${venueCode}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения баланса заведения');
  }

  // Получение истории кодов
  public async getCodeHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get(`/cashier/codes?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения истории кодов');
  }

  // Получение статистики продаж
  public async getSalesStats(params?: {
    period?: 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get(`/cashier/stats?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения статистики продаж');
  }
}

export const venueApi = new VenueApi();

