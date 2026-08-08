import Axios from '@/services/axios';
import pdfGenerator from '@/services/pdfGenerator';
import { computed, ref, provide } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { messageAddService, messageAddEstimateOSComplete, messageEditInfoClient, messageUpdateStatusService, messageUpdateStatusPayment, addMessage } from '@views/utils/messages.js';
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
    const servicePartLoading = ref(false);
    const serviceParts = ref([]);
    const serviceContextOS = ref({});
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
            label: `${item.name} - ${item.code}`,
            value: item.id,
            code: item.code,
            name: item.name,
            quantity: item.quantity,
            warranty_days: item.warranty_days
        }));
    };

    const getServiceParts = async (serviceId) => {
        if (!serviceId) {
            serviceParts.value = [];
            return;
        }
        const response = await Axios.get(API_CONFIG.SERVICE_PARTS(serviceId));
        serviceParts.value = response.data || [];
    };

    const onServicePartStockChange = () => {
        const selected = rawStock.value.find((item) => item.id === dataServicePart.value.stock_id);
        if (selected && dataServicePart.value.unit_price === null) {
            dataServicePart.value.unit_price = Number(selected.salePrice ?? selected.saleprice ?? 0);
        }
    };

    /* Filters */
    const tableLoading = ref(false);
    const filters = ref(null);
    const initFilters = () => {
        filters.value = {
            order_of_service: { value: null },
            product: { value: null },
            client_filter: { value: null, matchMode: 'contains' },
            telephone: { value: null },
            adress: { value: null },
            status: { value: null },
            payment_status: { value: null },
            observation: { value: null },
            created_at: { value: null }
        };
    };
    const clearFilter = () => initFilters();

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
    const dataGetServiceTable = computed(() => dataGetService.value.map((service) => ({
        ...service,
        client_filter: `${service.client || ''} ${service.telephone || ''} ${String(service.telephone || '').replace(/\D/g, '')}`.trim()
    })));
    socket.on('reloadDataService', (data) => { dataGetService.value = data; });

    const getServices = async () => {
        tableLoading.value = true;
        try {
            const response = await Axios.get(URI_SERVICES);
            dataGetService.value = response.data;
            initFilters();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao buscar serviços', life: 5000 });
            console.error(error);
        } finally {
            tableLoading.value = false;
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
    const dataEditProduct = ref({ id: null, product: '' });
    const displayModalEditProduct = ref(false);
    const positionModalEditProduct = ref(false);

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

    const openModalEditProduct = (position, data) => {
        displayModalEditProduct.value = true;
        positionModalEditProduct.value = position;
        dataEditProduct.value = {
            id: data.id,
            product: data.product || '',
            client: data.client || '',
            telephone: data.telephone || '',
            adress: data.adress || '',
            observation: data.observation || ''
        };
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
            originalInfoClient.value = { ...dataEditInfoClient.value };
            return true;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao editar as informações do cliente', life: 5000 });
            console.error(error);
            return false;
        } finally {
            loadingClose();
        }
    };
    const validateEditInfoClient = async () => {
        if (!dataEditInfoClient.value.client || !dataEditInfoClient.value.telephone) {
            addMessage('editInfoClient', 'error', 'Preencha todos os campos obrigatórios.', true);
        } else {
            return await updateInfoClient();
        }
        return false;
    };

    const validateEditProduct = async () => {
        if (!dataEditProduct.value.product) return;
        loadingOpen();
        try {
            const response = await Axios.put(URI_SERVICES + '/info/cliente/' + dataEditProduct.value.id, dataEditProduct.value);
            toast.add({ severity: 'success', summary: 'Salvo', detail: response.msg, life: 5000 });
            closeModal();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao editar o produto', life: 5000 });
        } finally {
            loadingClose();
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
    const dataPutOrderOfServiceComplete = ref({});
    const serviceWarrantyDays = ref(0);
    const serviceWarrantyLoading = ref(false);
    const displayModalOS = ref(false);
    const positionModalOS = ref(false);
    const dataViewEstimateOS = ref([]);

    const addServicePartToOS = async () => {
        if (!serviceContextOS.value.id || !dataServicePart.value.stock_id || !dataServicePart.value.quantity) {
            toast.add({ severity: 'warn', summary: 'Dados incompletos', detail: 'Informe peça e quantidade.', life: 4000 });
            return;
        }

        servicePartLoading.value = true;
        try {
            const response = await Axios.post(API_CONFIG.SERVICE_PARTS(serviceContextOS.value.id), {
                stock_id: dataServicePart.value.stock_id,
                quantity: dataServicePart.value.quantity,
                unit_price: dataServicePart.value.unit_price,
                serial_number: dataServicePart.value.serial_number || null
            });
            toast.add({ severity: 'success', summary: 'Peça registrada', detail: response.msg, life: 4000 });
            resetServicePartForm();
            await Promise.all([getServiceParts(serviceContextOS.value.id), getStockOptions(), getServices()]);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao registrar peça do serviço', life: 5000 });
        } finally {
            servicePartLoading.value = false;
        }
    };

    const openModalOS = async (position, data) => {
        serviceContextOS.value = data;
        const dataOS = await getUniqueOS(data.order_of_service);
        if (dataOS) {
            messageAddEstimateOSComplete.value.length = 0;
            dataViewEstimateOS.value = JSON.parse(dataOS.estimate || '[]');
            dataPutOrderOfServiceComplete.value = { amount: null, description: '', price: null };
            serviceWarrantyDays.value = Number(dataOS.warranty_days || 0);
            await Promise.all([getServiceParts(data.id), getStockOptions()]);
            displayModalOS.value = true;
            positionModalOS.value = position;
        } else {
            toast.add({ severity: 'info', summary: 'Sem Orçamento', detail: 'Não foi encontrado o orçamento desse serviço.', life: 5000 });
        }
    };

    const validateUpdateEstimateOS = async (data) => {
        if (!dataPutOrderOfServiceComplete.value.amount || !dataPutOrderOfServiceComplete.value.description || !dataPutOrderOfServiceComplete.value.price) {
            addMessage('addEstimateOSComplete', 'error', 'Preencha quantidade, descrição e preço do item avulso.');
        } else {
            await updateEstimateOS(data);
        }
    };

    const updateEstimateOS = async (data) => {
        loadingOpen();
        try {
            const dataPutOrderOfService = dataPutOrderOfServiceComplete.value;
            const response = await Axios.put(URI_ORDER_OF_SERVICE + '/' + data.order_of_service + '/orcamento', {
                type: 'completa',
                id: !dataPutOrderOfService.id ? null : dataPutOrderOfService.id,
                amount: dataPutOrderOfService.amount,
                description: dataPutOrderOfService.description,
                price: dataPutOrderOfService.price,
                warranty_days: serviceWarrantyDays.value
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

    const saveServiceWarranty = async () => {
        if (!serviceContextOS.value.order_of_service) return;
        serviceWarrantyLoading.value = true;
        try {
            await Axios.patch(`${URI_ORDER_OF_SERVICE}/${serviceContextOS.value.order_of_service}/garantia`, { warranty_days: Number(serviceWarrantyDays.value || 0) });
            toast.add({ severity: 'success', summary: 'Garantia atualizada', detail: 'Garantia do serviço salva.', life: 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao salvar a garantia do serviço.', life: 5000 });
        } finally {
            serviceWarrantyLoading.value = false;
        }
    };

    const deleteServicePartFromOS = async (part) => {
        if (!serviceContextOS.value.id) return;
        servicePartLoading.value = true;
        try {
            const response = await Axios.delete(`${API_CONFIG.SERVICE_PARTS(serviceContextOS.value.id)}/${part.id}`);
            toast.add({ severity: 'success', summary: 'Removida', detail: response.msg, life: 4000 });
            await Promise.all([getServiceParts(serviceContextOS.value.id), getStockOptions(), getServices()]);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao remover peça do serviço', life: 5000 });
        } finally {
            servicePartLoading.value = false;
        }
    };

    const deleteEstimateOS = async (cod, data) => {
        loadingOpen();
        try {
            const serviceContext = { ...serviceContextOS.value };
            const response = await Axios.delete(URI_ORDER_OF_SERVICE + '/' + cod + '/orcamento/' + data.id);
            toast.add({ severity: 'success', summary: 'Deletado', detail: response.msg, life: 5000 });
            closeModal();
            await openModalOS('top', serviceContext);
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
            dataPutOrderOfServiceComplete.value = { amount: null, description: '', price: null };
            serviceWarrantyDays.value = 0;
            serviceParts.value = [];
            serviceContextOS.value = {};
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
        if (displayModalEditProduct.value === true) {
            displayModalEditProduct.value = false;
            dataEditProduct.value = { id: null, product: '' };
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
        tableLoading, filters,
        // messages
        messageAddEstimateOSComplete, messageEditInfoClient,
        messageUpdateStatusService, messageUpdateStatusPayment, messageAddService,
        // status
        statusServiceOptions, statusServiceMapping, statusPaymentOptions,
        getStyleStatusService, getStyleStatusPayment,
        // data
        dataGetOS, dataGetService, dataGetServiceTable,
        typesProductOptions,
        // modals
        displayModalOS, positionModalOS, dataViewEstimateOS,
        dataPutOrderOfServiceComplete,
        displayModalViewObservation, positionModalViewObservation, dataViewObservation,
        displayModalViewAdress, positionModalViewAdress, dataViewAdress,
        displayModalEditPaymentStatus, positionModalEditPaymentStatus, dataEditPaymentStatus,
        displayModalEditStatus, positionModalEditStatus, dataEditStatus,
        displayModalEditInfo, positionModalEditInfo, dataEditInfoClient,
        displayModalEditProduct, positionModalEditProduct, dataEditProduct,
        dataServicePart, stockOptions, servicePartLoading, serviceParts, serviceContextOS, serviceWarrantyDays, serviceWarrantyLoading,
        displayModalAdd,
        // methods - data fetch
        getStatusService, getStatusPayment, getTypesProduct, getServices,
        // methods - actions
        clearFilter, openModalAdd, closeModal,
        openModalOS, validateUpdateEstimateOS, deleteEstimateOS, addServicePartToOS, deleteServicePartFromOS, saveServiceWarranty,
        openModalViewObservation, openModalViewAdress,
        openModalEditPaymentStatus, validateUpdateStatusPayment,
        openModalEditStatus, validateUpdateStatusService,
        openModalEditInfo, validateEditInfoClient, isInfoClientChanged, resetInfoClient,
        openModalEditProduct, validateEditProduct,
        onServicePartStockChange, getServiceParts,
        confirmDeleteService,
        toggle, openOverlay, idop, op, copyText
    };
}
