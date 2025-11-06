// Типы для баллов и транзакций
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

// PointsHistoryResponse moved to api-endpoints.ts

// CheckCodeResponse moved to api-endpoints.ts

// Типы для сгорания баллов
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
