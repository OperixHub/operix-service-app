import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { getCurrentPermissions, getCurrentUser, hasPermission, hasSession } from '@/service/AuthSession';
import { loadCurrentSession, refreshAccessToken } from '@/service/Axios';
import { getFirstAllowedMenuPath, getRoutePermission } from '@/config/menu.config';

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
            path: '/auth/callback',
            name: 'auth-callback',
            component: () => import('@/views/auth/AuthCallback.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/auth/Register.vue')
        },
        {
            path: '/verificar-email',
            name: 'verify-email',
            component: () => import('@/views/auth/VerifyEmail.vue')
        },
        {
            path: '/recuperar-senha',
            name: 'forgot-password',
            component: () => import('@/views/auth/ForgotPassword.vue')
        },
        {
            path: '/redefinir-senha',
            name: 'reset-password',
            component: () => import('@/views/auth/ResetPassword.vue')
        },
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/onboarding',
                    name: 'onboarding',
                    meta: { allowOnboarding: true },
                    component: () => import('@/views/auth/Onboarding.vue')
                },
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    meta: { permission: 'dashboard.access' },
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/operacional/servicos',
                    name: 'operational-services',
                    meta: { permission: 'operational.services.access' },
                    component: () => import('@/views/operational/Services/Services.vue')
                },
                {
                    path: '/definicoes/usuarios',
                    name: 'definitions-users',
                    meta: { permission: 'organization.users.access' },
                    component: () => import('@/views/definitions/Users/Users.vue')
                },
                {
                    path: '/operacional/situacoes',
                    name: 'operational-status',
                    meta: { permission: 'operational.status.access' },
                    component: () => import('@/views/operational/Status/Status.vue')
                },
                {
                    path: '/operacional/tipos-de-produto',
                    name: 'operational-types-products',
                    meta: { permission: 'operational.types-products.access' },
                    component: () => import('@/views/operational/TypesProducts/TypesProducts.vue')
                },
                {
                    path: '/inventario/vendas',
                    name: 'inventory-sales',
                    meta: { permission: 'inventory.sales.access' },
                    component: () => import('@/views/inventory/Sales.vue')
                },
                {
                    path: '/inventario/garantias',
                    name: 'inventory-warranties',
                    meta: { permission: 'inventory.warranties.access' },
                    component: () => import('@/views/inventory/Warranties.vue')
                }
            ]
        }
    ]
});

router.beforeEach(async (to) => {
    if (!to.matched.some((route) => route.meta.requiresAuth)) {
        return true;
    }

    try {
        if (!hasSession()) {
            await refreshAccessToken();
        } else if (!getCurrentPermissions().length) {
            await loadCurrentSession();
        }
    } catch {
        return '/login';
    }

    const requiredPermission = to.meta.permission || getRoutePermission(to.path);
    const currentUser = getCurrentUser();
    if (currentUser?.onboarding_required && !to.meta.allowOnboarding) {
        return '/onboarding';
    }

    if (!currentUser?.onboarding_required && to.path === '/onboarding') {
        return getFirstAllowedMenuPath(currentUser, getCurrentPermissions());
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return getFirstAllowedMenuPath(currentUser, getCurrentPermissions());
    }

    return true;
});

export default router;
