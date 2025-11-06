import { apiClient } from './apiClient';
import {
  UserProfileResponse,
  UseCodeRequest,
  UseCodeResponse,
  CheckCodeRequest,
  CheckCodeResponse,
  PointsHistoryResponse,
  DailyBonusResponse,
  ReferralStatsResponse,
} from '../types';

class UserApi {
  // Получение профиля пользователя
  public async getProfile(): Promise<UserProfileResponse['data']> {
    const response = await apiClient.get<UserProfileResponse['data']>('/user/profile');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения профиля');
  }

  // Использование кода
  public async useCode(data: UseCodeRequest): Promise<UseCodeResponse> {
    const response = await apiClient.post<UseCodeResponse>('/user/use-code', {
      code: data.code,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка использования кода');
  }

  // Проверка кода
  public async checkCode(data: CheckCodeRequest): Promise<CheckCodeResponse> {
    const response = await apiClient.get<CheckCodeResponse>(`/user/check-code/${data.code}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка проверки кода');
  }

  // Получение истории баллов
  public async getPointsHistory(params?: {
    page?: number;
    limit?: number;
    venueCode?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PointsHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.venueCode) queryParams.append('venueCode', params.venueCode);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get<PointsHistoryResponse>(
      `/user/points-history?${queryParams.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения истории баллов');
  }

  // Получение ежедневного бонуса
  public async claimDailyBonus(): Promise<DailyBonusResponse> {
    const response = await apiClient.post<DailyBonusResponse>('/user/claim-daily-bonus');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения бонуса');
  }

  // Получение статистики рефералов
  public async getReferralStats(): Promise<ReferralStatsResponse> {
    const response = await apiClient.get<ReferralStatsResponse>('/user/referral-stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Ошибка получения статистики рефералов');
  }
}

export const userApi = new UserApi();

