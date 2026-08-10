const routeConfig = {
    '/painel': { label: 'Painel', to: '/painel', icon: 'pi pi-fw pi-desktop', permission: 'painel.acesso' },
    '/servicos': { label: 'Serviços', to: '/servicos', icon: 'pi pi-fw pi-wrench', permission: 'servicos.acesso' },
    '/vendas': { label: 'Vendas', to: '/vendas', icon: 'pi pi-fw pi-shopping-cart', permission: 'vendas.acesso' },
    '/clientes': { label: 'Clientes', to: '/clientes', icon: 'pi pi-fw pi-users', permission: 'clientes.acesso' },
    '/estoque': { label: 'Estoque', to: '/estoque', icon: 'pi pi-fw pi-box', permission: 'estoque.acesso' },
    '/usuarios': { label: 'Usuários', to: '/usuarios', icon: 'pi pi-fw pi-user', permission: 'usuarios.acesso' },
    '/ponto': { label: 'Ponto', to: '/ponto', icon: 'pi pi-fw pi-clock', permission: 'ponto.acesso' },
    '/dados-basicos': {
        label: 'Dados Básicos',
        to: '/dados-basicos',
        icon: 'pi pi-fw pi-sitemap',
        permission: ['status-servico.acesso', 'status-pagamento.acesso', 'tipos-produto.acesso', 'fornecedores.acesso', 'cargos.acesso']
    },
    '/configuracoes': { label: 'Gestão da Conta', to: '/configuracoes', icon: 'pi pi-fw pi-cog', permission: 'configuracoes.acesso' }
};

export const MENU_SECTIONS = [
    {
        items: [
            { ...routeConfig['/painel'], plain: true },
            routeConfig['/servicos'],
            routeConfig['/vendas'],
            routeConfig['/clientes'],
            routeConfig['/estoque'],
            routeConfig['/ponto'],
            {
                label: 'Definições',
                icon: 'pi pi-fw pi-cog',
                items: [
                    { ...routeConfig['/configuracoes'], icon: null },
                    { ...routeConfig['/dados-basicos'], icon: null }
                ]
            }
        ]
    }
];

export function canAccessMenuItem(item, user, permissions = []) {
    if (!item.permission || user?.admin || user?.root) {
        return true;
    }

    return Array.isArray(item.permission)
        ? item.permission.some((permission) => permissions.includes(permission))
        : permissions.includes(item.permission);
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

export function getFirstAllowedMenuPath(user, permissions = []) {
    for (const section of buildMenu(user, permissions)) {
        for (const item of section.items) {
            if (item.to) return item.to;
            const child = item.items?.find((subItem) => subItem.to);
            if (child) return child.to;
        }
    }
    return '/painel';
}

export function getRoutePermission(path) {
    return routeConfig[path]?.permission || null;
}
