<script setup>
import { onMounted, ref } from 'vue';
import { useStatusPayment } from '../composables/useStatusPayment';

const popup = ref(null);

const { dataGetStatusPayment, tableLoading, dataPostStatusPayment, getStatusPayment, confirmDeleteStatusPayment, onSubmit, ISSET_STATUS_PAYMENT_DEFAULT } = useStatusPayment();

onMounted(() => {
    getStatusPayment();
});
</script>

<template>
    <div class="card">
        <div class="page-title-row">
            <h5 class="page-title">Situações de Pagamento</h5>
            <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Configure as situações que representam o recebimento dos serviços.'" aria-label="Informações sobre situações de pagamento" />
        </div>
        <Toolbar class="mb-4">
            <template v-slot:start>
                <form @submit="onSubmit" class="flex flex-column align-items-center gap-2">
                    <div class="grid p-fluid" style="margin: auto">
                        <span class="p-float-label ml-2">
                            <InputText type="text" id="addDescription" v-model="dataPostStatusPayment.description" style="max-width: 140px" />
                            <label for="addDescription"><span style="color: red">*</span> Descrição </label>
                        </span>
                        <div class="ml-2 flex flex-column align-items-start">
                            <label for="addColor" class="block text-600 text-sm mb-1"><span class="text-red-500">*</span> Cor</label>
                            <ColorPicker v-model="dataPostStatusPayment.color" id="addColor" format="hex" class="basic-data-color-picker" />
                        </div>
                        
                        <Button type="submit" label="Adicionar" icon="pi pi-check" class="basic-data-add-button ml-2" v-tooltip.top="'Adicionar'" />
                    </div>
                    <div v-if="!ISSET_STATUS_PAYMENT_DEFAULT" class="basic-data-default-option">
                        <Checkbox v-model="dataPostStatusPayment.default" id="addDefault" :binary="true" />
                        <label for="addDefault">Definir como situação inicial</label>
                    </div>
                </form>
            </template>
        </Toolbar>
        <DataTable :value="dataGetStatusPayment" :loading="tableLoading" :rowHover="true" :rows="10" showGridlines>
            <Column bodyClass="text-center" field="description" header="Situação de Pagamento">
                <template #body="{ data }">
                    <Tag :value="data.description" :style="{ background: data.color.hex }" />
                    <i v-if="data.is_default === true" class="pi pi-check-square"></i>
                </template>
            </Column>
            <Column bodyClass="text-center">
                <template #body="{ data }">
                    <Button ref="popup" @click="confirmDeleteStatusPayment($event, data.id)" icon="pi pi-trash" class="p-button-rounded p-button-danger" v-tooltip.top="'Excluir'" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
