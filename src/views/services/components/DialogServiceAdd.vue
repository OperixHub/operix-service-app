<script setup>
import { onMounted } from 'vue';
import { useDialogServiceAdd } from '../composables/useDialogServiceAdd';

const { displayModalAdd, dataPostService, statusServiceMapping, typesProductOptions, messageAddService, getStatusService, getTypesProduct, validatePostService, closeModal, initDate } = useDialogServiceAdd();

onMounted(() => {
    getTypesProduct();
    getStatusService();
    initDate();
});
</script>
<template>
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
                    <Dropdown v-model="dataPostService.product" :options="typesProductOptions" aria-labelledby="addProductLabel"/>
                    <label id="addProductLabel"><span class="text-red-500">*</span> Produto</label>
                </span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <InputText type="text" id="addClient" v-model="dataPostService.client" />
                    <label for="addClient"><span style="color: red">*</span> Cliente</label>
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
            <Button label="Cancelar" icon="pi pi-times" class="p-button-danger" @click="closeModal()" />
            <Button label="Adicionar" icon="pi pi-check" class="p-button-success" @click="validatePostService()" />
        </template>
    </Dialog>
</template>
