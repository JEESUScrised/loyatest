// Типы для системы авторизации

export type UserRole = 'client' | 'cashier' | 'venue-admin' | 'tech-admin';

export interface AuthUser {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  role: UserRole;
  isActive: boolean;
  lastActivity?: Date;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export interface TokenPayload {
  telegramId: number;
  iat: number;
  exp: number;
}

// Типы для защищенных маршрутов
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

// Типы для контекста авторизации
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
