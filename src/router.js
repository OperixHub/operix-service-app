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
            path: '/onboarding',
            name: 'onboarding',
            meta: { requiresAuth: true, allowOnboarding: true },
            component: () => import('@/views/auth/Onboarding.vue')
        },
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/painel',
                    name: 'painel',
                    meta: { permission: 'painel.acesso' },
                    component: () => import('@/views/dashboard/Dashboard.vue')
                },
                {
                    path: '/servicos',
                    name: 'servicos',
                    meta: { permission: 'servicos.acesso' },
                    component: () => import('@/views/services/Services.vue')
                },
                {
                    path: '/usuarios',
                    name: 'usuarios',
                    meta: { permission: 'usuarios.acesso' },
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
                    meta: { permissionsAny: ['status-servico.acesso', 'status-pagamento.acesso', 'tipos-produto.acesso'] },
                    component: () => import('@/views/basicData/BasicData.vue')
                },
                {
                    path: '/estoque',
                    name: 'estoque',
                    meta: { permission: 'estoque.acesso' },
                    component: () => import('@/views/Stock/Stock.vue')
                },
                {
                    path: '/vendas',
                    name: 'vendas',
                    meta: { permission: 'vendas.acesso' },
                    component: () => import('@/views/sales/Sales.vue')
                },
                {
                    path: '/clientes',
                    name: 'clientes',
                    meta: { permission: 'clientes.acesso' },
                    component: () => import('@/views/clients/Clients.vue')
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
    const permissionsAny = to.meta.permissionsAny || (Array.isArray(requiredPermission) ? requiredPermission : null);
    const currentUser = getCurrentUser();
    if (currentUser?.onboarding_required && !to.meta.allowOnboarding) {
        return '/onboarding';
    }

    if (!currentUser?.onboarding_required && to.path === '/onboarding') {
        return getFirstAllowedMenuPath(currentUser, getCurrentPermissions());
    }

    if (permissionsAny && !permissionsAny.some((permission) => hasPermission(permission))) {
        return getFirstAllowedMenuPath(currentUser, getCurrentPermissions());
    }

    if (!permissionsAny && requiredPermission && !hasPermission(requiredPermission)) {
        return getFirstAllowedMenuPath(currentUser, getCurrentPermissions());
    }

    return true;
});

export default router;
