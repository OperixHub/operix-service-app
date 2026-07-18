<script setup>
import Axios, { loadCurrentSession } from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { setSession } from '@/services/authSession';
import { connectSocket } from '@/views/utils/computeds';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const errorMessage = ref('');

const token = computed(() => route.query.token || '');

onMounted(async () => {
    if (!token.value) {
        errorMessage.value = 'Token de verificação ausente.';
        loading.value = false;
        return;
    }

    try {
        const response = await Axios.post(API_CONFIG.AUTH.VERIFY_EMAIL, { token: token.value });
        setSession(response.data);
        const session = await loadCurrentSession();
        connectSocket();
        toast.add({ severity: 'success', summary: 'E-mail verificado', detail: 'Complete seu onboarding para começar.', life: 5000 });
        router.replace(session.user?.onboarding_required ? '/integracao' : '/painel');
    } catch (error) {
        errorMessage.value = error.response?.data?.msg || 'Não foi possível verificar seu e-mail.';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <Toast />
    <div class="auth-page surface-ground flex align-items-center justify-content-center">
        <div class="auth-shell">
            <div class="auth-card surface-card py-7 px-5 sm:px-8 text-center">
                <i class="pi pi-envelope text-5xl text-primary mb-4" />
                <h1 class="text-900 text-3xl font-medium mb-3">Verificação de e-mail</h1>
                <p v-if="loading" class="text-600">Validando seu e-mail...</p>
                <Message v-else-if="errorMessage" severity="error">{{ errorMessage }}</Message>
                <p v-else class="text-600">E-mail verificado. Redirecionando...</p>
            </div>
        </div>
    </div>
</template>
