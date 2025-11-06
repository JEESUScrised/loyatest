export interface UserProfileResponse {
    success: boolean;
    data: {
        telegramId: number;
        firstName: string;
        lastName?: string;
        username?: string;
        points: number;
        totalEarned: number;
        totalSpent: number;
        isActive: boolean;
        createdAt: string;
        lastActivity?: string;
        referralCode: string;
        referralStats?: {
            totalReferrals: number;
            totalEarned: number;
        };
    };
    message?: string;
}
export interface UserRegisterRequest {
    telegramId: number;
    firstName: string;
    lastName?: string;
    username?: string;
    referralCode?: string;
}
export interface UserRegisterResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        telegramId: number;
        firstName: string;
        lastName?: string;
        username?: string;
        points: number;
        referralCode: string;
    };
}
export interface UseCodeRequest {
    code: string;
}
export interface UseCodeResponse {
    success: boolean;
    message: string;
    data?: {
        pointsEarned: number;
        venueName: string;
        newBalance: number;
    };
}
export interface CheckCodeRequest {
    code: string;
}
export interface CheckCodeResponse {
    success: boolean;
    message: string;
    data?: {
        isValid: boolean;
        venueName?: string;
        pointsValue?: number;
        expiresAt?: string;
    };
}
export interface PointsHistoryResponse {
    success: boolean;
    data: {
        transactions: Array<{
            id: string;
            type: 'earned' | 'spent' | 'expired' | 'bonus';
            amount: number;
            description: string;
            venueName?: string;
            transactionDate: string;
            expiresAt?: string;
        }>;
        totalPages: number;
        currentPage: number;
        totalTransactions: number;
    };
    message?: string;
}
export interface DailyBonusResponse {
    success: boolean;
    message: string;
    data?: {
        pointsEarned: number;
        newBalance: number;
        nextBonusDate: string;
    };
}
export interface ReferralStatsResponse {
    success: boolean;
    data: {
        totalReferrals: number;
        totalEarned: number;
        referrals: Array<{
            telegramId: number;
            firstName: string;
            username?: string;
            joinedAt: string;
            pointsEarned: number;
        }>;
    };
    message?: string;
}
export interface CreateVenueRequest {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    pointsPerPurchase?: number;
    pointsMultiplier?: number;
    pointsLifetime?: {
        weeks: number;
        autoExpire: boolean;
        expiryNotifications: {
            enabled: boolean;
            daysBefore: number;
        };
    };
    doublePointsHours?: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        multiplier: number;
    }>;
}
export interface CreateVenueResponse {
    success: boolean;
    message: string;
    data?: {
        venueCode: string;
        name: string;
        pointsPerPurchase: number;
        pointsMultiplier: number;
    };
}
export interface GenerateCodeRequest {
    purchaseAmount: number;
}
export interface GenerateCodeResponse {
    success: boolean;
    message: string;
    data?: {
        code: string;
        pointsValue: number;
        expiresAt: string;
        venueName: string;
    };
}
export interface VenueInfoResponse {
    success: boolean;
    data: {
        venueCode: string;
        name: string;
        description?: string;
        address?: string;
        phone?: string;
        email?: string;
        pointsPerPurchase: number;
        pointsMultiplier: number;
        isActive: boolean;
        createdAt: string;
    };
    message?: string;
}
export interface VenueBalanceResponse {
    success: boolean;
    data: {
        totalBalance: number;
        totalEarned: number;
        totalSpent: number;
        activeCodes: number;
        usedCodes: number;
        expiredCodes: number;
        recentTransactions: Array<{
            id: string;
            type: 'earned' | 'spent';
            amount: number;
            description: string;
            transactionDate: string;
        }>;
    };
    message?: string;
}
export interface VenueBalanceWeeklyResponse {
    success: boolean;
    data: {
        weeklyData: Array<{
            week: string;
            earned: number;
            spent: number;
            net: number;
        }>;
        totalEarned: number;
        totalSpent: number;
        netBalance: number;
    };
    message?: string;
}
export interface VenueBalanceHourlyResponse {
    success: boolean;
    data: {
        hourlyData: Array<{
            hour: string;
            earned: number;
            spent: number;
            net: number;
        }>;
        peakHour: string;
        totalEarned: number;
        totalSpent: number;
    };
    message?: string;
}
export interface VenueStatsResponse {
    success: boolean;
    data: {
        totalUsers: number;
        activeUsers: number;
        totalTransactions: number;
        averageTransactionValue: number;
        topUsers: Array<{
            telegramId: number;
            firstName: string;
            username?: string;
            totalSpent: number;
            totalEarned: number;
        }>;
        recentActivity: Array<{
            type: 'code_generated' | 'code_used' | 'points_earned' | 'points_spent';
            description: string;
            timestamp: string;
            amount?: number;
        }>;
    };
    message?: string;
}
export interface AdminDashboardResponse {
    success: boolean;
    data: {
        overview: {
            totalUsers: number;
            totalVenues: number;
            totalTransactions: number;
            activeUsers: number;
            activeVenues: number;
        };
        recentActivity: {
            newUsersLast30Days: number;
            newVenuesLast30Days: number;
            transactionsLast30Days: number;
        };
        transactionStats: {
            earnedTransactions: number;
            spentTransactions: number;
            expiredTransactions: number;
        };
        topVenues: Array<{
            venueCode: string;
            name: string;
            totalEarned: number;
            totalSpent: number;
            netBalance: number;
        }>;
        systemHealth: {
            databaseStatus: 'healthy' | 'warning' | 'error';
            apiResponseTime: number;
            lastBackup: string;
            uptime: number;
        };
    };
    message?: string;
}
export interface AdminVenuesBalanceResponse {
    success: boolean;
    data: {
        venues: Array<{
            venueCode: string;
            name: string;
            totalBalance: number;
            totalEarned: number;
            totalSpent: number;
            activeCodes: number;
            isActive: boolean;
        }>;
        totalBalance: number;
        totalEarned: number;
        totalSpent: number;
    };
    message?: string;
}
export interface AdminVenuesTopEarnersResponse {
    success: boolean;
    data: {
        venues: Array<{
            venueCode: string;
            name: string;
            totalEarned: number;
            totalSpent: number;
            netBalance: number;
            transactionCount: number;
            averageTransactionValue: number;
        }>;
    };
    message?: string;
}
export interface AdminVenuesTopSpendersResponse {
    success: boolean;
    data: {
        users: Array<{
            telegramId: number;
            firstName: string;
            username?: string;
            totalSpent: number;
            totalEarned: number;
            netBalance: number;
            transactionCount: number;
            lastActivity: string;
        }>;
    };
    message?: string;
}
export interface AdminTransactionsSummaryResponse {
    success: boolean;
    data: {
        summary: {
            totalTransactions: number;
            totalEarned: number;
            totalSpent: number;
            totalExpired: number;
        };
        dailyStats: Array<{
            date: string;
            earned: number;
            spent: number;
            expired: number;
            net: number;
        }>;
        venueBreakdown: Array<{
            venueCode: string;
            venueName: string;
            earned: number;
            spent: number;
            net: number;
        }>;
    };
    message?: string;
}
export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    pointsValue: number;
    category: string;
    isAvailable: boolean;
    imageUrl?: string;
}
export interface MenuResponse {
    success: boolean;
    data: {
        venueCode: string;
        venueName: string;
        categories: Array<{
            name: string;
            items: MenuItem[];
        }>;
    };
    message?: string;
}
export interface MenuItemPurchaseRequest {
    itemId: string;
    quantity?: number;
}
export interface MenuItemPurchaseResponse {
    success: boolean;
    message: string;
    data?: {
        pointsEarned: number;
        newBalance: number;
        transactionId: string;
    };
}
export interface CreateOrderRequest {
    venueCode: string;
    items: Array<{
        itemId: string;
        quantity: number;
    }>;
    totalAmount: number;
    notes?: string;
}
export interface CreateOrderResponse {
    success: boolean;
    message: string;
    data?: {
        orderId: string;
        totalAmount: number;
        pointsEarned: number;
        newBalance: number;
    };
}
export interface MyOrdersResponse {
    success: boolean;
    data: {
        orders: Array<{
            orderId: string;
            venueCode: string;
            venueName: string;
            totalAmount: number;
            pointsEarned: number;
            status: 'completed' | 'cancelled' | 'pending';
            createdAt: string;
            items: Array<{
                itemId: string;
                name: string;
                quantity: number;
                price: number;
            }>;
        }>;
        totalPages: number;
        currentPage: number;
        totalOrders: number;
    };
    message?: string;
}
export interface Notification {
    id: string;
    type: 'points_earned' | 'points_expiring' | 'points_expired' | 'referral_bonus' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
}
export interface NotificationsResponse {
    success: boolean;
    data: {
        notifications: Notification[];
        unreadCount: number;
        totalCount: number;
    };
    message?: string;
}
export interface MarkNotificationReadRequest {
    notificationId: string;
}
export interface MarkNotificationReadResponse {
    success: boolean;
    message: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface DateRangeParams {
    startDate?: string;
    endDate?: string;
}
export interface ApiError {
    success: false;
    message: string;
    code?: string;
    details?: any;
}
export interface ApiSuccess<T = any> {
    success: true;
    data: T;
    message?: string;
}
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;
