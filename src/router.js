import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { getCurrentPermissions, getCurrentUser, hasPermission, hasSession } from '@/services/authSession';
import { loadCurrentSession, refreshAccessToken } from '@/services/axios';
import { getFirstAllowedMenuPath, getRoutePermission } from '@/layout/composables/menu';

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
                    path: '/integracao',
                    name: 'integracao',
                    meta: { allowOnboarding: true },
                    component: () => import('@/views/auth/Onboarding.vue')
                },
                {
                    path: '/painel',
                    name: 'painel',
                    meta: { permission: 'painel.access' },
                    component: () => import('@/views/dashboards/Dashboard.vue')
                },
                {
                    path: '/servicos',
                    name: 'servicos',
                    meta: { permission: 'servicos.access' },
                    component: () => import('@/views/services/Services.vue')
                },
                {
                    path: '/usuarios',
                    name: 'usuarios',
                    meta: { permission: 'usuarios.access' },
                    component: () => import('@/views/users/Users.vue')
                },
                {
                    path: '/configuracoes',
                    name: 'configuracoes',
                    component: () => import('@/views/settings/Settings.vue')
                },
                {
                    path: '/dados-basicos',
                    name: 'dados-basicos',
                    meta: { permission: 'dadosbasicos.access' },
                    component: () => import('@/views/basicData/BasicData.vue')
                },
                {
                    path: '/estoque',
                    name: 'estoque',
                    meta: { permission: 'estoque.access' },
                    component: () => import('@/views/Stock/Stock.vue')
                },
                {
                    path: 'vendas',
                    name: 'vendas',
                    meta: { permission: 'vendas.access' },
                    component: () => import('@/views/sales/Sales.vue')
                },
                {
                    path: '/garantias',
                    name: 'garantias',
                    meta: { permission: 'garantias.access' },
                    component: () => import('@/views/Warranties.vue')
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
        return '/integracao';
    }

    if (!currentUser?.onboarding_required && to.path === '/integracao') {
        return getFirstAllowedMenuPath(currentUser, getCurrentPermissions());
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return getFirstAllowedMenuPath(currentUser, getCurrentPermissions());
    }

    return true;
});

export default router;
