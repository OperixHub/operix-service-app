<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Axios, { loadCurrentSession } from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { setSession } from '@/service/AuthSession';
import { connectSocket } from '@/views/utils/computeds';
import { getFirstAllowedMenuPath } from '@/config/menu.config';

const router = useRouter();
const toast = useToast();

onMounted(async () => {
    try {
        const searchParams = new URLSearchParams(window.location.search || '');
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const params = searchParams.toString() ? searchParams : hashParams;
        const code = params.get('code');
        const state = params.get('state');
        const expectedState = sessionStorage.getItem('operix_oauth_state');
        const codeVerifier = sessionStorage.getItem('operix_oauth_verifier');
        const redirectUri = sessionStorage.getItem('operix_oauth_redirect_uri');

        if (!code || !state || state !== expectedState || !codeVerifier || !redirectUri) {
            throw new Error('Retorno Google inválido.');
        }

        const response = await Axios.post(API_CONFIG.AUTH.CALLBACK, {
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        });

        const payload = response.data;
        setSession(payload);
        const snapshot = await loadCurrentSession();
        connectSocket();

        sessionStorage.removeItem('operix_oauth_state');
        sessionStorage.removeItem('operix_oauth_verifier');
        sessionStorage.removeItem('operix_oauth_redirect_uri');

        // Novo usuário Google → redireciona para onboarding
        if (payload.is_new_user) {
            router.replace('/onboarding');
        } else {
            router.replace(getFirstAllowedMenuPath(snapshot.user, snapshot.permissions));
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro no Login Google',
            detail: error.response?.data?.msg || error.message || 'Não foi possível concluir login Google.',
            life: 5000
        });
        router.replace('/login');
    }
});
</script>

<template>
    <Toast />
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen">
        <ProgressSpinner />
    </div>
</template>
