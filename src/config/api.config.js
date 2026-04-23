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
    },
    INVENTORY: {
        STOCK: '/stock'
    },
    NOTIFICATIONS: {
        SYSTEM_INFO: '/system-info',
    },
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh'
    },
    PERMISSIONS: {
        ME: '/permissions/me',
        CATALOG: '/permissions/catalog',
        USER: (id) => `/permissions/users/${id}`
    },
    LOGS: {
        BASE: '/logs'
    }
};
