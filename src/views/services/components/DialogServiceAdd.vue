<script setup>
import { onMounted } from 'vue';
import { useDialogServiceAdd } from '../composables/useDialogServiceAdd';
import { ref } from 'vue';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import DialogClientForm from '@/views/clients/components/DialogClientForm.vue';

const { displayModalAdd, dataPostService, statusServiceMapping, typesProductOptions, clients, messageAddService, getStatusService, getTypesProduct, getClients, selectClient, validatePostService, closeModal, initDate } = useDialogServiceAdd();
const clientDialogVisible = ref(false);
const clientLoading = ref(false);
const newClient = ref({ full_name: '', document: '', phone: '', address: '' });

const openClientDialog = () => { newClient.value = { full_name: '', document: '', phone: '', address: '' }; clientDialogVisible.value = true; };
const saveClient = async () => {
    if (!newClient.value.full_name || !newClient.value.phone) return;
    clientLoading.value = true;
    try {
        const response = await Axios.post(API_CONFIG.CLIENTS, newClient.value);
        const client = response.data;
        clients.value = [...clients.value, client].sort((a, b) => a.full_name.localeCompare(b.full_name));
        dataPostService.value.client_id = client.id;
        selectClient(client);
        clientDialogVisible.value = false;
    } finally { clientLoading.value = false; }
};

onMounted(() => {
    getTypesProduct();
    getStatusService();
    initDate();
    getClients();
});
</script>
<template>
    <DialogClientForm v-model="clientDialogVisible" v-model:client="newClient" :loading="clientLoading" title="Cadastrar cliente" @save="saveClient" @cancel="clientDialogVisible = false" />
    <Dialog 
        header="Adicionar Serviço" 
        v-model:visible="displayModalAdd" 
        position="top" 
        :breakpoints="{ '960px': '85vw', '640px': '100vw' }" 
        :style="{ width: 'clamp(22rem, 70vw, 58rem)' }" 
        :modal="true"  
    >
        <transition-group tag="div">
            <Message v-for="msg of messageAddService" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
        </transition-group>
        <div class="grid p-fluid mt-3">
            <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <Dropdown v-model="dataPostService.product" :options="typesProductOptions" filter aria-labelledby="addProductLabel"/>
                    <label id="addProductLabel"><span class="text-red-500">*</span> Produto</label>
                </span>
            </div>
            <div class="field col-12 md:col-4 relative">
                <a href="#" class="text-blue-500 text-sm" style="position: absolute; top: -0.8rem; right: 0.75rem;" @click.prevent="openClientDialog">Cadastrar cliente</a>
                <span class="p-float-label">
                    <Dropdown inputId="addClient" v-model="dataPostService.client_id" :options="clients" optionLabel="full_name" optionValue="id" filter class="w-full" @change="selectClient(clients.find((client) => client.id === dataPostService.client_id))" />
                    <label for="addClient"><span class="text-red-500">*</span> Cliente</label>
                </span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <InputText id="addTelephone" :maxlength="11" :inputStyle="{ 'text-transform': 'none' }" v-model="dataPostService.telephone" />
                    <label for="addTelephone"><span style="color: red">*</span> Telefone</label>
                </span>
            </div>
            <div class="field col-12 md:col-8">
                <span class="p-float-label">
                    <InputText type="text" id="addAdress" v-model="dataPostService.adress" />
                    <label for="addAdress">Endereço</label>
                </span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <Dropdown inputId="addStatus" :options="statusServiceMapping" v-model="dataPostService.status" aria-labelledby="addStatusLabel" optionLabel="description" />
                    <label id="addStatusLabel"><span style="color: red">*</span> Situação</label>
                </span>
            </div>
            <div class="field col-12 md:col-9">
                <span class="p-float-label">
                    <Textarea id="addObservation" rows="1" cols="10" v-model="dataPostService.observation" />
                    <label for="addObservation">Observação</label>
                </span>
            </div>
            <div class="field col-12 md:col-3">
                <span class="p-float-label">
                    <InputText type="date" id="addDate" v-model="dataPostService.created_at" />
                    <label for="addDate" ><span style="color: red">*</span> Data</label>
                </span>
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="closeModal()" />
            <Button label="Adicionar" icon="pi pi-check" @click="validatePostService()" />
        </template>
    </Dialog>
</template>
