<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import BarcodeScannerDialog from '@/components/BarcodeScannerDialog.vue';

const toast = useToast();
const confirmPopup = useConfirm();

const loading = ref(false);
const tableLoading = ref(false);
const items = ref([]);
const filters = ref({
    name: { value: null, matchMode: 'contains' },
    code: { value: null, matchMode: 'contains' }
});
const dialogVisible = ref(false);
const editingId = ref(null);
const scannerVisible = ref(false);
const form = ref({
    name: '',
    code: '',
    description: '',
    supplier_name: '',
    quantity: 0,
    purchasePrice: 0,
    salePrice: 0,
    warranty_days: 0
});

function resetForm() {
    editingId.value = null;
    form.value = {
        name: '',
        code: '',
        description: '',
        supplier_name: '',
        quantity: 0,
        purchasePrice: 0,
        salePrice: 0,
        warranty_days: 0
    };
}

async function loadStock() {
    tableLoading.value = true;
    try {
        const response = await Axios.get(API_CONFIG.STOCK);
        items.value = response.data || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar estoque.', life: 5000 });
    } finally {
        tableLoading.value = false;
    }
}

async function refreshStock() {
    loading.value = true;
    try { await loadStock(); }
    finally { loading.value = false; }
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
        supplier_name: item.supplier_name || '',
        quantity: Number(item.quantity || 0),
        purchasePrice: Number(item.purchaseprice ?? item.purchasePrice ?? 0),
        salePrice: Number(item.saleprice ?? item.salePrice ?? 0),
        warranty_days: Number(item.warranty_days || 0)
    };
    dialogVisible.value = true;
}

