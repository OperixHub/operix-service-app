import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const validateToken = async () => {
    const data = JSON.parse(localStorage.getItem('user'));
    if (Date.now() >= data.exp * 1000) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
    } else {
        return true;
    }
};

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
                    path: '/dashboard',
                    name: 'dashboard',
                    beforeEnter(to, from, next) {
                        const token = localStorage.getItem('token');
                        const user = localStorage.getItem('user');
                        const response = validateToken();
                        if (!token || !user || !response) {
                            next('/login');
                        } else {
                            next();
                        }
                    },
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/operacional/servicos',
                    name: 'operational-services',
                    beforeEnter(to, from, next) {
                        const token = localStorage.getItem('token');
                        const user = localStorage.getItem('user');
                        const response = validateToken();
                        if (!token || !user || !response) {
                            next('/login');
                        } else {
                            next();
                        }
                    },
                    component: () => import('@/views/operational/Services/Services.vue')
                },
                {
                    path: '/definicoes/usuarios',
                    name: 'definitions-users',
                    beforeEnter(to, from, next) {
                        const token = localStorage.getItem('token');
                        const user = localStorage.getItem('user');
                        const response = validateToken();
                        if (!token || !user || !response) {
                            next('/login');
                        } else {
                            next();
                        }
                    },
                    component: () => import('@/views/definitions/Users/Users.vue')
                },
                {
                    path: '/operacional/situacoes',
                    name: 'operational-status',
                    beforeEnter(to, from, next) {
                        const token = localStorage.getItem('token');
                        const user = localStorage.getItem('user');
                        const response = validateToken();
                        if (!token || !user || !response) {
                            next('/login');
                        } else {
                            next();
                        }
                    },
                    component: () => import('@/views/operational/Status/Status.vue')
                },
                {
                    path: '/operacional/tipos-de-produto',
                    name: 'operational-types-products',
                    beforeEnter(to, from, next) {
                        const token = localStorage.getItem('token');
                        const user = localStorage.getItem('user');
                        const response = validateToken();
                        if (!token || !user || !response) {
                            next('/login');
                        } else {
                            next();
                        }
                    },
                    component: () => import('@/views/operational/TypesProducts/TypesProducts.vue')
                }
            ]
        }
    ]
});

export default router;
