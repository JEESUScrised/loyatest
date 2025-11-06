export interface Venue {
    id: string;
    name: string;
    venueCode: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    pointsMultiplier: number;
    isActive: boolean;
    settings: VenueSettings;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    images: VenueImage[];
    socialLinks: SocialLinks;
    statistics: VenueStatistics;
}
export interface VenueSettings {
    allowOrders: boolean;
    allowMenu: boolean;
    allowPurchaseCodes: boolean;
    workingHours: WorkingHours;
    timezone: string;
}
export interface WorkingHours {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}
export interface DaySchedule {
    open: string;
    close: string;
    isOpen: boolean;
}
export interface VenueImage {
    url: string;
    alt: string;
    isMain: boolean;
}
export interface SocialLinks {
    website?: string;
    instagram?: string;
    telegram?: string;
    vk?: string;
}
export interface VenueStatistics {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    lastActivity: string;
}
export interface VenueBalance {
    venue: {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
    };
    balance: BalanceSummary;
}
export interface BalanceSummary {
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    uniqueCustomers: number;
    totalTransactions: number;
}
export interface CreateVenueData {
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
    doublePointsHours?: DoublePointsHour[];
}
export interface DoublePointsHour {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    multiplier: number;
}
export interface GenerateCodeData {
    venueCode: string;
    purchaseAmount: number;
}
