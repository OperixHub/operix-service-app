import Axios, { loadCurrentSession } from '@/services/axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { loadingOpen, loadingClose } from '../../utils/computeds';
import { messageLogin, messageRegister, addMessage } from '../../utils/messages.js';
import { API_CONFIG } from '@/services/api';
import { setSession } from '@/services/authSession';
import { connectSocket } from '@/views/utils/computeds';
import { getFirstAllowedMenuPath } from '@/layout/composables/menu';
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
    const email = ref('');
    const remember = ref(false);
    const password = ref('');
    const confirmPassword = ref('');

    messageLogin.value.length = 0;
    messageRegister.value.length = 0;

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
                const snapshot = await loadCurrentSession();
                connectSocket();
                router.push(
                    snapshot.user?.onboarding_required
                        ? '/onboarding'
                        : getFirstAllowedMenuPath(snapshot.user, snapshot.permissions)
                );
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
     * Usa o estado persistido para retomar o onboarding quando necessário.
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
                router.push(
                    snapshot.user?.onboarding_required
                        ? '/onboarding'
                        : getFirstAllowedMenuPath(snapshot.user, snapshot.permissions)
                );
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

            sessionStorage.setItem('opeflow_oauth_state', state);
            sessionStorage.setItem('opeflow_oauth_verifier', codeVerifier);
            sessionStorage.setItem('opeflow_oauth_redirect_uri', redirectUri);

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

    return {
        TYPE_FORM_INITIAL,
        TYPE_FORM_REGISTER,
        TYPE_FORM_LOGIN,
        typeForm,
        email,
        password,
        confirmPassword,
        messageRegister,
        messageLogin,
        validate,
        loginWithGoogle,
        goToLogin,
        goToForgotPassword,
    };
}
