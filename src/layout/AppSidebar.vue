<script setup>
import AppMenu from './AppMenu.vue';
import { onMounted, ref } from 'vue';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { getCurrentAccess } from '@/services/authSession';

const companyLogo = ref(getCurrentAccess()?.tenant_logo_url || '');
const companyName = ref(getCurrentAccess()?.tenant_name || getCurrentAccess()?.company_name || 'Opeflow');
onMounted(async () => {
    try {
        const response = await Axios.get(API_CONFIG.PROFILE_COMPANY);
        companyLogo.value = response.data?.logo_url || '';
        companyName.value = response.data?.name || companyName.value;
    } catch {
        companyLogo.value = '';
    }
});
</script>

<template>
    <div class="sidebar-brand">
        <img v-if="companyLogo" :src="companyLogo" alt="Logo da empresa" />
        <span>{{ companyLogo ? 'Logo da empresa' : companyName }}</span>
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
