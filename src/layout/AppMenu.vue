<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { buildNavigation } from '@/router/navigation.registry';
import { getPermissions } from '@/service/AuthSession';

const model = computed(() => [{ items: buildNavigation(getPermissions()) }]);
</script>

<template>
    <div class="sidebar">
        <ul class="layout-menu">
            <template v-for="(item, i) in model" :key="item">
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
