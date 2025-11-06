import { AxiosInstance, AxiosResponse } from 'axios';
import { UserProfileResponse, UserRegisterRequest, UserRegisterResponse, UseCodeRequest, UseCodeResponse, CheckCodeRequest, CheckCodeResponse, PointsHistoryResponse, DailyBonusResponse, ReferralStatsResponse, CreateVenueRequest, CreateVenueResponse, GenerateCodeRequest, GenerateCodeResponse, VenueInfoResponse, VenueBalanceResponse, VenueBalanceWeeklyResponse, VenueBalanceHourlyResponse, VenueStatsResponse, AdminDashboardResponse, AdminVenuesBalanceResponse, AdminVenuesTopEarnersResponse, AdminVenuesTopSpendersResponse, AdminTransactionsSummaryResponse, MenuResponse, MenuItemPurchaseRequest, MenuItemPurchaseResponse, CreateOrderRequest, CreateOrderResponse, MyOrdersResponse, NotificationsResponse, MarkNotificationReadRequest, MarkNotificationReadResponse, PaginationParams, DateRangeParams, ApiResponse } from '../types/api-endpoints';
declare class BaseApiClient {
    protected api: AxiosInstance;
    constructor(baseURL?: string);
    protected handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): Promise<T>;
    protected get<T>(url: string, params?: any): Promise<T>;
    protected post<T>(url: string, data?: any): Promise<T>;
    protected put<T>(url: string, data?: any): Promise<T>;
    protected delete<T>(url: string): Promise<T>;
}
export declare class UserApiClient extends BaseApiClient {
    getProfile(): Promise<UserProfileResponse['data']>;
    register(data: UserRegisterRequest): Promise<UserRegisterResponse>;
    useCode(data: UseCodeRequest): Promise<UseCodeResponse['data']>;
    checkCode(data: CheckCodeRequest): Promise<CheckCodeResponse['data']>;
    getPointsHistory(params?: PaginationParams): Promise<PointsHistoryResponse['data']>;
    claimDailyBonus(): Promise<DailyBonusResponse['data']>;
    getReferralStats(): Promise<ReferralStatsResponse['data']>;
}
export declare class VenueApiClient extends BaseApiClient {
    createVenue(data: CreateVenueRequest): Promise<CreateVenueResponse['data']>;
    generateCode(data: GenerateCodeRequest): Promise<GenerateCodeResponse['data']>;
    getVenueInfo(venueCode: string): Promise<VenueInfoResponse['data']>;
    getVenueBalance(venueCode: string): Promise<VenueBalanceResponse['data']>;
    getVenueBalanceWeekly(venueCode: string, params?: DateRangeParams): Promise<VenueBalanceWeeklyResponse['data']>;
    getVenueBalanceHourly(venueCode: string, params?: DateRangeParams): Promise<VenueBalanceHourlyResponse['data']>;
    getVenueStats(venueCode: string): Promise<VenueStatsResponse['data']>;
}
export declare class AdminApiClient extends BaseApiClient {
    getDashboard(): Promise<AdminDashboardResponse['data']>;
    getVenuesBalance(): Promise<AdminVenuesBalanceResponse['data']>;
    getVenuesTopEarners(): Promise<AdminVenuesTopEarnersResponse['data']>;
    getVenuesTopSpenders(): Promise<AdminVenuesTopSpendersResponse['data']>;
    getTransactionsSummary(params?: DateRangeParams): Promise<AdminTransactionsSummaryResponse['data']>;
}
export declare class MenuApiClient extends BaseApiClient {
    getMenu(venueCode: string): Promise<MenuResponse['data']>;
    purchaseItem(venueCode: string, itemId: string, data: MenuItemPurchaseRequest): Promise<MenuItemPurchaseResponse['data']>;
}
export declare class OrdersApiClient extends BaseApiClient {
    createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse['data']>;
    getMyOrders(params?: PaginationParams): Promise<MyOrdersResponse['data']>;
}
export declare class NotificationsApiClient extends BaseApiClient {
    getNotifications(params?: PaginationParams): Promise<NotificationsResponse['data']>;
    markAsRead(data: MarkNotificationReadRequest): Promise<MarkNotificationReadResponse>;
}
export declare const userApi: UserApiClient;
export declare const venueApi: VenueApiClient;
export declare const adminApi: AdminApiClient;
export declare const menuApi: MenuApiClient;
export declare const ordersApi: OrdersApiClient;
export declare const notificationsApi: NotificationsApiClient;
export {};
