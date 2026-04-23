import Axios from '@/service/Axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { loadingOpen, loadingClose } from '../../utils/computeds';
import { API_CONFIG } from '@/config/api.config';
import { getApiErrorMessage } from '@/service/api-utils';

// Local message array for reactivity
const messageRegister = ref([]);

function addMessage(type, severity, content) {
    messageRegister.value = [{ severity, content }];
}

export function useRegister() {
    const toast = useToast();
    const router = useRouter();
    const { layoutConfig } = useLayout();

    const name = ref('');
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const tenant = ref('');

    messageRegister.value.length = 0;

    const logoUrl = computed(() => {
        return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.png`;
    });

    const register = async () => {
        loadingOpen();
        try {
            const response = await Axios.post(API_CONFIG.AUTH.REGISTER, {
                name: name.value,
                username: username.value,
                email: email.value,
                password: password.value,
                tenant: tenant.value
            });

            if (response?.success) {
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta criada! Você pode fazer login agora.', life: 5000 });
                router.push('/login');
            } else {
                toast.add({ severity: 'error', summary: 'Erro no Registro', detail: 'Tente novamente mais tarde.', life: 5000 });
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Informação Inválida', detail: getApiErrorMessage(error, 'Erro ao registrar usuário'), life: 5000 });
        } finally {
            loadingClose();
        }
    };

    const validate = async () => {
        if (!name.value || !username.value || !email.value || !password.value || !tenant.value) {
            addMessage('register', 'error', 'Preencha todos os campos obrigatórios.');
        } else {
            await register();
        }
    };
    
    const goToLogin = () => {
        router.push('/login');
    };

    return {
        name,
        username,
        email,
        password,
        tenant,
        logoUrl,
        messageRegister,
        validate,
        goToLogin
    };
}
