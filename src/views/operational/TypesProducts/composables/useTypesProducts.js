import Axios from '@/service/Axios';
import { ref } from 'vue';
import { loadingOpen, loadingClose } from '../../../utils/computeds';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useForm } from 'vee-validate';

import { API_CONFIG } from '@/config/api.config';
import { getApiData, getApiErrorMessage, getApiMessage } from '@/service/api-utils';

export function useTypesProducts() {
    const URI_TYPES_PRODUCT = API_CONFIG.OPERATIONAL.TYPES_PRODUCT;

    const toast = useToast();
    const confirmPopup = useConfirm();
    const { handleSubmit } = useForm();

    const dataGetTypesProduct = ref([]);
    const dataPostTypesProduct = ref([]);

    const getTypesProduct = async () => {
        loadingOpen();
        try {
            const response = await Axios.get(URI_TYPES_PRODUCT);
            dataGetTypesProduct.value = getApiData(response, []);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao buscar tipos de produto'), life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    const deleteTypesProduct = async (id) => {
        loadingOpen();
        try {
            const response = await Axios.delete(URI_TYPES_PRODUCT + '/' + id);
            toast.add({ severity: 'success', summary: 'Deletado', detail: getApiMessage(response, 'Tipo de produto deletado com sucesso'), life: 5000 });
            await getTypesProduct();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao deletar tipo de produto'), life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    const confirmDeleteTypesProduct = (event, id) => {
        confirmPopup.require({
            target: event.target,
            message: 'Deseja realmente excluir este tipo de produto?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                deleteTypesProduct(id);
            }
        });
    };

    const clearFields = () => {
        dataPostTypesProduct.value = [];
    };

    const postTypesProduct = async () => {
        loadingOpen();
        try {
            const response = await Axios.post(URI_TYPES_PRODUCT, {
                name: dataPostTypesProduct.value.name
            });
            toast.add({ severity: 'success', summary: 'Adicionado', detail: getApiMessage(response, 'Novo tipo de produto adicionado com sucesso'), life: 5000 });
            clearFields();
            await getTypesProduct();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao adicionar tipo de produto'), life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    const onSubmit = handleSubmit(async () => {
        if (dataPostTypesProduct.value.name) {
            await postTypesProduct();
        } else {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos!', life: 5000 });
        }
    });

    return {
        dataGetTypesProduct,
        dataPostTypesProduct,
        getTypesProduct,
        confirmDeleteTypesProduct,
        onSubmit
    };
}
