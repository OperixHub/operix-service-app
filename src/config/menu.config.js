export const MENU_SECTIONS = [
    {
        items: [
            {
                label: 'Monitor',
                icon: 'pi pi-fw pi-desktop',
                to: '/dashboard',
                permission: 'dashboard.access'
            },
            {
                label: 'Serviços',
                icon: 'pi pi-fw pi-wrench',
                to: '/operacional/servicos',
                permission: 'services.access'
            },
            {
                label: 'Vendas',
                icon: 'pi pi-fw pi-shopping-cart',
                to: '/inventario/vendas',
                permission: 'vendas.access'
            },
            {
                label: 'Estoque',
                icon: 'pi pi-fw pi-box',
                to: '/inventario/estoque',
                permission: 'estoque.access'
            },
            {
                label: 'Definições',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Usuários',
                        icon: 'pi pi-fw pi-user',
                        to: '/configuracoes/usuarios',
                        permission: 'organization.users.access'
                    },
                    {
                        label: 'Dados Básicos',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/configuracoes/dados-basicos',
                        permission: 'operational.status.access'
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

export function getRoutePermission(path) {
    for (const section of MENU_SECTIONS) {
        for (const item of section.items) {
            if (item.to === path) {
                return item.permission || null;
            }

            const child = item.items?.find((subItem) => subItem.to === path);
            if (child) {
                return child.permission || null;
            }
        }
    }

    return null;
}

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

    return '/dashboard';
}
