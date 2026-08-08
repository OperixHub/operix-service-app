<script setup>
import { onMounted, ref } from 'vue';
import { useTypesProducts } from '../composables/useTypesProducts';

const popup = ref(null);

const { dataGetTypesProduct, tableLoading, dataPostTypesProduct, getTypesProduct, confirmDeleteTypesProduct, onSubmit } = useTypesProducts();

onMounted(() => {
    getTypesProduct();
});
</script>

<template>
    <ConfirmPopup />
    <Toast />
    <div class="card">
        <div class="page-title-row">
            <h5 class="page-title">Tipos de Produtos</h5>
            <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Cadastre os tipos de produto usados no cadastro de serviços e no estoque.'" aria-label="Informações sobre tipos de produtos" />
        </div>
        <Toolbar class="mb-4">
            <template v-slot:start>
                <form @submit="onSubmit" class="flex flex-column align-items-center gap-2">
                    <div class="grid p-fluid" style="margin: auto">
                        <span class="p-float-label">
                            <InputText type="text" id="addName" v-model="dataPostTypesProduct.name"  />
                            <label for="addName"><span style="color: red">*</span> Nome </label>
                        </span>

                        <Button type="submit" label="Adicionar" icon="pi pi-check" class="basic-data-add-button ml-2" v-tooltip.top="'Adicionar'" />
                    </div>
                </form>
            </template>
        </Toolbar>
        <DataTable :value="dataGetTypesProduct" :loading="tableLoading" :rowHover="true" :rows="10" showGridlines>
            <Column bodyClass="text-center" field="name" header="Tipo de Produto">
                <template #body="{ data }">
                    <Chip :label="data.name" />
                </template>
            </Column>
            <Column bodyClass="text-center">
                <template #body="{ data }">
                    <Button ref="popup" @click="confirmDeleteTypesProduct($event, data.id)" icon="pi pi-trash" class="p-button-rounded p-button-danger" v-tooltip.top="'Excluir'" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
