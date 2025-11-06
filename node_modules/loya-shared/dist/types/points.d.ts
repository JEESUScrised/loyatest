export interface PointsTransaction {
    id: string;
    type: 'earned' | 'spent' | 'expired' | 'bonus';
    points: number;
    balanceAfter: number;
    description: string;
    venue?: {
        name: string;
        code: string;
    };
    venueCode?: string;
    purchaseAmount?: number;
    pointsMultiplier?: number;
    transactionDate: string;
    metadata?: Record<string, any>;
}
export interface PointsExpiry {
    venue: string;
    venueCode: string;
    points: number;
    expiryDate: string;
    status: 'active' | 'expired';
    earnedAt: string;
}
export interface ExpiringPointsByVenue {
    venueCode: string;
    points: number;
    nearestExpiry: string;
}
