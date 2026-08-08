<script setup>
import AppMenu from './AppMenu.vue';
</script>

<template>
    <div class="sidebar-brand">
        <img src="/layout/images/opeflow-icon.svg" alt="" />
        <span>Opeflow</span>
    </div>
    <app-menu></app-menu>
</template>

<style scoped>
.sidebar-brand {
    display: flex;
    align-items: center;
    gap: .75rem;
    height: 4.5rem;
    padding: 0 .75rem;
    border-bottom: 1px solid var(--surface-border);
    color: var(--text-color);
    font-size: 1.3rem;
    font-weight: 700;
}

.sidebar-brand img {
    width: 2rem;
    height: 2rem;
    border-radius: 7px;
}
</style>
