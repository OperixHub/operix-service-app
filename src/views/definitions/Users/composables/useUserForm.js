import Axios from '@/service/Axios';
import { ref } from 'vue';
import { loadingOpen, loadingClose } from '../../../utils/computeds';
import { useToast } from 'primevue/usetoast';
import { messageAddUser, addMessage } from '../../../utils/messages.js';
import { API_CONFIG } from '@/config/api.config';

export function useUserForm(getUsers) {
    const toast = useToast();
    const dataPostUser = ref({
        admin: false,
        modules: []
    });
    const displayModalAdd = ref(false);
    const moduleOptions = [
        {
            label: 'Operacional',
            value: 'operational',
            description: 'Serviços, situações e tipos de produto'
        },
        {
            label: 'Organização',
            value: 'organization',
            description: 'Gestão de usuários'
        }
    ];

    const openModalAdd = () => {
        messageAddUser.value.length = 0;
        displayModalAdd.value = true;
    };

    const closeModal = () => {
        if (displayModalAdd.value === true) {
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
            await Axios.post(API_CONFIG.IDENTITY.USERS, {
                name: dataPostUser.value.name || dataPostUser.value.username,
                username: dataPostUser.value.username,
                email: dataPostUser.value.email,
                password: dataPostUser.value.password,
                admin: Boolean(dataPostUser.value.admin),
                modules: dataPostUser.value.admin ? [] : dataPostUser.value.modules
            });
            toast.add({ severity: 'success', summary: 'Adicionado', detail: 'Usuário adicionado com sucesso', life: 5000 });
            await getUsers();
            closeModal();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar usuário', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    const validatePostUser = async () => {
        if (!dataPostUser.value.username || !dataPostUser.value.email || !dataPostUser.value.password || !dataPostUser.value.confirmPassword) {
            addMessage('addUser', 'error', 'Preencha todos os campos obrigatórios.');
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
        moduleOptions,
        displayModalAdd,
        openModalAdd,
        closeModal,
        validatePostUser
    };
}
