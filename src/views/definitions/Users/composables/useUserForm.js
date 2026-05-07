import Axios from '@/service/Axios';
import { ref } from 'vue';
import { loadingOpen, loadingClose } from '../../../utils/computeds';
import { messageAddUser, addMessage } from '../../../utils/messages.js';
import { useToast } from 'primevue/usetoast';
import { API_CONFIG } from '@/config/api.config';

export function useUserForm(getUsers) {
    const toast = useToast();

    const dataPostUser = ref([]);
    const moduleOptions = ref([
        { key: 'operational', label: 'Operacional' },
        { key: 'inventory', label: 'Inventário' },
        { key: 'organization', label: 'Organização' },
        { key: 'notifications', label: 'Notificações' }
    ]);
    const displayModalAdd = ref(false);

    const openModalAdd = () => {
        messageAddUser.value.length = 0;
        displayModalAdd.value = true;
    };

    const closeModal = () => {
        if (displayModalAdd.value === true) {
            displayModalAdd.value = false;
            dataPostUser.value = [];
        }
    };

    const postUser = async () => {
        loadingOpen();
        try {
            await Axios.post(API_CONFIG.IDENTITY.USERS, {
                name: dataPostUser.value.name,
                username: dataPostUser.value.username,
                email: dataPostUser.value.email,
                password: dataPostUser.value.password,
                admin: Boolean(dataPostUser.value.admin),
                role_title: dataPostUser.value.role_title || null,
                modules: dataPostUser.value.modules || []
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
        if (!dataPostUser.value.name || !dataPostUser.value.username || !dataPostUser.value.email || !dataPostUser.value.password || !dataPostUser.value.confirmPassword) {
            addMessage('addUser', 'error', 'Preencha todos os campos obrigatórios.');
        } else if (dataPostUser.value.password !== dataPostUser.value.confirmPassword) {
            addMessage('addUser', 'error', 'Senhas incoerentes.');
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
