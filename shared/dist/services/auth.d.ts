import { AuthUser, LoginCredentials, AuthResponse } from '../types/auth';
export declare class AuthService {
    private static instance;
    private token;
    private constructor();
    static getInstance(): AuthService;
    private getStoredToken;
    private setStoredToken;
    private removeStoredToken;
    private setupAxiosInterceptors;
    loginWithTelegram(credentials: LoginCredentials): Promise<AuthResponse>;
    getProfile(): Promise<AuthUser>;
    refreshToken(): Promise<void>;
    logout(): void;
    isTokenValid(): boolean;
    private decodeToken;
    getToken(): string | null;
    isAuthenticated(): boolean;
}
export declare const authService: AuthService;
