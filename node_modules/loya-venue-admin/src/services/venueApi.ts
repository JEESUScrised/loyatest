import { apiClient } from './apiClient';
import {
  VenueInfoResponse,
  VenueBalanceResponse,
  VenueBalanceWeeklyResponse,
  VenueBalanceHourlyResponse,
  VenueStatsResponse,
  DateRangeParams,
} from '../types';

class VenueApi {
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

  // Получение недельного баланса
  public async getVenueBalanceWeekly(venueCode: string, dateRange?: DateRangeParams): Promise<VenueBalanceWeeklyResponse> {
    const queryParams = new URLSearchParams();
    if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);

    const url = `/venue/${venueCode}/balance/weekly${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<VenueBalanceWeeklyResponse>(url);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения недельных данных');
  }

  // Получение почасового баланса
  public async getVenueBalanceHourly(venueCode: string, dateRange?: DateRangeParams): Promise<VenueBalanceHourlyResponse> {
    const queryParams = new URLSearchParams();
    if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);

    const url = `/venue/${venueCode}/balance/hourly${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<VenueBalanceHourlyResponse>(url);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения почасовых данных');
  }

  // Получение статистики заведения
  public async getVenueStats(venueCode: string): Promise<VenueStatsResponse> {
    const response = await apiClient.get<VenueStatsResponse>(`/venue/${venueCode}/stats`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения статистики заведения');
  }
}

export const venueApi = new VenueApi();

