import Axios from '@/services/axios';
import pdfGenerator from '@/services/pdfGenerator';
import { ref, provide } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { messageAddService, messageAddEstimateOSSimple, messageAddEstimateOSComplete, messageEditInfoClient, messageUpdateStatusService, messageUpdateStatusPayment, addMessage } from '@views/utils/messages.js';
import { socket, formatData, sendWhatsAppMessage, sendInfoClientsWhats, loadingOpen, loadingClose, formatTelephone} from '@views/utils/computeds.js';

import { API_CONFIG } from '@/services/api';

export function useServices() {
    const URI_STATUS_SERVICE = API_CONFIG.STATUS_SERVICE;
    const URI_STATUS_PAYMENT = API_CONFIG.STATUS_PAYMENT;
    const URI_TYPES_PRODUCT = API_CONFIG.TYPES_PRODUCT;
    const URI_SERVICES = API_CONFIG.SERVICES;
    const URI_ORDER_OF_SERVICE = API_CONFIG.ORDERS_OF_SERVICE;
    const URI_STOCK = API_CONFIG.STOCK;

    const toast = useToast();
    const confirmPopup = useConfirm();

    /* Service Status */
    const statusServiceOptions = ref([]);
    const statusServiceMapping = ref([]);
    const getStatusService = async () => {
        try {
            const response = await Axios.get(URI_STATUS_SERVICE);
            statusServiceOptions.value = response.data.map((item) => item.id.toString());
            statusServiceMapping.value = response.data;
            statusServiceMapping.value.forEach((value) => {
                if (value.color) value.color = JSON.parse(value.color);
            });
        } catch (error) {
            console.error(error);
        }
    };
    const getStyleStatusService = (id) => { 
        return statusServiceMapping.value.find((item) => item.id === id) || null; 
    };

    /* Payment Status */
    const statusPaymentOptions = ref([]);
    const statusPaymentMapping = ref([]);
    const getStatusPayment = async () => {
        try {
        
            const response = await Axios.get(URI_STATUS_PAYMENT);
            statusPaymentOptions.value = response.data.map((item) => item.id.toString());
            statusPaymentMapping.value = response.data;
            statusPaymentMapping.value.forEach((value) => {
                if (value.color) value.color = JSON.parse(value.color);
            });
        } catch (error) {
            console.error(error);
        }
    };
    const getStyleStatusPayment = (id) => {
        return statusPaymentMapping.value.find((item) => item.id === id) || null;
    };

    /* Products Types */
    const typesProductOptions = ref([]);
    const getTypesProduct = async () => {
        try {
            const response = await Axios.get(URI_TYPES_PRODUCT);
            typesProductOptions.value = response.data.map((item) => item.name);
        } catch (error) {
            console.error(error);
        }
    };

    /* Service parts */
    const stockOptions = ref([]);
    const rawStock = ref([]);
    const displayModalServicePart = ref(false);
    const positionModalServicePart = ref('top');
    const selectedServicePartContext = ref({});
    const servicePartLoading = ref(false);
    const dataServicePart = ref({
        stock_id: null,
        quantity: 1,
        unit_price: null,
        serial_number: ''
    });

    const resetServicePartForm = () => {
        dataServicePart.value = {
            stock_id: null,
            quantity: 1,
            unit_price: null,
            serial_number: ''
        };
    };

    const getStockOptions = async () => {
        const response = await Axios.get(URI_STOCK);
        rawStock.value = response.data || [];
        stockOptions.value = rawStock.value.map((item) => ({
            label: `${item.name} (${item.code}) - saldo ${item.quantity}`,
            value: item.id
        }));
    };

    const onServicePartStockChange = () => {
        const selected = rawStock.value.find((item) => item.id === dataServicePart.value.stock_id);
        if (selected && dataServicePart.value.unit_price === null) {
            dataServicePart.value.unit_price = Number(selected.salePrice ?? selected.saleprice ?? 0);
        }
    };

    const openModalServicePart = async (position, data) => {
        resetServicePartForm();
        selectedServicePartContext.value = data;
        positionModalServicePart.value = position;
        try {
            await getStockOptions();
            displayModalServicePart.value = true;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar estoque', life: 5000 });
        }
    };

    const closeModalServicePart = () => {
        displayModalServicePart.value = false;
        selectedServicePartContext.value = {};
        resetServicePartForm();
    };

    const saveServicePart = async () => {
        if (!selectedServicePartContext.value.id || !dataServicePart.value.stock_id || !dataServicePart.value.quantity) {
            toast.add({ severity: 'warn', summary: 'Dados incompletos', detail: 'Informe peça e quantidade.', life: 4000 });
            return;
        }

        servicePartLoading.value = true;
        try {
            const response = await Axios.post(API_CONFIG.SERVICE_PARTS(selectedServicePartContext.value.id), {
                stock_id: dataServicePart.value.stock_id,
                quantity: dataServicePart.value.quantity,
                unit_price: dataServicePart.value.unit_price,
                serial_number: dataServicePart.value.serial_number || null
            });
            toast.add({ severity: 'success', summary: 'Peça registrada', detail: response.msg, life: 5000 });
            closeModalServicePart();
            await getServices();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao registrar peça do serviço', life: 5000 });
        } finally {
            servicePartLoading.value = false;
        }
    };

    /* Filters */
    const loading = ref(null);
    const filters = ref(null);
    const initFilters = () => {
        filters.value = {
            order_of_service: { value: null },
            product: { value: null },
            client: { value: null },
            telephone: { value: null },
            adress: { value: null },
            status: { value: null },
            payment_status: { value: null },
            observation: { value: null },
            created_at: { value: null }
        };
    };
    const clearFilter = () => initFilters();

    /* OS type */
    const typeOS = ref({ label: 'Simplificada', value: 'simples' });
    const typeOsOptions = ref([
        { label: 'Simplificada', value: 'simples' },
        { label: 'Detalhada', value: 'completa' }
    ]);

    /* Services data */
    const dataGetOS = ref([]);
    socket.on('reloadDataOrders', (data) => { dataGetOS.value = data; });

    const getUniqueOS = async (order_of_service) => {
        try {
            const response = await Axios.get(URI_ORDER_OF_SERVICE + '/' + order_of_service);
            dataGetOS.value = response.data[0];
            return dataGetOS.value;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao buscar OS específica', life: 5000 });
            console.error(error);
        }
    };

    const dataGetService = ref([]);
    socket.on('reloadDataService', (data) => { dataGetService.value = data; });

    const getServices = async () => {
        loadingOpen();
        try {
            const response = await Axios.get(URI_SERVICES);
            dataGetService.value = response.data;
            initFilters();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao buscar serviços', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    const deleteService = async (idService, cod_order) => {
        loadingOpen();
        try {
            const response = await Axios.delete(URI_SERVICES + '/' + idService + '/' + cod_order);
            toast.add({ severity: 'success', summary: 'Deletado', detail: response.msg, life: 5000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao deletar serviço', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };
    const confirmDeleteService = (event, data) => {
        confirmPopup.require({
            target: event.target,
            message: 'Deseja realmente excluir este serviço?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => { deleteService(data.id, data.order_of_service); }
        });
    };

    /* Edit info client */
    const originalInfoClient = ref({});
    const dataEditInfoClient = ref({});
    const displayModalEditInfo = ref(false);
    const positionModalEditInfo = ref(false);

    const isInfoClientChanged = () => JSON.stringify(dataEditInfoClient.value) !== JSON.stringify(originalInfoClient.value);
    const resetInfoClient = () => { dataEditInfoClient.value = { ...originalInfoClient.value }; };
    const openModalEditInfo = (position, data) => {
        messageEditInfoClient.value.length = 0;
        displayModalEditInfo.value = true;
        positionModalEditInfo.value = position;
        ['id', 'product', 'client', 'telephone', 'adress', 'observation'].forEach((k) => {
            dataEditInfoClient.value[k] = data[k];
            originalInfoClient.value[k] = data[k];
        });
    };
    const updateInfoClient = async () => {
        loadingOpen();
        try {
            const response = await Axios.put(URI_SERVICES + '/info/cliente/' + dataEditInfoClient.value.id, {
                product: dataEditInfoClient.value.product,
                client: dataEditInfoClient.value.client,
                telephone: dataEditInfoClient.value.telephone,
                adress: dataEditInfoClient.value.adress,
                observation: dataEditInfoClient.value.observation
            });
            toast.add({ severity: 'success', summary: 'Editado', detail: response.msg, life: 5000 });
            closeModal();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao editar as informações do cliente', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };
    const validateEditInfoClient = async () => {
        if (!dataEditInfoClient.value.product || !dataEditInfoClient.value.client || !dataEditInfoClient.value.telephone) {
            addMessage('editInfoClient', 'error', 'Preencha todos os campos obrigatórios.', true);
        } else {
            await updateInfoClient();
        }
    };

    /* Edit status */
    const dataEditStatus = ref({ id: null, status: null, label: '' });
    const displayModalEditStatus = ref(false);
    const positionModalEditStatus = ref(false);
    const openModalEditStatus = (position, data) => {
        messageUpdateStatusService.value.length = 0;
        displayModalEditStatus.value = true;
        positionModalEditStatus.value = position;
        dataEditStatus.value.label = getStyleStatusService(data.status_id).description;
        dataEditStatus.value.id = data.id;
        dataEditStatus.value.status = data.status_id;
    };

    
    const MODEL_UPDATE_STATUS_SERVICE = {
        id: null,
        status_id: null
    }
    const updateStatus = async (updateData) => {
        loadingOpen();
        try {
            const response = await Axios.put(URI_SERVICES + '/status/' + updateData.id, { status_id: updateData.status_id });
            toast.add({ severity: 'success', summary: 'Atualizado', detail: response.msg, life: 5000 });
            closeModal();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao atualizar o status', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };
    const validateUpdateStatusService = async () => {
        if (!dataEditStatus.value.status) {
            addMessage('updateStatusService', 'error', 'Campo obrigatório.');
        } else {
            MODEL_UPDATE_STATUS_SERVICE.id = dataEditStatus.value.id;
            MODEL_UPDATE_STATUS_SERVICE.status_id = dataEditStatus.value.status;
            await updateStatus(MODEL_UPDATE_STATUS_SERVICE);
        }
    };


    /* Edit payment status */
    const dataEditPaymentStatus = ref({ id: null, payment_status: null, label: '' });
    const displayModalEditPaymentStatus = ref(false);
    const positionModalEditPaymentStatus = ref(false);
    const openModalEditPaymentStatus = (position, data) => {
        messageUpdateStatusPayment.value.length = 0;
        displayModalEditPaymentStatus.value = true;
        positionModalEditPaymentStatus.value = position;
        dataEditPaymentStatus.value.label = getStyleStatusPayment(data.payment_status_id).description;
        dataEditPaymentStatus.value.id = data.id;
        dataEditPaymentStatus.value.payment_status = data.payment_status_id;
    };


    const MODEL_UPDATE_STATUS_PAYMENT = {
        id: null,
        payment_status_id: null
    }

    const validateUpdateStatusPayment = async () => {
        let selected_payment_status = dataEditPaymentStatus.value.payment_status;
        if (!selected_payment_status) {
            addMessage('updateStatusPayment', 'error', 'Campo obrigatório.');
            return;
        } 
            
        MODEL_UPDATE_STATUS_PAYMENT.payment_status_id = selected_payment_status
        await updatePaymentStatus(MODEL_UPDATE_STATUS_PAYMENT);
    };

    const updatePaymentStatus = async (payment_status) => {
        loadingOpen();
        try {
            const response = await Axios.put(URI_SERVICES + '/status/pagamento/' + payment_status.id, {payment_status_id: payment_status.payment_status_id});
            toast.add({ severity: 'success', summary: 'Atualizado', detail: response.msg, life: 5000 });
            closeModal();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao atualizar o status de pagamento ', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    /* Estimate OS */
    const dataPutOrderOfServiceSimple = ref({});
    const dataPutOrderOfServiceComplete = ref({});
    const displayModalOS = ref(false);
    const positionModalOS = ref(false);
    const dataViewEstimateOS = ref([]);
    const displayButtonRemoveOS = ref(false);

    const openModalOS = async (position, data) => {
        const dataOS = await getUniqueOS(data.order_of_service);
        displayButtonRemoveOS.value = data.status !== 13;
        if (dataOS) {
            messageAddEstimateOSSimple.value.length = 0;
            messageAddEstimateOSComplete.value.length = 0;
            dataViewEstimateOS.value = JSON.parse(dataOS.estimate);
            dataPutOrderOfServiceSimple.value = dataViewEstimateOS.value && dataViewEstimateOS.value.length > 0
                ? dataViewEstimateOS.value
                : { 0: { id: null, description: '', price: null } };
            displayModalOS.value = true;
            positionModalOS.value = position;
            const firstEstimate = dataViewEstimateOS.value[0];
            typeOS.value = firstEstimate && firstEstimate.amount !== undefined && firstEstimate.amount !== ''
                ? { label: 'Detalhada', value: 'completa' }
                : { label: 'Simplificada', value: 'simples' };
        } else {
            toast.add({ severity: 'info', summary: 'Sem Orçamento', detail: 'Não foi encontrado o orçamento desse serviço.', life: 5000 });
        }
    };

    const validateUpdateEstimateOS = async (data) => {
        if (typeOS.value.value === 'simples') {
            if (!dataPutOrderOfServiceSimple.value[0].description || !dataPutOrderOfServiceSimple.value[0].price) {
                addMessage('addEstimateOSSimple', 'error', 'Preencha todos os campos obrigatórios.');
            } else {
                await updateEstimateOS(data);
            }
        } else {
            if (!dataPutOrderOfServiceComplete.value.amount || !dataPutOrderOfServiceComplete.value.description || !dataPutOrderOfServiceComplete.value.price) {
                addMessage('addEstimateOSComplete', 'error', 'Preencha todos os campos obrigatórios.');
            } else {
                await updateEstimateOS(data);
            }
        }
    };

    const updateEstimateOS = async (data) => {
        loadingOpen();
        try {
            const dataPutOrderOfService = ref({});
            if (typeOS.value.value === 'simples') {
                dataPutOrderOfService.value.amount = '';
                dataPutOrderOfService.value.description = dataPutOrderOfServiceSimple.value[0].description;
                dataPutOrderOfService.value.price = dataPutOrderOfServiceSimple.value[0].price;
            } else {
                dataPutOrderOfService.value = dataPutOrderOfServiceComplete.value;
            }
            const response = await Axios.put(URI_ORDER_OF_SERVICE + '/' + data.order_of_service + '/orcamento', {
                type: typeOS.value.value,
                id: !dataPutOrderOfService.value.id ? null : dataPutOrderOfService.value.id,
                amount: dataPutOrderOfService.value.amount,
                description: dataPutOrderOfService.value.description,
                price: dataPutOrderOfService.value.price
            });
            closeModal();
            await openModalOS('top', data);
            toast.add({ severity: 'success', summary: 'Adicionado', detail: response.msg, life: 5000 });
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao adicionar registro de OS', life: 5000 });
        } finally {
            loadingClose();
        }
    };

    const deleteEstimateOS = async (cod, data) => {
        loadingOpen();
        try {
            const response = await Axios.delete(URI_ORDER_OF_SERVICE + '/' + cod + '/orcamento/' + data.id);
            toast.add({ severity: 'success', summary: 'Deletado', detail: response.msg, life: 5000 });
            const dataOpen = { order_of_service: cod };
            closeModal();
            await openModalOS('top', dataOpen);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao deletar registro de OS', life: 5000 });
            console.error(error);
        } finally {
            loadingClose();
        }
    };

    /* Modal view observation */
    const displayModalViewObservation = ref(false);
    const positionModalViewObservation = ref(false);
    const dataViewObservation = ref({ id: null, observation: '' });
    const openModalViewObservation = (position, data) => {
        displayModalViewObservation.value = true;
        positionModalViewObservation.value = position;
        dataViewObservation.value.id = data.id;
        dataViewObservation.value.observation = data.observation;
    };

    /* Modal view adress */
    const displayModalViewAdress = ref(false);
    const positionModalViewAdress = ref(false);
    const dataViewAdress = ref({ id: null, adress: '' });
    const openModalViewAdress = (position, data) => {
        displayModalViewAdress.value = true;
        positionModalViewAdress.value = position;
        dataViewAdress.value.id = data.id;
        dataViewAdress.value.adress = data.adress;
    };

    /* Modal add */
    const displayModalAdd = ref(false);
    provide('displayDialogAdd', displayModalAdd);
    const openModalAdd = () => {
        messageAddService.value.length = 0;
        displayModalAdd.value = true;
    };

    /* Close modal (centralizado) */
    const closeModal = () => {
        if (displayModalOS.value === true) {
            dataPutOrderOfServiceComplete.value.amount = null;
            dataPutOrderOfServiceComplete.value.description = '';
            dataPutOrderOfServiceComplete.value.price = null;
        }
        if (displayModalEditPaymentStatus.value === true) {
            messageUpdateStatusPayment.value.length = 0;
            displayModalEditPaymentStatus.value = false;
            Object.assign(dataEditPaymentStatus.value, { id: '', payment_status: '', label: '' });
        }
        if (displayModalEditStatus.value === true) {
            messageUpdateStatusService.value.length = 0;
            displayModalEditStatus.value = false;
            Object.assign(dataEditStatus.value, { id: '', status: '', label: '' });
        }
        if (displayModalEditInfo.value === true) {
            messageEditInfoClient.value.length = 0;
            displayModalEditInfo.value = false;
            Object.assign(dataEditInfoClient.value, { id: '', product: '', client: '', telephone: '', adress: '', observation: '' });
        }
        if (displayModalServicePart.value === true) {
            closeModalServicePart();
        }
    };


    /* Overlay */
    const idop = ref(null);
    const op = ref();
    const toggle = async (event, id) => {
        idop.value = id;
        const result = await openOverlay(id);
        if (result) op.value.toggle(event);
    };
    const openOverlay = (id) => id === idop.value;

    const copyText = async (numTelefone) => {
        try {
            await navigator.clipboard.writeText(numTelefone);
            toast.add({ severity: 'success', summary: 'Contato copiado', detail: '', life: 5000 });
        } catch (err) {
            console.error("Erro ao copiar: ", err);
        }
    };


    return {
        // utils
        formatData, sendWhatsAppMessage, sendInfoClientsWhats, pdfGenerator, formatTelephone,
        // state
        loading, filters, typeOS, typeOsOptions,
        // messages
        messageAddEstimateOSSimple, messageAddEstimateOSComplete, messageEditInfoClient,
        messageUpdateStatusService, messageUpdateStatusPayment, messageAddService,
        // status
        statusServiceOptions, statusServiceMapping, statusPaymentOptions,
        getStyleStatusService, getStyleStatusPayment,
        // data
        dataGetOS, dataGetService,
        typesProductOptions,
        // modals
        displayModalOS, positionModalOS, dataViewEstimateOS, displayButtonRemoveOS,
        dataPutOrderOfServiceSimple, dataPutOrderOfServiceComplete,
        displayModalViewObservation, positionModalViewObservation, dataViewObservation,
        displayModalViewAdress, positionModalViewAdress, dataViewAdress,
        displayModalEditPaymentStatus, positionModalEditPaymentStatus, dataEditPaymentStatus,
        displayModalEditStatus, positionModalEditStatus, dataEditStatus,
        displayModalEditInfo, positionModalEditInfo, dataEditInfoClient,
        displayModalServicePart, positionModalServicePart, selectedServicePartContext,
        dataServicePart, stockOptions, servicePartLoading,
        displayModalAdd,
        // methods - data fetch
        getStatusService, getStatusPayment, getTypesProduct, getServices,
        // methods - actions
        clearFilter, openModalAdd, closeModal,
        openModalOS, validateUpdateEstimateOS, deleteEstimateOS,
        openModalViewObservation, openModalViewAdress,
        openModalEditPaymentStatus, validateUpdateStatusPayment,
        openModalEditStatus, validateUpdateStatusService,
        openModalEditInfo, validateEditInfoClient, isInfoClientChanged, resetInfoClient,
        openModalServicePart, closeModalServicePart, saveServicePart, onServicePartStockChange,
        confirmDeleteService,
        toggle, openOverlay, idop, op, copyText
    };
}
