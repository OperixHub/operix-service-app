import Axios from '@/service/Axios';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { loadingOpen, loadingClose, socket } from '../../utils/computeds';
import { messageLogin, addMessage } from '../../utils/messages.js';
import { API_CONFIG } from '@/config/api.config';
import { persistSession, savePkceState } from '@/service/AuthSession';
import { createPkcePair, randomString } from '@/service/pkce';
import { loadAuthorizationSnapshot } from '@/service/Authorization';

export function useLogin() {
    const toast = useToast();
    const router = useRouter();
    const { layoutConfig } = useLayout();

    const username = ref('');
    const password = ref('');
    const remember = ref(false);
    const authConfig = ref(null);
    const loadingConfig = ref(true);

    messageLogin.value.length = 0;

    const logoUrl = computed(() => {
        return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.png`;
    });

    const login = async () => {
        loadingOpen();
        try {
            const response = await Axios.post(API_CONFIG.AUTH.LOGIN, {
                username: username.value,
                password: password.value,
                remember: remember.value
            });

            const payload = response.data;
            if (payload && payload.token) {
                persistSession(payload);
                socket.auth.token = payload.token;
                if (socket.disconnected) {
                    socket.connect();
                }
                await loadAuthorizationSnapshot();
                router.push(payload.user?.onboarding_required ? '/onboarding' : '/dashboard');
            } else {
                toast.add({ severity: 'error', summary: 'Erro no Login', detail: 'Token inválido ou ausente.', life: 5000 });
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Informação Inválida', detail: error.response?.data?.msg || "Erro ao fazer login", life: 5000 });
        } finally {
            loadingClose();
        }
    };

    const loadAuthConfig = async () => {
        loadingConfig.value = true;
        try {
            const response = await Axios.get(API_CONFIG.AUTH.CONFIG);
            authConfig.value = response.data;
        } catch (error) {
            authConfig.value = null;
            addMessage('login', 'warn', 'Não foi possível carregar a configuração de autenticação.');
        } finally {
            loadingConfig.value = false;
        }
    };

    const loginWithGoogle = async () => {
        loadingOpen();
        try {
            const pkce = await createPkcePair();
            const state = randomString(24);
            savePkceState({ verifier: pkce.verifier, state });

            const redirectUri = `${window.location.origin}${window.location.pathname}#/auth/callback`;
            const response = await Axios.post(API_CONFIG.AUTH.AUTHORIZE, {
                redirect_uri: redirectUri,
                state,
                code_challenge: pkce.challenge,
                identity_provider: 'google'
            });

            const payload = response.data;
            window.location.href = payload.authorization_url;
        } catch (error) {
            addMessage('login', 'error', error.response?.data?.msg || 'Erro ao iniciar login com Google.');
            loadingClose();
        }
    };

    const validate = async () => {
        if (!username.value && !password.value) {
            addMessage('login', 'error', 'Preencha todos os campos obrigatórios.');
        } else {
            await login();
        }
    };

    onMounted(loadAuthConfig);

    return {
        username,
        password,
        remember,
        authConfig,
        loadingConfig,
        logoUrl,
        messageLogin,
        validate,
        loginWithGoogle
    };
}
