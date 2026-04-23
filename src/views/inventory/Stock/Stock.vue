<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PageHeader from '@/components/PageHeader.vue';
import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { getApiData, getApiErrorMessage, getApiMessage } from '@/service/api-utils';

const toast = useToast();
const confirm = useConfirm();

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const editingId = ref(null);
const stockItems = ref([]);

const form = reactive({
    name: '',
    code: '',
    description: '',
    quantity: 0,
    purchasePrice: 0,
    salePrice: 0
});

const inventoryValue = () =>
    stockItems.value.reduce((total, item) => total + Number(item.salePrice || 0) * Number(item.quantity || 0), 0);

const lowStockCount = () => stockItems.value.filter((item) => Number(item.quantity) <= 5).length;

const loadStock = async () => {
    loading.value = true;

    try {
        const response = await Axios.get(API_CONFIG.INVENTORY.STOCK);
        stockItems.value = getApiData(response, []);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao carregar estoque.'), life: 5000 });
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    editingId.value = null;
    form.name = '';
    form.code = '';
    form.description = '';
    form.quantity = 0;
    form.purchasePrice = 0;
    form.salePrice = 0;
};

const openCreateDialog = () => {
    resetForm();
    dialogVisible.value = true;
};

const openEditDialog = (item) => {
    editingId.value = item.id;
    form.name = item.name;
    form.code = item.code;
    form.description = item.description || '';
    form.quantity = Number(item.quantity || 0);
    form.purchasePrice = Number(item.purchasePrice || 0);
    form.salePrice = Number(item.salePrice || 0);
    dialogVisible.value = true;
};

const saveStock = async () => {
    if (!form.name || !form.code) {
        toast.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Informe nome e código do item.', life: 4000 });
        return;
    }

    saving.value = true;

    try {
        const payload = {
            name: form.name,
            code: form.code,
            description: form.description,
            quantity: Number(form.quantity),
            purchasePrice: Number(form.purchasePrice),
            salePrice: Number(form.salePrice)
        };

        const response = editingId.value
            ? await Axios.put(`${API_CONFIG.INVENTORY.STOCK}/${editingId.value}`, payload)
            : await Axios.post(API_CONFIG.INVENTORY.STOCK, payload);

        toast.add({
            severity: 'success',
            summary: editingId.value ? 'Item atualizado' : 'Item criado',
            detail: getApiMessage(response, editingId.value ? 'Item atualizado com sucesso.' : 'Item criado com sucesso.'),
            life: 4000
        });

        dialogVisible.value = false;
        await loadStock();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao salvar item de estoque.'), life: 5000 });
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (event, item) => {
    confirm.require({
        target: event.currentTarget,
        message: `Deseja remover o item ${item.name}?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Remover',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                const response = await Axios.delete(`${API_CONFIG.INVENTORY.STOCK}/${item.id}`);
                toast.add({ severity: 'success', summary: 'Item removido', detail: getApiMessage(response, 'Item removido com sucesso.'), life: 4000 });
                await loadStock();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao remover item.'), life: 5000 });
            }
        }
    });
};

onMounted(loadStock);
</script>

<template>
    <ConfirmPopup />
    <Toast />

    <div class="page-shell">
        <PageHeader
            title="Estoque"
            subtitle="Acompanhe os itens disponíveis, cadastre novas peças e identifique rapidamente o que precisa de reposição."
            badge="Inventário"
        >
            <template #actions>
                <div class="page-actions">
                    <Button label="Atualizar" icon="pi pi-refresh" class="p-button-outlined" @click="loadStock" />
                    <Button label="Novo item" icon="pi pi-plus" @click="openCreateDialog" />
                </div>
            </template>
        </PageHeader>

        <section class="stats-grid">
            <article class="stat-card">
                <span class="stat-card__label">Itens cadastrados</span>
                <strong class="stat-card__value">{{ stockItems.length }}</strong>
            </article>
            <article class="stat-card">
                <span class="stat-card__label">Baixo estoque</span>
                <strong class="stat-card__value">{{ lowStockCount() }}</strong>
            </article>
            <article class="stat-card">
                <span class="stat-card__label">Valor estimado</span>
                <strong class="stat-card__value">R$ {{ inventoryValue().toFixed(2) }}</strong>
            </article>
        </section>

        <section class="content-card">
            <DataTable :value="stockItems" :loading="loading" dataKey="id" responsiveLayout="scroll" showGridlines>
                <template #empty> Nenhum item de estoque encontrado. </template>

                <Column field="name" header="Item" />
                <Column field="code" header="Código" />
                <Column field="quantity" header="Quantidade" />
                <Column header="Compra">
                    <template #body="{ data }">R$ {{ Number(data.purchasePrice || 0).toFixed(2) }}</template>
                </Column>
                <Column header="Venda">
                    <template #body="{ data }">R$ {{ Number(data.salePrice || 0).toFixed(2) }}</template>
                </Column>
                <Column header="Status">
                    <template #body="{ data }">
                        <Tag :value="Number(data.quantity) <= 5 ? 'Atenção' : 'Estável'" :severity="Number(data.quantity) <= 5 ? 'warning' : 'success'" />
                    </template>
                </Column>
                <Column header="Ações" style="width: 9rem">
                    <template #body="{ data }">
                        <div class="table-actions">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="openEditDialog(data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="confirmDelete($event, data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </section>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :header="editingId ? 'Editar item' : 'Novo item'" :style="{ width: 'min(42rem, 96vw)' }">
        <div class="dialog-grid">
            <div class="field">
                <label for="stock-name">Nome</label>
                <InputText id="stock-name" v-model="form.name" />
            </div>
            <div class="field">
                <label for="stock-code">Código</label>
                <InputText id="stock-code" v-model="form.code" />
            </div>
            <div class="field field--full">
                <label for="stock-description">Descrição</label>
                <Textarea id="stock-description" v-model="form.description" rows="4" />
            </div>
            <div class="field">
                <label for="stock-quantity">Quantidade</label>
                <InputNumber id="stock-quantity" v-model="form.quantity" :min="0" />
            </div>
            <div class="field">
                <label for="stock-purchase">Preço de compra</label>
                <InputNumber id="stock-purchase" v-model="form.purchasePrice" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
            </div>
            <div class="field">
                <label for="stock-sale">Preço de venda</label>
                <InputNumber id="stock-sale" v-model="form.salePrice" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" class="p-button-text" @click="dialogVisible = false" />
            <Button label="Salvar item" icon="pi pi-check" :loading="saving" @click="saveStock" />
        </template>
    </Dialog>
</template>

<style scoped>
.page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-actions,
.table-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.stats-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

.stat-card,
.content-card {
    border-radius: 1.2rem;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.stat-card {
    padding: 1.2rem;
}

.stat-card__label {
    color: var(--text-color-secondary);
    font-size: 0.85rem;
}

.stat-card__value {
    display: block;
    margin-top: 0.35rem;
    font-size: 1.8rem;
}

.content-card {
    padding: 1.4rem;
}

.dialog-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.field--full {
    grid-column: 1 / -1;
}

@media (max-width: 768px) {
    .dialog-grid {
        grid-template-columns: 1fr;
    }
}
</style>
