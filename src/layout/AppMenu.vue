<script setup>
import { ref, computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';


const currentUser = computed(() => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : {};
    } catch (e) {
        return {};
    }
});

const modelAdmin = ref([
    {
        items: [
            { label: 'Início', icon: 'pi pi-fw pi-home', to: '/dashboard' },
            {
                label: 'Operacional',
                icon: 'pi pi-fw pi-wrench',
                items: [
                    { label: 'Serviços', icon: 'pi pi-fw pi-ticket', to: '/operacional/servicos' },
                    { label: 'Situações', icon: 'pi pi-fw pi-sitemap', to: '/operacional/situacoes' },
                    { label: 'Tipos de Produto', icon: 'pi pi-fw pi-box', to: '/operacional/tipos-de-produto' }
                ]
            }
        ]
    },

    {
        items: [
            {
                label: 'Inventário',
                icon: 'pi pi-fw pi-box',
                items: [
                    {
                        label: 'Estoque',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/inventario/estoque'
                    }
                ]
            }
        ]
    },

    {
        items: [
            {
                label: 'Definições',
                icon: 'pi pi-fw pi-cog',
                items: [
                    { label: 'Usuários', icon: 'pi pi-fw pi-user', to: '/definicoes/usuarios' },
                ]
            }
        ]
    }
]);

const model = ref([
    {
        items: [
            { label: 'Início', icon: 'pi pi-fw pi-home', to: '/dashboard' },
            {
                label: 'Operacional',
                icon: 'pi pi-fw pi-wrench',
                items: [
                    { label: 'Serviços', icon: 'pi pi-fw pi-ticket', to: '/operacional/servicos' }
                ]
            }
        ]
    }
]);
</script>

<template>
    <div class="sidebar">
        <ul v-if="currentUser?.admin" class="layout-menu">
            <template v-for="(item, i) in modelAdmin" :key="item">
                <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                <li v-if="item.separator" class="menu-separator"></li>
            </template>
        </ul>
        <ul v-if="!currentUser?.admin" class="layout-menu">
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
