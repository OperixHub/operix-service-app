export const navigationRegistry = [
    {
        label: 'Início',
        icon: 'pi pi-fw pi-home',
        to: '/dashboard',
        permission: 'dashboard.access'
    },
    {
        label: 'Operacional',
        icon: 'pi pi-fw pi-wrench',
        children: [
            { label: 'Serviços', icon: 'pi pi-fw pi-ticket', to: '/operacional/servicos', permission: 'operational.services.access' },
            { label: 'Situações', icon: 'pi pi-fw pi-sitemap', to: '/operacional/situacoes', permission: 'operational.status.access' },
            { label: 'Tipos de Produto', icon: 'pi pi-fw pi-box', to: '/operacional/tipos-de-produto', permission: 'operational.types-products.access' }
        ]
    },
    {
        label: 'Inventário',
        icon: 'pi pi-fw pi-box',
        children: [
            { label: 'Estoque', icon: 'pi pi-fw pi-sitemap', to: '/inventario/estoque', permission: 'inventory.stock.access' }
        ]
    },
    {
        label: 'Definições',
        icon: 'pi pi-fw pi-cog',
        children: [
            { label: 'Usuários', icon: 'pi pi-fw pi-user', to: '/definicoes/usuarios', permission: 'organization.users.access' },
            { label: 'Configurações', icon: 'pi pi-fw pi-sliders-h', to: '/definicoes/configuracoes', permission: 'organization.settings.access' }
        ]
    }
];

function canShow(item, permissions) {
    if (!item.permission) return true;
    return permissions.includes(item.permission);
}

export function buildNavigation(permissions = []) {
    return navigationRegistry
        .map((item) => {
            if (!item.children) {
                return canShow(item, permissions) ? item : null;
            }

            const visibleChildren = item.children.filter((child) => canShow(child, permissions));
            return visibleChildren.length > 0 ? { ...item, items: visibleChildren } : null;
        })
        .filter(Boolean);
}

export function getRoutePermission(path) {
    for (const item of navigationRegistry) {
        if (item.to === path) return item.permission || null;
        const child = item.children?.find((entry) => entry.to === path);
        if (child) return child.permission || null;
    }

    return null;
}
