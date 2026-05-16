export const API_CONFIG = {
    OPERATIONAL: {
        STATUS_SERVICE: '/status-service',
        STATUS_PAYMENT: '/status-payment',
        TYPES_PRODUCT: '/types-product',
        SERVICES: '/services',
        ORDER_OF_SERVICE: '/order-of-service',
    },
    INVENTORY: {
        STOCK: '/stock',
    },
    IDENTITY: {
        USERS: '/users',
        TENANTS: '/tenants',
        PERMISSIONS_ME: '/permissions/me',
        PERMISSIONS_CATALOG: '/permissions/catalog',
        PROFILE_ME: '/profile/me',
        PROFILE_COMPANY: '/profile/company',
        PROFILE_SYSTEM: '/profile/system',
    },
    NOTIFICATIONS: {
        SYSTEM_INFO: '/system-info',
    },
    AUTH: {
        CONFIG: '/auth/config',
        AUTHORIZE: '/auth/authorize',
        CALLBACK: '/auth/callback',
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        ONBOARDING: '/auth/onboarding'
    },
    LOGS: {
        BASE: '/logs'
    }
};
