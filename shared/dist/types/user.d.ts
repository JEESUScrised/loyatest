export interface User {
    id: string;
    telegramId: number;
    username?: string;
    firstName: string;
    lastName?: string;
    pointsBalance: number;
    totalPointsEarned: number;
    totalPointsSpent: number;
    registrationDate: string;
    referralCode: string;
    referredBy?: string;
    referralCodeUsed?: string;
    isActive: boolean;
    isAdmin: boolean;
    isCashier: boolean;
    notificationsEnabled: boolean;
}
export interface UserProfile {
    user: User;
    pointsInfo: PointsInfo;
}
export interface PointsInfo {
    balance: number;
    nextExpiry?: {
        points: number;
        expiryDate: string;
        daysLeft: number;
    };
    totalExpiringPoints: number;
}
export interface TelegramData {
    id: number;
    username?: string;
    first_name: string;
    last_name?: string;
}
export interface RegisterWithReferralData {
    telegramId: number;
    firstName: string;
    lastName?: string;
    username?: string;
    referralCode?: string;
}
export interface UseCodeData {
    code: string;
}
export interface ReferralStats {
    totalReferrals: number;
    totalEarned: number;
    recentReferrals: Referral[];
}
export interface Referral {
    id: string;
    referredUser: {
        firstName: string;
        lastName?: string;
        username?: string;
    };
    usedAt: string;
    status: string;
    bonusAwarded: number;
}
