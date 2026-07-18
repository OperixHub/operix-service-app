<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { sessionState } from '@/services/authSession';
import { buildMenu } from '@/layout/composables/menu';

const model = computed(() => buildMenu(sessionState.currentUser.value, sessionState.currentPermissions.value));
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
