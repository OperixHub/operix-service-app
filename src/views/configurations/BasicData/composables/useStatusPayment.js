import Axios from '@/service/Axios';
import { ref } from 'vue';
import { loadingOpen, loadingClose } from '../../../utils/computeds';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useForm } from 'vee-validate';

import { API_CONFIG } from '@/config/api.config';

export function useStatusPayment() {
    const MODEL_STATUS_PAYMENT = {
        description: null,
        color: {severity: null, hex: null },
        default: false
    };
    const COLOR_DEFAULT = '3B82F6';
    const URI_STATUS_PAYMENT = API_CONFIG.OPERATIONAL.STATUS_PAYMENT;
    const ISSET_STATUS_PAYMENT_DEFAULT = ref(false);

    const toast = useToast();
    const confirmPopup = useConfirm();
    const { handleSubmit } = useForm();

    const dataGetStatusPayment = ref([]);
    const dataPostStatusPayment = ref({
        description: '',
        color: COLOR_DEFAULT,
        default: false
    });

    const getStatusPayment = async () => {
        loadingOpen();
        try {
            const response = await Axios.get(URI_STATUS_PAYMENT);
            dataGetStatusPayment.value = response.data;
            dataGetStatusPayment.value.forEach((value) => {
                if (value.color) {
                    value.color = JSON.parse(value.color);
                }
                if (value.is_default === true) {
                    ISSET_STATUS_PAYMENT_DEFAULT.value = true;
                }
            });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao buscar status de pagamento', life: 5000 });
        } finally {
            loadingClose();
        }
    };

    const deleteStatusPayment = async (id) => {
        loadingOpen();
        try {
            const response = await Axios.delete(URI_STATUS_PAYMENT + '/' + id);
            toast.add({ severity: 'success', summary: 'Deletado', detail: response.msg, life: 5000 });
            await getStatusPayment();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao deletar status de pagamento', life: 5000 });
        } finally {
            loadingClose();
        }
    };

    const confirmDeleteStatusPayment = (event, id) => {
        confirmPopup.require({
            target: event.target,
            message: 'Deseja realmente excluir este status?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                deleteStatusPayment(id);
            }
        });
    };

    const clearFields = () => dataPostStatusPayment.value = {
        description: '',
        color: COLOR_DEFAULT,
        default: false
    };


    const postStatusPayment = async (statusPayment) => {
        loadingOpen();
        try {
            const response = await Axios.post(URI_STATUS_PAYMENT, {
                description: statusPayment.description,
                color: JSON.stringify(statusPayment.color),
                default: statusPayment.default
            });
            toast.add({ severity: 'success', summary: 'Adicionado', detail: response.msg, life: 5000 });
            clearFields();
            await getStatusPayment();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao adicionar status de pagamento', life: 5000 });
        } finally {
            loadingClose();
        }
    };

    const onSubmit = handleSubmit(async () => {
        if (dataPostStatusPayment.value.description && dataPostStatusPayment.value.color) {
            MODEL_STATUS_PAYMENT.description = dataPostStatusPayment.value.description;
            MODEL_STATUS_PAYMENT.color.hex = `#${dataPostStatusPayment.value.color}`;
            MODEL_STATUS_PAYMENT.default = dataPostStatusPayment.value.default == true;
            await postStatusPayment(MODEL_STATUS_PAYMENT);
        } else {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos!', life: 5000 });
        }
    });

    return {
        dataGetStatusPayment,
        dataPostStatusPayment,
        getStatusPayment,
        confirmDeleteStatusPayment,
        onSubmit, 
        ISSET_STATUS_PAYMENT_DEFAULT
    };
}
