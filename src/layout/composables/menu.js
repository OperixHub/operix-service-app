const routeConfig = {
    '/painel': { label: 'Painel', to: '/painel', icon: 'pi pi-fw pi-desktop', permission: 'painel.access' },
    '/servicos': { label: 'Serviços', to: '/servicos', icon: 'pi pi-fw pi-wrench', permission: 'servicos.access' },
    '/vendas': { label: 'Vendas', to: '/vendas', icon: 'pi pi-fw pi-shopping-cart', permission: 'vendas.access' },
    '/estoque': { label: 'Estoque', to: '/estoque', icon: 'pi pi-fw pi-box', permission: 'estoque.access' },
    '/usuarios': { label: 'Usuários', to: '/usuarios', icon: 'pi pi-fw pi-user', permission: 'usuarios.access' },
    '/dados-basicos': { label: 'Dados Básicos', to: '/dados-basicos', icon: 'pi pi-fw pi-sitemap', permission: 'dadosbasicos.access' },
    '/configuracoes': { label: 'Gestão da Conta', to: '/configuracoes', icon: 'pi pi-fw pi-user', permission: 'configuracoes.access' },
};

export const MENU_SECTIONS = [
    {
        items: [
            {
                label: routeConfig['/painel'].label,
                icon: routeConfig['/painel'].icon,
                to: routeConfig['/painel'].to,
                permission: routeConfig['/painel'].permission,
                plain: true
            },
            {
                label: routeConfig['/servicos'].label,
                icon: routeConfig['/servicos'].icon,
                to: routeConfig['/servicos'].to,
                permission: routeConfig['/servicos'].permission,
            },
            {
                label: routeConfig['/vendas'].label,
                icon: routeConfig['/vendas'].icon,
                to: routeConfig['/vendas'].to,
                permission: routeConfig['/vendas'].permission,
            },
            {
                label: routeConfig['/estoque'].label,
                icon: routeConfig['/estoque'].icon,
                to: routeConfig['/estoque'].to,
                permission: routeConfig['/estoque'].permission,
            },
            {
                label: 'Definições',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: routeConfig['/usuarios'].label,
                        icon: routeConfig['/usuarios'].icon,
                        to: routeConfig['/usuarios'].to,
                        permission: routeConfig['/usuarios'].permission,
                    },
                    {
                        label: routeConfig['/configuracoes'].label,
                        icon: routeConfig['/configuracoes'].icon,
                        to: routeConfig['/configuracoes'].to,
                        permission: routeConfig['/configuracoes'].permission,
                    },
                    {
                        label: routeConfig['/dados-basicos'].label,
                        icon: routeConfig['/dados-basicos'].icon,
                        to: routeConfig['/dados-basicos'].to,
                        permission: routeConfig['/dados-basicos'].permission,
                    }
                ]
            }
        ]
    }
];

export function canAccessMenuItem(item, user, permissions = []) {
    if (!item.permission) {
        return true;
    }

    if (user?.admin || user?.root) {
        return true;
    }

    return permissions.includes(item.permission);
}

export function buildMenu(user, permissions = []) {
    return MENU_SECTIONS
        .map((section) => ({
            ...section,
            items: section.items
                .map((item) => {
                    if (!item.items) {
                        return canAccessMenuItem(item, user, permissions) ? item : null;
                    }

                    const children = item.items.filter((child) => canAccessMenuItem(child, user, permissions));
                    return children.length ? { ...item, items: children } : null;
                })
                .filter(Boolean)
        }))
        .filter((section) => section.items.length);
}

// export function getRoutePermission(path) {
//     for (const section of MENU_SECTIONS) {
//         for (const item of section.items) {
//             if (item.to === path) {
//                 return item.permission || null;
//             }

//             const child = item.items?.find((subItem) => subItem.to === path);
//             if (child) {
//                 return child.permission || null;
//             }
//         }
//     }

//     return null;
// }

export function getFirstAllowedMenuPath(user, permissions = []) {
    for (const section of buildMenu(user, permissions)) {
        for (const item of section.items) {
            if (item.to) {
                return item.to;
            }

            const child = item.items?.find((subItem) => subItem.to);
            if (child) {
                return child.to;
            }
        }
    }

    return '/painel';
}

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
            label: item.route === '/painel' ? 'Painel Principal' : item.label,
            icon: routeConfig[item.route].icon,
            to: item.route,
            permission: routeConfig[item.route].permission || item.key,
            plain: item.route === '/painel'
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
        const hasDashboard = fromBackend.some((item) => item.to === '/painel');
        return hasDashboard ? fromBackend : [fallbackNavigationRegistry[0], ...fromBackend];
    }

    return buildFallbackNavigation(permissions);
}

export function getRoutePermission(path) {
    return routeConfig[path]?.permission || null;
}
