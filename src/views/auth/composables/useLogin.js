import Axios, { loadCurrentSession } from '@/service/Axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { loadingOpen, loadingClose } from '../../utils/computeds';
import { messageLogin, messageRegister, addMessage } from '../../utils/messages.js';
import { API_CONFIG } from '@/config/api.config';
import { setSession } from '@/service/AuthSession';
import { connectSocket } from '@/views/utils/computeds';
import { getFirstAllowedMenuPath } from '@/config/menu.config';
import { isEmail } from 'validator';

const base64UrlEncode = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

const generateRandomString = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return base64UrlEncode(bytes);
};

const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(plain));
};

export function useLogin() {
    const COD_REGISTER = 'R';
    const COD_LOGIN = 'L';

    const TYPE_FORM_INITIAL = 'I';
    const TYPE_FORM_REGISTER = 'R';
    const TYPE_FORM_LOGIN = 'L';

    const typeForm = ref(TYPE_FORM_INITIAL);

    const toast = useToast();
    const router = useRouter();
    const { layoutConfig } = useLayout();

    const email = ref('');
    const remember = ref(false);
    const password = ref('');
    const confirmPassword = ref('');
    const verificationUrl = ref('');

    messageLogin.value.length = 0;
    messageRegister.value.length = 0;

    const logoUrl = computed(() => {
        return `layout/images/logo-completo-transparente.png`;
    });

    const passwordsMatch = computed(() => {
        if (!password.value || !confirmPassword.value) {
            return null;
        }
        return password.value === confirmPassword.value;
    });

    /**
     * Verifica na API se o e-mail já está cadastrado e ativo.
     * Retorna { exists, active } ou lança erro.
     */
    const checkEmail = async () => {
        const response = await Axios.post(API_CONFIG.AUTH.CHECK_EMAIL, {
            email: email.value
        });
        return response.data;
    };

    /**
     * Registra novo usuário: cria tenant placeholder + usuário com permissões full.
     * Ao receber a sessão, redireciona para o onboarding.
     */
    const register = async () => {
        loadingOpen();
        try {
            const response = await Axios.post(API_CONFIG.AUTH.REGISTER, {
                email: email.value,
                password: password.value,
                confirm_password: confirmPassword.value
            });

            const payload = response.data;
            if (payload && payload.token) {
                setSession(payload);
                await loadCurrentSession();
                connectSocket();
                router.push('/onboarding');
            } else {
                toast.add({ severity: 'error', summary: 'Erro no Cadastro', detail: 'Resposta inválida do servidor.', life: 5000 });
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro no Cadastro', detail: error.response?.data?.msg || 'Erro ao registrar usuário.', life: 5000 });
        } finally {
            loadingClose();
        }
    };

    /**
     * Realiza login de usuário existente.
     * Vai direto ao app (não passa pelo onboarding pois o tenant já existe).
     */
    const login = async () => {
        loadingOpen();
        try {
            const response = await Axios.post(API_CONFIG.AUTH.LOGIN, {
                email: email.value,
                password: password.value,
                remember: remember.value
            });

            const payload = response.data;
            if (payload && payload.token) {
                setSession(payload);
                const snapshot = await loadCurrentSession();
                connectSocket();
                router.push(getFirstAllowedMenuPath(snapshot.user, snapshot.permissions));
            } else {
                toast.add({ severity: 'error', summary: 'Erro no Login', detail: 'Token inválido ou ausente.', life: 5000 });
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Informação Inválida', detail: error.response?.data?.msg || 'Erro ao fazer login.', life: 5000 });
        } finally {
            loadingClose();
        }
    };

    const loginWithGoogle = async () => {
        loadingOpen();
        try {
            const state = generateRandomString();
            const codeVerifier = generateRandomString();
            const codeChallenge = base64UrlEncode(await sha256(codeVerifier));
            const redirectUri = new URL('/oauth/callback.html', window.location.origin).toString();

            sessionStorage.setItem('operix_oauth_state', state);
            sessionStorage.setItem('operix_oauth_verifier', codeVerifier);
            sessionStorage.setItem('operix_oauth_redirect_uri', redirectUri);

            const response = await Axios.post(API_CONFIG.AUTH.AUTHORIZE, {
                redirect_uri: redirectUri,
                state,
                code_challenge: codeChallenge,
                identity_provider: 'google'
            });

            window.location.href = response.data.authorization_url;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Google indisponível', detail: error.response?.data?.msg || 'Erro ao iniciar login Google.', life: 5000 });
        } finally {
            loadingClose();
        }
    };

    /**
     * Lógica central do botão principal.
     * - TYPE_FORM_INITIAL: verifica o e-mail na API e decide qual form mostrar
     * - TYPE_FORM_REGISTER (COD_REGISTER): valida campos e registra
     * - TYPE_FORM_LOGIN (COD_LOGIN): valida campos e faz login
     */
    const validate = async (action) => {
        if (action === COD_REGISTER) {
            if (!email.value || !password.value || !confirmPassword.value) {
                addMessage('register', 'error', 'Preencha todos os campos obrigatórios.');
            } else if (password.value.length < 8) {
                addMessage('register', 'error', 'A senha deve ter no mínimo 8 caracteres.');
            } else if (password.value !== confirmPassword.value) {
                addMessage('register', 'error', 'As senhas informadas não conferem.');
            } else {
                await register();
            }
        } else if (action === COD_LOGIN) {
            if (!email.value || !password.value) {
                addMessage('login', 'error', 'Preencha todos os campos obrigatórios.');
            } else {
                await login();
            }
        } else {
            // Etapa inicial: verificar se o e-mail existe antes de decidir o form
            if (!email.value || !isEmail(email.value)) {
                addMessage('login', 'error', 'Informe um e-mail válido.');
                return;
            }

            loadingOpen();
            try {
                const { exists, active } = await checkEmail();
                if (exists && active) {
                    // Usuário existente e ativo → form de login
                    typeForm.value = TYPE_FORM_LOGIN;
                } else {
                    // Usuário inexistente ou inativo → form de cadastro
                    typeForm.value = TYPE_FORM_REGISTER;
                }
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Não foi possível verificar o e-mail.', life: 5000 });
            } finally {
                loadingClose();
            }
        }
    };

    const goToLogin = (shouldResetForm = false) => {
        if (shouldResetForm) {
            typeForm.value = TYPE_FORM_INITIAL;
            password.value = '';
            confirmPassword.value = '';
        }
        router.push('/login');
    };

    const goToForgotPassword = () => {
        window.location.hash = '/recuperar-senha';
    };

    const openVerificationUrl = () => {
        if (verificationUrl.value) {
            window.location.href = verificationUrl.value;
        }
    };

    return {
        ref,
        COD_REGISTER,
        COD_LOGIN,
        TYPE_FORM_INITIAL,
        TYPE_FORM_REGISTER,
        TYPE_FORM_LOGIN,
        typeForm,
        email,
        password,
        confirmPassword,
        passwordsMatch,
        verificationUrl,
        messageRegister,
        messageLogin,
        remember,
        logoUrl,
        validate,
        loginWithGoogle,
        goToLogin,
        openVerificationUrl,
        goToForgotPassword,
    };
}
