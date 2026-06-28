<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { buildNavigation } from '@/router/navigation.registry';
import { getPermissionDetails, getPermissions } from '@/service/AuthSession';

const model = computed(() => buildNavigation({
    permissions: getPermissions(),
    permissionDetails: getPermissionDetails()
}));
</script>

<template>
    <div class="sidebar">
        <ul class="layout-menu">
            <template v-for="(item, i) in model" :key="item.to || item.label">
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
    height: 90%;
}
</style>