function applyScannedStock({ rawValue, data }) {
    const scanned = data && typeof data === 'object' ? data : {};
    const existingItem = items.value.find((item) => String(item.code || '').trim() === String(scanned.code || scanned.barcode || rawValue).trim());
    if (existingItem) {
        form.value = {
            name: existingItem.name || '',
            code: existingItem.code || '',
            description: existingItem.description || '',
            supplier_name: existingItem.supplier_name || '',
            quantity: Number(existingItem.quantity || 0),
            purchasePrice: Number(existingItem.purchaseprice ?? existingItem.purchasePrice ?? 0),
            salePrice: Number(existingItem.saleprice ?? existingItem.salePrice ?? 0),
            warranty_days: Number(existingItem.warranty_days || 0)
        };
        editingId.value = existingItem.id;
        dialogVisible.value = true;
        return;
    }
    form.value = {
        ...form.value,
        code: scanned.code || scanned.barcode || rawValue,
        name: scanned.name || scanned.full_name || form.value.name,
        description: scanned.description || form.value.description,
        supplier_name: scanned.supplier_name || scanned.supplier || form.value.supplier_name,
        quantity: scanned.quantity !== undefined ? Number(scanned.quantity) : form.value.quantity,
        purchasePrice: (scanned.purchasePrice ?? scanned.purchase_price) !== undefined ? Number(scanned.purchasePrice ?? scanned.purchase_price) : form.value.purchasePrice,
        salePrice: (scanned.salePrice ?? scanned.sale_price) !== undefined ? Number(scanned.salePrice ?? scanned.sale_price) : form.value.salePrice,
        warranty_days: (scanned.warranty_days ?? scanned.warrantyDays ?? scanned.warranty) !== undefined ? Number(scanned.warranty_days ?? scanned.warrantyDays ?? scanned.warranty) : form.value.warranty_days
    };
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
            supplier_name: form.value.supplier_name || null,
            quantity: Number(form.value.quantity || 0),
            purchasePrice: Number(form.value.purchasePrice || 0),
            salePrice: Number(form.value.salePrice || 0),
            warranty_days: Number(form.value.warranty_days || 0)
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
    <BarcodeScannerDialog v-model="scannerVisible" title="Ler código do item" @detected="applyScannedStock" />

    <div class="card">
        <div class="flex align-items-center justify-content-between mb-4">
            <div>
                <div class="page-title-row">
                    <h5 class="page-title">Estoque</h5>
                    <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Consulte, cadastre e atualize os itens disponíveis para vendas e serviços.'" aria-label="Informações sobre a tela de estoque" />
                </div>
            </div>
            <div class="flex gap-2">
                <Button label="Atualizar" icon="pi pi-refresh" outlined :loading="loading" @click="refreshStock()" />
                <Button label="Adicionar item" icon="pi pi-plus" :loading="loading" @click="openCreateDialog()" />
            </div>
        </div>

        <DataTable v-model:filters="filters" :value="items" :loading="tableLoading" dataKey="id" responsiveLayout="scroll" filterDisplay="menu" showGridlines>
            <template #empty>Nenhum item encontrado.</template>

            <Column field="name" header="Nome">
                <template #filter="{ filterModel }"><InputText v-model="filterModel.value" class="p-column-filter" placeholder="Buscar por nome" /></template>
            </Column>
            <Column field="code" header="Código">
                <template #filter="{ filterModel }"><InputText v-model="filterModel.value" class="p-column-filter" placeholder="Buscar por código" /></template>
            </Column>
            <Column field="description" header="Descrição" />
            <Column field="quantity" header="Quantidade" />

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

            <Column field="warranty_days" header="Garantia (dias)" />

            <Column header="Ações" bodyClass="text-center">
                <template #body="{ data }">
                    <div class="flex justify-content-center gap-2">
                        <Button icon="pi pi-pencil" rounded severity="warning" @click="openEditDialog(data)" />
                        <Button icon="pi pi-trash" rounded severity="danger" @click="confirmDelete($event, data)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :style="{ width: '40rem' }" :header="editingId ? 'Editar Item' : 'Adicionar Item'">
        <div class="grid p-fluid mt-3">
            <div class="field col-12 md:col-6">
                <span class="p-float-label"><InputText id="stockName" v-model="form.name" /><label for="stockName"><span class="text-red-500">*</span> Nome</label></span>
            </div>
            <div class="field col-12 md:col-6">
                <div class="flex align-items-end gap-1">
                    <span class="p-float-label flex-1"><InputText id="stockCode" v-model="form.code" class="w-full" /><label for="stockCode"><span class="text-red-500">*</span> Código</label></span>
                    <Button icon="pi pi-qrcode" class="p-button-outlined" aria-label="Ler código do item" v-tooltip.top="'Ler código do item'" @click="scannerVisible = true" />
                </div>
            </div>
            <div class="field col-12">
                <span class="p-float-label"><Textarea id="stockDescription" v-model="form.description" rows="3" /><label for="stockDescription">Descrição</label></span>
            </div>
            <div class="field col-12 md:col-6">
                <span class="p-float-label"><InputText id="stockSupplier" v-model="form.supplier_name" /><label for="stockSupplier">Fornecedor (opcional)</label></span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label"><InputNumber inputId="stockQuantity" v-model="form.quantity" :min="0" /><label for="stockQuantity">Quantidade</label></span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label"><InputNumber inputId="stockPurchasePrice" v-model="form.purchasePrice" mode="currency" currency="BRL" locale="pt-BR" :min="0" /><label for="stockPurchasePrice">Preço de Compra</label></span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label"><InputNumber inputId="stockSalePrice" v-model="form.salePrice" mode="currency" currency="BRL" locale="pt-BR" :min="0" /><label for="stockSalePrice">Preço de Venda</label></span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label"><InputNumber inputId="stockWarranty" v-model="form.warranty_days" :min="0" :useGrouping="false" /><label for="stockWarranty">Garantia (dias)</label></span>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" text @click="dialogVisible = false" />
            <Button label="Salvar" icon="pi pi-check" :loading="loading" @click="saveItem()" />
        </template>
    </Dialog>
</template>
