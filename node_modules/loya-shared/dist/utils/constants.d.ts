export declare const API_BASE_URL = "http://localhost:3000/api";
export declare const API_URLS: {
    readonly BASE: "http://localhost:3000/api";
    readonly USER: "/user";
    readonly VENUE: "/venue";
    readonly ADMIN: "/admin";
    readonly MENU: "/menu";
    readonly ORDERS: "/orders";
    readonly NOTIFICATIONS: "/notifications";
};
export declare const API_ROUTES: {
    readonly USER_PROFILE: "/user/profile";
    readonly USER_REGISTER: "/user/register";
    readonly USER_USE_CODE: "/user/use-code";
    readonly USER_CHECK_CODE: "/user/check-code";
    readonly USER_POINTS_HISTORY: "/user/points-history";
    readonly USER_DAILY_BONUS: "/user/claim-daily-bonus";
    readonly USER_REFERRAL_STATS: "/user/referral-stats";
    readonly USER_REGISTER_WITH_REFERRAL: "/user/register-with-referral";
    readonly VENUE_CREATE: "/venue/create";
    readonly VENUE_GENERATE_CODE: "/venue/generate-code";
    readonly VENUE_GET: "/venue/:venueCode";
    readonly VENUE_BALANCE: "/venue/:venueCode/balance";
    readonly VENUE_BALANCE_WEEKLY: "/venue/:venueCode/balance/weekly";
    readonly VENUE_BALANCE_HOURLY: "/venue/:venueCode/balance/hourly";
    readonly VENUE_STATS: "/venue/:venueCode/stats";
    readonly ADMIN_DASHBOARD: "/admin/dashboard";
    readonly ADMIN_VENUES_BALANCE: "/admin/venues/balance";
    readonly ADMIN_VENUES_TOP_EARNERS: "/admin/venues/top-earners";
    readonly ADMIN_VENUES_TOP_SPENDERS: "/admin/venues/top-spenders";
    readonly ADMIN_TRANSACTIONS_SUMMARY: "/admin/transactions/summary";
    readonly MENU_GET: "/menu/:venueCode";
    readonly MENU_ITEM_PURCHASE: "/menu/:venueCode/item/:itemId/purchase";
    readonly ORDERS_CREATE: "/orders/create";
    readonly ORDERS_MY: "/orders/my";
};
export declare const USER_ROLES: {
    readonly CLIENT: "client";
    readonly CASHIER: "cashier";
    readonly VENUE_ADMIN: "venue-admin";
    readonly TECH_ADMIN: "tech-admin";
};
export declare const TRANSACTION_TYPES: {
    readonly EARNED: "earned";
    readonly SPENT: "spent";
    readonly EXPIRED: "expired";
    readonly BONUS: "bonus";
};
export declare const CODE_STATUS: {
    readonly VALID: "valid";
    readonly USED: "used";
    readonly EXPIRED: "expired";
    readonly INVALID: "invalid";
};
export declare const DEV_PORTS: {
    readonly BACKEND: 3000;
    readonly CLIENT: 3001;
    readonly CASHIER: 3002;
    readonly VENUE_ADMIN: 3003;
    readonly TECH_ADMIN: 3004;
};
export declare const PROD_DOMAINS: {
    readonly CLIENT: "https://app.loya.ru";
    readonly CASHIER: "https://cashier.loya.ru";
    readonly VENUE_ADMIN: "https://admin.loya.ru";
    readonly TECH_ADMIN: "https://tech.loya.ru";
};
export declare const LIMITS: {
    readonly CODE_LENGTH: 6;
    readonly REFERRAL_CODE_LENGTH: 8;
    readonly VENUE_CODE_LENGTH: 3;
    readonly MAX_POINTS_PER_PURCHASE: 1000;
    readonly MIN_POINTS_FOR_EXPIRY: 10;
    readonly POINTS_EXPIRY_DAYS: 90;
};
export declare const VALIDATION_PATTERNS: {
    readonly CODE: RegExp;
    readonly REFERRAL_CODE: RegExp;
    readonly VENUE_CODE: RegExp;
    readonly EMAIL: RegExp;
    readonly PHONE: RegExp;
};
