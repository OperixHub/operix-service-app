import Axios from '@/service/Axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { loadingOpen, loadingClose } from '../../utils/computeds';
import { messageLogin, addMessage } from '../../utils/messages.js';
import { API_CONFIG } from '@/config/api.config';
import { getApiData, getApiErrorMessage } from '@/service/api-utils';
import { setSession } from '@/core/auth/session';
import { loadCurrentPermissions, resetPermissionsState } from '@/core/permissions/permissions.store';

export function useLogin() {
    const toast = useToast();
    const router = useRouter();
    const { layoutConfig } = useLayout();

    const username = ref('');
    const password = ref('');
    const remember = ref(false);

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

            const payload = getApiData(response, {});
            if (payload && payload.token) {
                setSession(payload);
                resetPermissionsState();
                await loadCurrentPermissions(true);
                router.push('/dashboard');
            } else {
                toast.add({ severity: 'error', summary: 'Erro no Login', detail: 'Token inválido ou ausente.', life: 5000 });
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Informação Inválida', detail: getApiErrorMessage(error, 'Erro ao fazer login'), life: 5000 });
        } finally {
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

    return {
        username,
        password,
        remember,
        logoUrl,
        messageLogin,
        validate
    };
}
