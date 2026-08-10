import Axios from '@/services/axios';
import { ref, inject } from 'vue';
import { loadingOpen, loadingClose } from '@views/utils/computeds';
import { useToast } from 'primevue/usetoast';
import { messageAddService, addMessage } from '@views/utils/messages.js';
import { API_CONFIG } from '@/services/api';

export function useDialogServiceAdd() {
    const toast = useToast();
    const displayModalAdd = inject('displayDialogAdd');
    const dataPostService = ref({});
    const clients = ref([]);
    const users = ref([]);

    const statusServiceMapping = ref([]);
    const getStatusService = async () => {
        try {
            const response = await Axios.get(API_CONFIG.STATUS_SERVICE);
            statusServiceMapping.value = response.data;
            statusServiceMapping.value.forEach((value) => {
                if (value.color) {
                    value.color = JSON.parse(value.color);
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const typesProductOptions = ref([]);
    const getTypesProduct = async () => {
        try {
            const response = await Axios.get(API_CONFIG.TYPES_PRODUCT);
            typesProductOptions.value = response.data.map((item) => item.name);
        } catch (error) {
            console.error(error);
        }
    };

    const getClients = async () => {
        try {
            clients.value = (await Axios.get(API_CONFIG.CLIENTS)).data || [];
        } catch (error) { console.error(error); }
    };
    const getUsers = async () => { try { users.value = (await Axios.get(API_CONFIG.USERS)).data || []; } catch (error) { console.error(error); } };

    const selectClient = (client) => {
        if (!client) return;
        dataPostService.value.client = client.full_name;
        dataPostService.value.telephone = client.phone;
        dataPostService.value.adress = client.address || '';
    };

    const closeModal = () => {
        if (displayModalAdd.value === true) {
            messageAddService.value.length = 0;
            displayModalAdd.value = false;
            dataPostService.value.product = '';
            dataPostService.value.client_id = null;
            dataPostService.value.client = '';
            dataPostService.value.telephone = '';
            dataPostService.value.adress = '';
            dataPostService.value.status = '';
            dataPostService.value.observation = '';
            dataPostService.value.responsible_user_id = null;
        }
    };

    const postService = async () => {
        loadingOpen();
        try {
            await Axios.post(API_CONFIG.SERVICES, {
                product: dataPostService.value.product,
                client_id: dataPostService.value.client_id,
                client: dataPostService.value.client,
                telephone: dataPostService.value.telephone,
                adress: dataPostService.value.adress,
                status_id: dataPostService.value.status.id,
                observation: dataPostService.value.observation,
                responsible_user_id: dataPostService.value.responsible_user_id,
                created_at: dataPostService.value.created_at
            });
            toast.add({ severity: 'success', summary: 'Adicionado', detail: 'Serviço adicionado com sucesso', life: 5000 });
            closeModal();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar serviço', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    const validatePostService = async () => {
        if (!dataPostService.value.product || !dataPostService.value.client_id || !dataPostService.value.telephone || !dataPostService.value.status.id) {
            addMessage('addService', 'error', 'Preencha todos os campos obrigatórios.');
        } else {
            await postService();
        }
    };

    const initDate = () => {
        dataPostService.value.created_at = new Date().toISOString().slice(0, 10);
    };

    return {
        displayModalAdd,
        dataPostService,
        statusServiceMapping,
        typesProductOptions,
        messageAddService,
        getStatusService,
        getTypesProduct,
        clients,
        getClients,
        users,
        getUsers,
        selectClient,
        validatePostService,
        closeModal,
        initDate
    };
}
