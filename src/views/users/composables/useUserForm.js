import Axios from '@/services/axios';
import { ref } from 'vue';
import { loadingOpen, loadingClose } from '@views/utils/computeds';
import { useToast } from 'primevue/usetoast';
import { messageAddUser, addMessage } from '@views/utils/messages.js';
import { API_CONFIG } from '@/services/api';

export function useUserForm(getUsers) {
    const toast = useToast();
    const dataPostUser = ref({
        admin: false,
        modules: []
    });
    const displayModalAdd = ref(false);
    const companyAccessCode = ref('');
    const moduleOptions = [
        {
            label: 'Serviços',
            value: 'servicos',
            description: 'Atendimentos e ordens de serviço'
        },
        {
            label: 'Status de Serviço',
            value: 'status-servico',
            description: 'Cadastro de status do atendimento'
        },
        {
            label: 'Status de Pagamento',
            value: 'status-pagamento',
            description: 'Cadastro de status financeiros'
        },
        {
            label: 'Tipos de Produto',
            value: 'tipos-produto',
            description: 'Cadastro dos produtos atendidos'
        },
        {
            label: 'Estoque',
            value: 'estoque',
            description: 'Itens e saldos do estoque'
        },
        {
            label: 'Vendas',
            value: 'vendas',
            description: 'Registro de vendas'
        },
        {
            label: 'Organização',
            value: 'organizacao',
            description: 'Gestão de usuários'
        },
        {
            label: 'Notificações',
            value: 'notificacoes',
            description: 'Alertas da operação'
        }
    ];

    const openModalAdd = async () => {
        messageAddUser.value.length = 0;
        try {
            const response = await Axios.get(API_CONFIG.PROFILE_COMPANY);
            companyAccessCode.value = response.data?.access_code || response.access_code || '';
        } catch {
            companyAccessCode.value = '';
        }
        displayModalAdd.value = true;
    };

    const closeModal = () => {
        if (displayModalAdd.value) {
            displayModalAdd.value = false;
            dataPostUser.value = {
                admin: false,
                modules: []
            };
        }
    };

    const postUser = async () => {
        loadingOpen();
        try {
            await Axios.post(API_CONFIG.USERS, {
                name: dataPostUser.value.name || dataPostUser.value.username,
                username: dataPostUser.value.username,
                password: dataPostUser.value.password,
                admin: Boolean(dataPostUser.value.admin),
                modules: dataPostUser.value.admin ? [] : dataPostUser.value.modules
            });
            toast.add({ severity: 'success', summary: 'Adicionado', detail: 'Usuário adicionado com sucesso', life: 5000 });
            await getUsers();
            closeModal();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao adicionar usuário', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    const validatePostUser = async () => {
        if (!dataPostUser.value.name || !dataPostUser.value.username || !dataPostUser.value.password || !dataPostUser.value.confirmPassword) {
            addMessage('addUser', 'error', 'Preencha todos os campos obrigatórios.');
        } else if (!/^[A-Za-z0-9._-]{3,50}$/.test(dataPostUser.value.username)) {
            addMessage('addUser', 'error', 'O usuário deve ter de 3 a 50 caracteres e usar apenas letras, números, ponto, hífen ou sublinhado.');
        } else if (dataPostUser.value.password.length < 8) {
            addMessage('addUser', 'error', 'A senha deve ter no mínimo 8 caracteres.');
        } else if (dataPostUser.value.password !== dataPostUser.value.confirmPassword) {
            addMessage('addUser', 'error', 'Senhas incoerentes.');
        } else if (!dataPostUser.value.admin && !dataPostUser.value.modules?.length) {
            addMessage('addUser', 'error', 'Selecione ao menos um módulo de acesso ou marque o usuário como administrador.');
        } else {
            await postUser();
        }
    };

    return {
        dataPostUser,
        companyAccessCode,
        moduleOptions,
        displayModalAdd,
        openModalAdd,
        closeModal,
        validatePostUser
    };
}
