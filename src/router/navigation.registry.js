const moduleConfig = {
    dashboard: { icon: 'pi pi-fw pi-home', order: 0, single: true },
    operational: { icon: 'pi pi-fw pi-wrench', order: 1 },
    inventory: { icon: 'pi pi-fw pi-box', order: 2 },
    organization: { icon: 'pi pi-fw pi-cog', order: 3 },
    notifications: { icon: 'pi pi-fw pi-bell', order: 4 },
};

const routeConfig = {
    '/dashboard': { icon: 'pi pi-fw pi-home', permission: 'dashboard.access' },
    '/operacional/servicos': { icon: 'pi pi-fw pi-ticket', permission: 'operational.services.access' },
    '/operacional/situacoes': { icon: 'pi pi-fw pi-sitemap', permission: 'operational.status.access' },
    '/operacional/tipos-de-produto': { icon: 'pi pi-fw pi-box', permission: 'operational.types-products.access' },
    '/inventario/estoque': { icon: 'pi pi-fw pi-warehouse', permission: 'inventory.stock.access' },
    '/definicoes/usuarios': { icon: 'pi pi-fw pi-user', permission: 'organization.users.access' },
    '/definicoes/configuracoes': { icon: 'pi pi-fw pi-sliders-h', permission: 'organization.settings.access' },
    '/notificacoes/informacoes-do-sistema': { icon: 'pi pi-fw pi-bell', permission: 'notifications.system-info.access' }
};

const fallbackNavigationRegistry = [
    {
        label: 'Painel Principal',
        icon: routeConfig['/dashboard'].icon,
        to: '/dashboard',
        permission: routeConfig['/dashboard'].permission,
        plain: true
    },
    {
        label: 'Operacional',
        icon: moduleConfig.operational.icon,
        children: [
            { label: 'Serviços', icon: routeConfig['/operacional/servicos'].icon, to: '/operacional/servicos', permission: routeConfig['/operacional/servicos'].permission },
            { label: 'Situações', icon: routeConfig['/operacional/situacoes'].icon, to: '/operacional/situacoes', permission: routeConfig['/operacional/situacoes'].permission },
            { label: 'Tipos de Produto', icon: routeConfig['/operacional/tipos-de-produto'].icon, to: '/operacional/tipos-de-produto', permission: routeConfig['/operacional/tipos-de-produto'].permission }
        ]
    },
    {
        label: 'Inventário',
        icon: moduleConfig.inventory.icon,
        children: [
            { label: 'Estoque', icon: routeConfig['/inventario/estoque'].icon, to: '/inventario/estoque', permission: routeConfig['/inventario/estoque'].permission }
        ]
    },
    {
        label: 'Definições',
        icon: moduleConfig.organization.icon,
        children: [
            { label: 'Usuários', icon: routeConfig['/definicoes/usuarios'].icon, to: '/definicoes/usuarios', permission: routeConfig['/definicoes/usuarios'].permission },
            { label: 'Configurações', icon: routeConfig['/definicoes/configuracoes'].icon, to: '/definicoes/configuracoes', permission: routeConfig['/definicoes/configuracoes'].permission }
        ]
    },
    {
        label: 'Notificações',
        icon: moduleConfig.notifications.icon,
        children: [
            { label: 'Informações do Sistema', icon: routeConfig['/notificacoes/informacoes-do-sistema'].icon, to: '/notificacoes/informacoes-do-sistema', permission: routeConfig['/notificacoes/informacoes-do-sistema'].permission }
        ]
    }
];

function buildNavigationFromPermissionDetails(permissionDetails = []) {
    const allowedItems = permissionDetails
        .filter((item) => item.allowed && item.route && routeConfig[item.route])
        .sort((a, b) => {
            const moduleOrderA = moduleConfig[a.module_key]?.order ?? 99;
            const moduleOrderB = moduleConfig[b.module_key]?.order ?? 99;
            if (moduleOrderA !== moduleOrderB) {
                return moduleOrderA - moduleOrderB;
            }

            return String(a.label).localeCompare(String(b.label));
        });

    if (allowedItems.length === 0) {
        return buildFallbackNavigation();
    }

    const grouped = new Map();

    allowedItems.forEach((item) => {
        const moduleEntry = moduleConfig[item.module_key] || { icon: 'pi pi-fw pi-folder', order: 99 };
        const navItem = {
            label: item.route === '/dashboard' ? 'Painel Principal' : item.label,
            icon: routeConfig[item.route].icon,
            to: item.route,
            permission: routeConfig[item.route].permission || item.key,
            plain: item.route === '/dashboard'
        };

        if (moduleEntry.single) {
            grouped.set(item.module_key, navItem);
            return;
        }

        if (!grouped.has(item.module_key)) {
            grouped.set(item.module_key, {
                label: item.module_label,
                icon: moduleEntry.icon,
                items: []
            });
        }

        grouped.get(item.module_key).items.push(navItem);
    });

    return [...grouped.entries()]
        .sort((a, b) => (moduleConfig[a[0]]?.order ?? 99) - (moduleConfig[b[0]]?.order ?? 99))
        .map(([, item]) => item);
}

function canShow(item, permissions) {
    if (!item.permission) return true;
    return permissions.includes(item.permission);
}

function buildFallbackNavigation(permissions = []) {
    return fallbackNavigationRegistry
        .map((item) => {
            if (!item.children) {
                return canShow(item, permissions) || item.plain ? item : null;
            }

            const visibleChildren = item.children.filter((child) => canShow(child, permissions));
            return visibleChildren.length > 0 ? { ...item, items: visibleChildren } : null;
        })
        .filter(Boolean);
}

export function buildNavigation({ permissions = [], permissionDetails = [] } = {}) {
    const fromBackend = buildNavigationFromPermissionDetails(permissionDetails);
    if (fromBackend.length > 0) {
        const hasDashboard = fromBackend.some((item) => item.to === '/dashboard');
        return hasDashboard ? fromBackend : [fallbackNavigationRegistry[0], ...fromBackend];
    }

    return buildFallbackNavigation(permissions);
}

export function getRoutePermission(path) {
    return routeConfig[path]?.permission || null;
}
