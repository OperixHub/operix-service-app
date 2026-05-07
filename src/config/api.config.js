export const API_CONFIG = {
    OPERATIONAL: {
        STATUS_SERVICE: '/status-service',
        STATUS_PAYMENT: '/status-payment',
        TYPES_PRODUCT: '/types-product',
        SERVICES: '/services',
        ORDER_OF_SERVICE: '/order-of-service',
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
        BASE: '/notifications',
    },
    AUTH: {
        CONFIG: '/auth/config',
        AUTHORIZE: '/auth/authorize',
        CALLBACK: '/auth/callback',
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
        ONBOARDING: '/auth/onboarding'
    },
    LOGS: {
        BASE: '/logs'
    }
};
