// Type definitions for the venue-admin application

export enum UserRole {
  USER = 'user',
  CASHIER = 'cashier',
  VENUE_ADMIN = 'venue-admin',
  SUPER_ADMIN = 'super-admin'
}

export interface AuthUser {
  id: string;
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
  venue_id?: string;
  venue_code?: string;
  venue_name?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
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

export interface VenueInfoResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  points_per_rub: number;
  min_purchase_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface VenueBalanceResponse {
  totalCodesGenerated: number;
  totalCodesUsed: number;
  totalPointsEarned: number;
  totalRevenue: number;
  period: {
    start: string;
    end: string;
  };
}

export interface VenueBalanceWeeklyResponse {
  weeklyData: Array<{
    week: string;
    codesGenerated: number;
    codesUsed: number;
    pointsEarned: number;
    revenue: number;
  }>;
}

export interface VenueBalanceHourlyResponse {
  hourlyData: Array<{
    hour: string;
    codesGenerated: number;
    codesUsed: number;
    pointsEarned: number;
    revenue: number;
  }>;
}

export interface VenueStatsResponse {
  totalRevenue: number;
  totalCodesGenerated: number;
  totalCodesUsed: number;
  activeCodesCount: number;
  expiredCodesCount: number;
  averagePurchaseAmount: number;
  totalPointsEarned: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

