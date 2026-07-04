export const API_CONFIG = {
    OPERATIONAL: {
        STATUS_SERVICE: '/status-servico',
        STATUS_PAYMENT: '/status-pagamento',
        TYPES_PRODUCT: '/tipos-produto',
        SERVICES: '/servicos',
        ORDER_OF_SERVICE: '/ordem-servico',
    },
    IDENTITY: {
        USERS: '/usuarios',
        TENANTS: '/locatarios',
    },
    NOTIFICATIONS: {
        BASE: '/informacoes-sistema',
    },
    INVENTORY: {
        STOCK: '/estoque',
        SALES: '/vendas',
        WARRANTIES: '/garantias',
        SERVICE_PARTS: (serviceId) => `/servicos/${serviceId}/pecas`
    },
    AUTH: {
        LOGIN: '/autenticacao/login',
        REGISTER: '/autenticacao/registrar',
        CHECK_EMAIL: '/autenticacao/verificar-email-existencia',
        FORGOT_PASSWORD: '/autenticacao/recuperar-senha',
        RESET_PASSWORD: '/autenticacao/redefinir-senha',
        ONBOARDING: '/autenticacao/onboarding',
        REFRESH: '/autenticacao/renovar',
        LOGOUT: '/autenticacao/sair',
        ME: '/autenticacao/eu',
        AUTHORIZE: '/autenticacao/autorizar',
        CALLBACK: '/autenticacao/retorno'
    },
    LOGS: {
        BASE: '/registros'
    }
};
