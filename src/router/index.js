import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { clearSession, getAccessToken, hasCompletedOnboarding, hasPermission, isSessionValid } from '@/service/AuthSession';
import { getRoutePermission } from '@/router/navigation.registry';

const publicRoutes = ['login', 'register', 'auth-callback'];

function requireAuthenticated(to) {
    const hasSession = Boolean(getAccessToken()) && isSessionValid();
    if (!hasSession) {
        clearSession();
        return { name: 'login' };
    }

    if (to.name !== 'onboarding' && !hasCompletedOnboarding()) {
        return { name: 'onboarding' };
    }

    if (to.name === 'onboarding' && hasCompletedOnboarding()) {
        return { name: 'dashboard' };
    }

    const requiredPermission = getRoutePermission(to.path);
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return { name: 'dashboard' };
    }

    return true;
}

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
            path: '/onboarding',
            name: 'onboarding',
            component: () => import('@/views/auth/Onboarding.vue')
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/operacional/servicos',
                    name: 'operational-services',
                    component: () => import('@/views/operational/Services/Services.vue')
                },
                {
                    path: '/definicoes/usuarios',
                    name: 'definitions-users',
                    component: () => import('@/views/definitions/Users/Users.vue')
                },
                {
                    path: '/definicoes/configuracoes',
                    name: 'definitions-settings',
                    component: () => import('@/views/definitions/Settings/Settings.vue')
                },
                {
                    path: '/operacional/situacoes',
                    name: 'operational-status',
                    component: () => import('@/views/operational/Status/Status.vue')
                },
                {
                    path: '/operacional/tipos-de-produto',
                    name: 'operational-types-products',
                    component: () => import('@/views/operational/TypesProducts/TypesProducts.vue')
                },
                {
                    path: '/inventario/estoque',
                    name: 'inventory-stock',
                    component: () => import('@/views/inventory/Stock/Stock.vue')
                },
                {
                    path: '/notificacoes/informacoes-do-sistema',
                    name: 'notifications-system-info',
                    component: () => import('@/views/notifications/SystemInfo/SystemInfo.vue')
                }
            ]
        }
    ]
});

router.beforeEach((to) => {
    if (publicRoutes.includes(to.name)) {
        return true;
    }

    return requireAuthenticated(to);
});

export default router;
