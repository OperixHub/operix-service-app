<script setup>
import { onMounted, ref } from 'vue';
import { useStatusServices } from '../composables/useStatusServices';

const popup = ref(null);

const { dataGetStatusServices, tableLoading, dataPostStatusServices, getStatusServices, confirmDeleteStatusServices, onSubmit } = useStatusServices();

onMounted(() => {
    getStatusServices();
});
</script>

<template>
    <div class="card">
        <div class="page-title-row">
            <h5 class="page-title">Situações de Serviço</h5>
            <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Configure as situações usadas para acompanhar o andamento dos serviços.'" aria-label="Informações sobre situações de serviço" />
        </div>
        <Toolbar class="mb-4">
            <template v-slot:start>
                <form @submit="onSubmit" class="flex flex-column align-items-center gap-2">
                    <div class="grid p-fluid" style="margin: auto">
                        <span class="p-float-label ml-2">
                            <InputText type="text" id="addDescription" v-model="dataPostStatusServices.description" style="max-width: 140px" />
                            <label for="addDescription"><span style="color: red">*</span> Descrição </label>
                        </span>
                        <div class="ml-2 flex flex-column align-items-start">
                            <label for="addColor" class="block text-600 text-sm mb-1"><span class="text-red-500">*</span> Cor</label>
                            <ColorPicker v-model="dataPostStatusServices.color" id="addColor" format="hex" class="basic-data-color-picker" />
                        </div>
                        <Button type="submit" label="Adicionar" icon="pi pi-check" class="basic-data-add-button ml-2" v-tooltip.top="'Adicionar'" />
                    </div>
                </form>
            </template>
        </Toolbar>
        <DataTable :value="dataGetStatusServices" :loading="tableLoading" :rowHover="true" :rows="10" showGridlines>
            <Column bodyClass="text-center" field="description" header="Situação de Serviço">
                <template #body="{ data }">
                    <Tag :value="data.description" :style="{ background: data.color.hex }" />
                </template>
            </Column>
            <Column bodyClass="text-center">
                <template #body="{ data }">
                    <Button ref="popup" @click="confirmDeleteStatusServices($event, data.id)" icon="pi pi-trash" class="p-button-rounded p-button-danger" v-tooltip.top="'Excluir'" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
