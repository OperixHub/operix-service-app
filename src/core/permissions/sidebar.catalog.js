export const sidebarCatalog = [
    {
        label: 'Visão Geral',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-home',
                to: '/dashboard',
                permission: 'dashboard.access'
            }
        ]
    },
    {
        label: 'Operacional',
        items: [
            {
                label: 'Serviços',
                icon: 'pi pi-briefcase',
                to: '/operacional/servicos',
                permission: 'operational.services.access'
            },
            {
                label: 'Situações',
                icon: 'pi pi-sitemap',
                to: '/operacional/situacoes',
                permission: 'operational.status.access'
            },
            {
                label: 'Tipos de Produto',
                icon: 'pi pi-box',
                to: '/operacional/tipos-de-produto',
                permission: 'operational.types-products.access'
            }
        ]
    },
    {
        label: 'Inventário',
        items: [
            {
                label: 'Estoque',
                icon: 'pi pi-inbox',
                to: '/inventario/estoque',
                permission: 'inventory.stock.access'
            }
        ]
    },
    {
        label: 'Definições',
        items: [
            {
                label: 'Usuários',
                icon: 'pi pi-users',
                to: '/definicoes/usuarios',
                permission: 'organization.users.access'
            },
            {
                label: 'Unidades',
                icon: 'pi pi-building',
                to: '/definicoes/unidades',
                permission: 'organization.tenants.access'
            }
        ]
    }
];
