// Type definitions for the application

export enum UserRole {
  USER = 'user',
  CASHIER = 'cashier',
  VENUE_ADMIN = 'venue-admin',
  SUPER_ADMIN = 'super-admin'
}

export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  BONUS = 'bonus',
  REFERRAL = 'referral'
}

export enum CodeStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired'
}

export interface User {
  birthDate?: string | Date;
  city?: string;
  isRegistrationComplete?: boolean;
  referralCode?: string;
  id: string;
  telegram_id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface TelegramData {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface LoginCredentials {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthUser {
  id: string;
  telegram_id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string | Date;
  city?: string;
  isRegistrationComplete?: boolean;
  referralCode?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UseCodeResponse {
  code: {
    id: string;
    code: string;
    venue_id: string;
    venue_code?: string;
    venue_name?: string;
    purchase_amount: number;
    points_earned: number;
    status: string;
    expires_at?: string;
    used_at?: string;
    created_at?: string;
  };
  points_earned: number;
  new_balance: number;
}

export interface CheckCodeResponse {
  code: string;
  status: string;
  venue_name?: string;
  points_earned?: number;
  expires_at?: string;
  message?: string;
}

export interface PointsHistoryResponse {
  transactions: PointsTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  venue_id?: string;
  venue_code?: string;
  venue_name?: string;
  code_id?: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  created_at?: string;
}

export interface UserProfileResponse {
  data: {
    id: string;
    telegram_id?: number;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role: UserRole;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    last_login?: string;
    points?: {
      total_points: number;
      available_points: number;
      spent_points: number;
    };
  };
}

export interface UseCodeRequest {
  code: string;
}

export interface CheckCodeRequest {
  code: string;
}

export interface DailyBonusResponse {
  bonus_amount: number;
  new_balance: number;
}

export interface ReferralStatsResponse {
  data: {
    total_referrals: number;
    active_referrals: number;
    referral_points_earned: number;
    referral_code: string;
  };
}

