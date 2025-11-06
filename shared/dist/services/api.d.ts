import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types/api-endpoints';
export declare class ApiClient {
    private client;
    private baseURL;
    constructor(baseURL?: string);
    setAuthToken(token: string): void;
    removeAuthToken(): void;
    get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    private handleError;
}
export declare const apiClient: ApiClient;
export default apiClient;
