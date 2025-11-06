// ApiResponse and ApiError moved to api-endpoints.ts

// Типы для пагинации
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: Pagination;
}

// Типы для фильтрации
export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface VenueFilter {
  venueCode?: string;
}

export interface TypeFilter {
  type?: 'earned' | 'spent' | 'expired' | 'bonus';
}
