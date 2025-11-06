// API константы
export const API_BASE_URL = 'http://localhost:3000/api';

export const API_URLS = {
  BASE: API_BASE_URL,
  USER: '/user',
  VENUE: '/venue',
  ADMIN: '/admin',
  MENU: '/menu',
  ORDERS: '/orders',
  NOTIFICATIONS: '/notifications',
} as const;

// Маршруты API
export const API_ROUTES = {
  // Пользователи
  USER_PROFILE: '/user/profile',
  USER_REGISTER: '/user/register',
  USER_USE_CODE: '/user/use-code',
  USER_CHECK_CODE: '/user/check-code',
  USER_POINTS_HISTORY: '/user/points-history',
  USER_DAILY_BONUS: '/user/claim-daily-bonus',
  USER_REFERRAL_STATS: '/user/referral-stats',
  USER_REGISTER_WITH_REFERRAL: '/user/register-with-referral',

  // Заведения
  VENUE_CREATE: '/venue/create',
  VENUE_GENERATE_CODE: '/venue/generate-code',
  VENUE_GET: '/venue/:venueCode',
  VENUE_BALANCE: '/venue/:venueCode/balance',
  VENUE_BALANCE_WEEKLY: '/venue/:venueCode/balance/weekly',
  VENUE_BALANCE_HOURLY: '/venue/:venueCode/balance/hourly',
  VENUE_STATS: '/venue/:venueCode/stats',

  // Админ
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VENUES_BALANCE: '/admin/venues/balance',
  ADMIN_VENUES_TOP_EARNERS: '/admin/venues/top-earners',
  ADMIN_VENUES_TOP_SPENDERS: '/admin/venues/top-spenders',
  ADMIN_TRANSACTIONS_SUMMARY: '/admin/transactions/summary',

  // Меню
  MENU_GET: '/menu/:venueCode',
  MENU_ITEM_PURCHASE: '/menu/:venueCode/item/:itemId/purchase',

  // Заказы
  ORDERS_CREATE: '/orders/create',
  ORDERS_MY: '/orders/my',
} as const;

// Роли пользователей
export const USER_ROLES = {
  CLIENT: 'client',
  CASHIER: 'cashier',
  VENUE_ADMIN: 'venue-admin',
  TECH_ADMIN: 'tech-admin',
} as const;

// Типы транзакций
export const TRANSACTION_TYPES = {
  EARNED: 'earned',
  SPENT: 'spent',
  EXPIRED: 'expired',
  BONUS: 'bonus',
} as const;

// Статусы кодов
export const CODE_STATUS = {
  VALID: 'valid',
  USED: 'used',
  EXPIRED: 'expired',
  INVALID: 'invalid',
} as const;

// Порты для разработки
export const DEV_PORTS = {
  BACKEND: 3000,
  CLIENT: 3001,
  CASHIER: 3002,
  VENUE_ADMIN: 3003,
  TECH_ADMIN: 3004,
} as const;

// Домены для продакшена
export const PROD_DOMAINS = {
  CLIENT: 'https://app.loya.ru',
  CASHIER: 'https://cashier.loya.ru',
  VENUE_ADMIN: 'https://admin.loya.ru',
  TECH_ADMIN: 'https://tech.loya.ru',
} as const;

// Лимиты
export const LIMITS = {
  CODE_LENGTH: 6,
  REFERRAL_CODE_LENGTH: 8,
  VENUE_CODE_LENGTH: 3,
  MAX_POINTS_PER_PURCHASE: 1000,
  MIN_POINTS_FOR_EXPIRY: 10,
  POINTS_EXPIRY_DAYS: 90,
} as const;

// Валидация
export const VALIDATION_PATTERNS = {
  CODE: /^[A-Z0-9]{6}$/,
  REFERRAL_CODE: /^[A-Z0-9]{8}$/,
  VENUE_CODE: /^[A-Z0-9]{3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
} as const;
