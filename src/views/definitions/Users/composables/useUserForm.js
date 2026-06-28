import Axios from '@/service/Axios';
import { ref } from 'vue';
import { loadingOpen, loadingClose } from '../../../utils/computeds';
import { messageAddUser, addMessage } from '../../../utils/messages.js';
import { useToast } from 'primevue/usetoast';
import { API_CONFIG } from '@/config/api.config';

export function useUserForm(getUsers) {
    const toast = useToast();

    const dataPostUser = ref({});
    const moduleOptions = ref([]);
    const displayModalAdd = ref(false);

    const openModalAdd = () => {
        messageAddUser.value.length = 0;
        displayModalAdd.value = true;
    };

    const closeModal = () => {
        if (displayModalAdd.value) {
            displayModalAdd.value = false;
            dataPostUser.value = {};
        }
    };

    const loadModuleOptions = async () => {
        try {
            const response = await Axios.get(API_CONFIG.IDENTITY.PERMISSIONS_CATALOG);
            const modules = response.data?.modules || [];
            moduleOptions.value = modules
                .filter((module) => module.key !== 'dashboard')
                .map((module) => ({
                    key: module.key,
                    label: module.label,
                    description: module.description
                }));
        } catch (error) {
            moduleOptions.value = [
                { key: 'operational', label: 'Operacional', description: 'Fluxos operacionais' },
                { key: 'inventory', label: 'Inventário', description: 'Gestão de estoque' },
                { key: 'organization', label: 'Organização', description: 'Usuários e configurações' },
                { key: 'notifications', label: 'Notificações', description: 'Alertas e informações do sistema' }
            ];
            console.error(error);
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
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao adicionar usuário', life: 5000 });
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
        loadModuleOptions,
        validatePostUser
    };
}
