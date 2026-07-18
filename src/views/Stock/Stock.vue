<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';

const toast = useToast();
const confirmPopup = useConfirm();

const loading = ref(false);
const items = ref([]);
const dialogVisible = ref(false);
const editingId = ref(null);
const form = ref({
    name: '',
    code: '',
    description: '',
    quantity: 0,
    purchasePrice: 0,
    salePrice: 0
});

function resetForm() {
    editingId.value = null;
    form.value = {
        name: '',
        code: '',
        description: '',
        quantity: 0,
        purchasePrice: 0,
        salePrice: 0
    };
}

async function loadStock() {
    loading.value = true;
    try {
        const response = await Axios.get(API_CONFIG.STOCK);
        items.value = response.data || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar estoque.', life: 5000 });
    } finally {
        loading.value = false;
    }
}

function openCreateDialog() {
    resetForm();
    dialogVisible.value = true;
}

function openEditDialog(item) {
    editingId.value = item.id;
    form.value = {
        name: item.name || '',
        code: item.code || '',
        description: item.description || '',
        quantity: Number(item.quantity || 0),
        purchasePrice: Number(item.purchaseprice ?? item.purchasePrice ?? 0),
        salePrice: Number(item.saleprice ?? item.salePrice ?? 0)
    };
    dialogVisible.value = true;
}

async function saveItem() {
    if (!form.value.name || !form.value.code) {
        toast.add({ severity: 'warn', summary: 'Validação', detail: 'Nome e código são obrigatórios.', life: 4000 });
        return;
    }

    loading.value = true;
    try {
        const payload = {
            name: form.value.name,
            code: form.value.code,
            description: form.value.description || null,
            quantity: Number(form.value.quantity || 0),
            purchasePrice: Number(form.value.purchasePrice || 0),
            salePrice: Number(form.value.salePrice || 0)
        };

        if (editingId.value) {
            await Axios.put(`${API_CONFIG.STOCK}/${editingId.value}`, payload);
            toast.add({ severity: 'success', summary: 'Atualizado', detail: 'Item de estoque atualizado com sucesso.', life: 4000 });
        } else {
            await Axios.post(API_CONFIG.STOCK, payload);
            toast.add({ severity: 'success', summary: 'Criado', detail: 'Item de estoque criado com sucesso.', life: 4000 });
        }

        dialogVisible.value = false;
        resetForm();
        await loadStock();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao salvar item de estoque.', life: 5000 });
    } finally {
        loading.value = false;
    }
}

function confirmDelete(event, item) {
    confirmPopup.require({
        target: event.currentTarget,
        message: `Deseja remover o item "${item.name}"?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: async () => {
            loading.value = true;
            try {
                await Axios.delete(`${API_CONFIG.STOCK}/${item.id}`);
                toast.add({ severity: 'success', summary: 'Removido', detail: 'Item removido com sucesso.', life: 4000 });
                await loadStock();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao remover item de estoque.', life: 5000 });
            } finally {
                loading.value = false;
            }
        }
    });
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

onMounted(loadStock);
</script>

<template>
    <Toast />
    <ConfirmPopup />

    <div class="card">
        <div class="flex align-items-center justify-content-between mb-4">
            <div>
                <h5 class="mb-1">ESTOQUE</h5>
                <span class="text-600">Itens sincronizados com o módulo de inventário da API.</span>
            </div>
            <div class="flex gap-2">
                <Button label="Atualizar" icon="pi pi-refresh" outlined :loading="loading" @click="loadStock()" />
                <Button label="Novo Item" icon="pi pi-plus" :loading="loading" @click="openCreateDialog()" />
            </div>
        </div>

        <DataTable :value="items" :loading="loading" dataKey="id" responsiveLayout="scroll" showGridlines>
            <template #empty>Nenhum item encontrado.</template>

            <Column field="name" header="Nome" />
            <Column field="code" header="Código" />
            <Column field="description" header="Descrição" />
            <Column field="quantity" header="Qtd." />

            <Column header="Compra">
                <template #body="{ data }">
                    {{ formatCurrency(data.purchaseprice ?? data.purchasePrice) }}
                </template>
            </Column>

            <Column header="Venda">
                <template #body="{ data }">
                    {{ formatCurrency(data.saleprice ?? data.salePrice) }}
                </template>
            </Column>

            <Column header="Ações" bodyClass="text-center">
                <template #body="{ data }">
                    <div class="flex justify-content-center gap-2">
                        <Button icon="pi pi-pencil" rounded outlined @click="openEditDialog(data)" />
                        <Button icon="pi pi-trash" rounded severity="danger" outlined @click="confirmDelete($event, data)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :style="{ width: '40rem' }" :header="editingId ? 'Editar Item' : 'Novo Item'">
        <div class="grid p-fluid">
            <div class="field col-12 md:col-6">
                <label for="stockName">Nome</label>
                <InputText id="stockName" v-model="form.name" />
            </div>
            <div class="field col-12 md:col-6">
                <label for="stockCode">Código</label>
                <InputText id="stockCode" v-model="form.code" />
            </div>
            <div class="field col-12">
                <label for="stockDescription">Descrição</label>
                <Textarea id="stockDescription" v-model="form.description" rows="3" />
            </div>
            <div class="field col-12 md:col-4">
                <label for="stockQuantity">Quantidade</label>
                <InputNumber id="stockQuantity" v-model="form.quantity" :min="0" />
            </div>
            <div class="field col-12 md:col-4">
                <label for="stockPurchasePrice">Preço de Compra</label>
                <InputNumber id="stockPurchasePrice" v-model="form.purchasePrice" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
            </div>
            <div class="field col-12 md:col-4">
                <label for="stockSalePrice">Preço de Venda</label>
                <InputNumber id="stockSalePrice" v-model="form.salePrice" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" text @click="dialogVisible = false" />
            <Button label="Salvar" icon="pi pi-save" :loading="loading" @click="saveItem()" />
        </template>
    </Dialog>
</template>
