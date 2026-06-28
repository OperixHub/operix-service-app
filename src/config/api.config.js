export const API_CONFIG = {
    OPERATIONAL: {
        STATUS_SERVICE: '/status-servico',
        STATUS_PAYMENT: '/status-pagamento',
        TYPES_PRODUCT: '/tipos-produto',
        SERVICES: '/servicos',
        ORDER_OF_SERVICE: '/ordem-servico',
    },
    INVENTORY: {
        STOCK: '/estoque',
    },
    IDENTITY: {
        USERS: '/usuarios',
        TENANTS: '/locatarios',
        PERMISSIONS_ME: '/permissoes/me',
        PERMISSIONS_CATALOG: '/permissoes/catalogo',
        PROFILE_ME: '/perfil/eu',
        PROFILE_COMPANY: '/perfil/empresa',
        PROFILE_SYSTEM: '/perfil/sistema',
    },
    NOTIFICATIONS: {
        SYSTEM_INFO: '/informacoes-sistema',
    },
    AUTH: {
        CONFIG: '/autenticacao/configuracao',
        AUTHORIZE: '/autenticacao/autorizar',
        CALLBACK: '/autenticacao/retorno',
        LOGIN: '/autenticacao/login',
        REFRESH: '/autenticacao/renovar',
        LOGOUT: '/autenticacao/sair',
        ME: '/autenticacao/eu',
        ONBOARDING: '/autenticacao/onboarding'
    },
    LOGS: {
        BASE: '/registros'
    }
};
