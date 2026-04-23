import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { clearSession, isSessionValid } from '@/core/auth/session';
import { hasPermission, loadCurrentPermissions, resetPermissionsState } from '@/core/permissions/permissions.store';
import { setFlashToast } from '@/core/ui/flash';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/auth/Login.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/auth/Register.vue')
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    meta: { requiresAuth: true, permission: 'dashboard.access' },
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: 'operacional/servicos',
                    name: 'operational-services',
                    meta: { requiresAuth: true, permission: 'operational.services.access' },
                    component: () => import('@/views/operational/Services/Services.vue')
                },
                {
                    path: 'definicoes/usuarios',
                    name: 'definitions-users',
                    meta: { requiresAuth: true, permission: 'organization.users.access' },
                    component: () => import('@/views/definitions/Users/Users.vue')
                },
                {
                    path: 'definicoes/unidades',
                    name: 'definitions-tenants',
                    meta: { requiresAuth: true, permission: 'organization.tenants.access' },
                    component: () => import('@/views/definitions/Tenants/Tenants.vue')
                },
                {
                    path: 'operacional/situacoes',
                    name: 'operational-status',
                    meta: { requiresAuth: true, permission: 'operational.status.access' },
                    component: () => import('@/views/operational/Status/Status.vue')
                },
                {
                    path: 'operacional/tipos-de-produto',
                    name: 'operational-types-products',
                    meta: { requiresAuth: true, permission: 'operational.types-products.access' },
                    component: () => import('@/views/operational/TypesProducts/TypesProducts.vue')
                },
                {
                    path: 'inventario/estoque',
                    name: 'inventory-stock',
                    meta: { requiresAuth: true, permission: 'inventory.stock.access' },
                    component: () => import('@/views/inventory/Stock/Stock.vue')
                }
            ]
        },
        { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
    ]
});

router.beforeEach(async (to) => {
    if (!to.meta?.requiresAuth) {
        if ((to.path === '/login' || to.path === '/register') && isSessionValid()) {
            return '/dashboard';
        }

        return true;
    }

    if (!isSessionValid()) {
        clearSession();
        resetPermissionsState();
        return '/login';
    }

    try {
        await loadCurrentPermissions();
    } catch (_error) {
        return '/login';
    }

    if (to.meta?.permission && !hasPermission(to.meta.permission)) {
        setFlashToast({
            severity: 'warn',
            summary: 'Acesso restrito',
            detail: 'Você não tem permissão para acessar esta tela.',
            life: 4000
        });
        return '/dashboard';
    }

    return true;
});

export default router;
