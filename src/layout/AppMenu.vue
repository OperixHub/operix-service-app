<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { getStoredUser } from '@/core/auth/session';
import { hasPermission, permissionsStore } from '@/core/permissions/permissions.store';
import { sidebarCatalog } from '@/core/permissions/sidebar.catalog';

const currentUser = computed(() => {
    return getStoredUser() || {};
});

const menuModel = computed(() =>
    sidebarCatalog
        .map((section) => ({
            label: section.label,
            items: section.items.filter((item) => hasPermission(item.permission))
        }))
        .filter((section) => section.items.length > 0)
);

const userRoleLabel = computed(() => currentUser.value?.admin ? 'Administrador' : 'Acesso personalizado');
</script>

<template>
    <div class="sidebar">
        <div class="sidebar-card">
            <span class="sidebar-card__eyebrow">Operix Workspace</span>
            <strong class="sidebar-card__title">{{ currentUser?.tenant || 'Tenant atual' }}</strong>
            <span class="sidebar-card__user">{{ currentUser?.name || currentUser?.username || 'Usuário autenticado' }}</span>
            <Tag :value="userRoleLabel" severity="contrast" />
        </div>

        <ul class="layout-menu">
            <template v-for="(item, i) in menuModel" :key="`${item.label}-${permissionsStore.effectivePermissions.length}`">
                <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                <li v-if="item.separator" class="menu-separator"></li>
            </template>
        </ul>
    </div>
</template>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
}

.sidebar-card {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: linear-gradient(160deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.9));
    color: #f8fafc;
    box-shadow: 0 18px 35px rgba(15, 23, 42, 0.22);
}

.sidebar-card__eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.72);
}

.sidebar-card__title {
    font-size: 1rem;
}

.sidebar-card__user {
    color: rgba(226, 232, 240, 0.85);
    font-size: 0.9rem;
}
</style>
