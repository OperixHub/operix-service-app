<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { consumePkceState, persistSession } from '@/service/AuthSession';
import { loadAuthorizationSnapshot } from '@/service/Authorization';

const router = useRouter();
const message = ref('Finalizando autenticação...');
const severity = ref('info');

onMounted(async () => {
    try {
        const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
        const code = params.get('code');
        const returnedState = params.get('state');
        const { verifier, state } = consumePkceState();

        if (!code || !verifier || !state || state !== returnedState) {
            throw new Error('Resposta de autenticação inválida.');
        }

        const redirectUri = `${window.location.origin}${window.location.pathname}#/auth/callback`;
        const response = await Axios.post(API_CONFIG.AUTH.CALLBACK, {
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier
        });
        const payload = response.data || response;

        persistSession(payload);
        if (!payload.user?.onboarding_required) {
            await loadAuthorizationSnapshot();
        }
        router.replace(payload.user?.onboarding_required ? '/onboarding' : '/dashboard');
    } catch (error) {
        severity.value = 'error';
        message.value = error.response?.data?.msg || error.message || 'Não foi possível concluir o login.';
        setTimeout(() => router.replace('/login'), 2500);
    }
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="surface-card py-7 px-5 sm:px-8 text-center" style="border-radius: 24px">
            <ProgressSpinner v-if="severity !== 'error'" style="width: 48px; height: 48px" strokeWidth="4" />
            <Message :severity="severity" class="mt-4 mb-0">{{ message }}</Message>
        </div>
    </div>
</template>
