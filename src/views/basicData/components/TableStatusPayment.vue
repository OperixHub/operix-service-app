<script setup>
import { onMounted, ref } from 'vue';
import { useStatusPayment } from '../composables/useStatusPayment';

const popup = ref(null);

const { dataGetStatusPayment, dataPostStatusPayment, getStatusPayment, confirmDeleteStatusPayment, onSubmit, ISSET_STATUS_PAYMENT_DEFAULT } = useStatusPayment();

onMounted(() => {
    getStatusPayment();
});
</script>

<template>
    <div class="card">
        <h5>Situações de Pagamento</h5>
        <Toolbar class="mb-4">
            <template v-slot:start>
                <form @submit="onSubmit" class="flex flex-column align-items-center gap-2">
                    <div class="grid p-fluid" style="margin: auto">
                        <span class="p-float-label ml-2">
                            <InputText type="text" id="addDescription" v-model="dataPostStatusPayment.description" style="max-width: 140px" />
                            <label for="addDescription"><span style="color: red">*</span> Descrição </label>
                        </span>
                        <span class="p-float-label ml-2 align-content-center">
                            <ColorPicker v-model="dataPostStatusPayment.color" id="addColor" format="hex" style="max-width: 40px; "/>
                        </span>
                        
                        <Button type="submit" icon="pi pi-plus" class="p-button-rounded p-button-info p-button-outlined ml-2" v-tooltip.top="'Adicionar'" />
                    </div>
                    <div v-if="!ISSET_STATUS_PAYMENT_DEFAULT">
                        <Checkbox v-model="dataPostStatusPayment.default" id="addDefault" :binary="true" />
                        <label for="addDefault" class="ml-2"> Definir como situação inicial </label>
                    </div>
                </form>
            </template>
        </Toolbar>
        <DataTable :value="dataGetStatusPayment" :rowHover="true" :rows="10" showGridlines>
            <Column bodyClass="text-center" field="description" header="Opções">
                <template #body="{ data }">
                    <Tag :value="data.description" :style="{ background: data.color.hex }" />
                    <i v-if="data.is_default === true" class="pi pi-check-square"></i>
                </template>
            </Column>
            <Column bodyClass="text-center">
                <template #body="{ data }">
                    <Button ref="popup" @click="confirmDeleteStatusPayment($event, data.id)" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-outlined" v-tooltip.top="'Excluir'" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
