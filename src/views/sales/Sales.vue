<script setup>
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(false);
const sales = ref([]);
const stock = ref([]);
const form = ref({
    customer_name: '',
    customer_document: '',
    customer_phone: '',
    notes: '',
    items: [{ stock_id: null, quantity: 1, unit_price: null, serial_number: '' }]
});

const stockOptions = computed(() =>
    stock.value.map((item) => ({
        label: `${item.name} (${item.code}) - saldo ${item.quantity}`,
        value: item.id
    }))
);

const loadData = async () => {
    const [salesResponse, stockResponse] = await Promise.all([
        Axios.get(API_CONFIG.SALES),
        Axios.get(API_CONFIG.STOCK)
    ]);
    sales.value = salesResponse.data || [];
    stock.value = stockResponse.data || [];
};

const onStockChange = (item) => {
    const selected = stock.value.find((stockItem) => stockItem.id === item.stock_id);
    if (selected && item.unit_price === null) {
        item.unit_price = Number(selected.salePrice ?? selected.saleprice ?? 0);
    }
};

const addItem = () => {
    form.value.items.push({ stock_id: null, quantity: 1, unit_price: null, serial_number: '' });
};

const removeItem = (index) => {
    if (form.value.items.length > 1) {
        form.value.items.splice(index, 1);
    }
};

const resetForm = () => {
    form.value = {
        customer_name: '',
        customer_document: '',
        customer_phone: '',
        notes: '',
        items: [{ stock_id: null, quantity: 1, unit_price: null, serial_number: '' }]
    };
};

const submit = async () => {
    if (!form.value.customer_name || form.value.items.some((item) => !item.stock_id || !item.quantity)) {
        toast.add({ severity: 'warn', summary: 'Dados incompletos', detail: 'Informe cliente e itens da venda.', life: 4000 });
        return;
    }

    loading.value = true;
    try {
        await Axios.post(API_CONFIG.SALES, form.value);
        toast.add({ severity: 'success', summary: 'Venda registrada', detail: 'Estoque atualizado com sucesso.', life: 5000 });
        resetForm();
        await loadData();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao registrar venda.', life: 5000 });
    } finally {
        loading.value = false;
    }
};

onMounted(loadData);
</script>

<template>
    <Toast />
    <div class="grid sales-page">
        <div class="col-12 xl:col-5">
            <div class="card">
                <h2 class="m-0 mb-2">Nova venda</h2>
                <p class="text-600 mt-0 mb-4">Registre peças vendidas avulsas e atualize o saldo do estoque.</p>

                <label class="block font-medium mb-2">Cliente</label>
                <InputText v-model="form.customer_name" class="w-full mb-3" placeholder="Nome do cliente" />

                <div class="formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label class="block font-medium mb-2">Documento</label>
                        <InputText v-model="form.customer_document" class="w-full" placeholder="CPF/CNPJ" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label class="block font-medium mb-2">Telefone</label>
                        <InputText v-model="form.customer_phone" class="w-full" placeholder="Contato" />
                    </div>
                </div>

                <div v-for="(item, index) in form.items" :key="index" class="p-3 mb-3 border-1 surface-border border-round">
                    <div class="flex align-items-center justify-content-between gap-3 mb-3">
                        <strong>Item {{ index + 1 }}</strong>
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" :disabled="form.items.length === 1" @click="removeItem(index)" />
                    </div>

                    <label class="block font-medium mb-2">Peça do estoque</label>
                    <Dropdown v-model="item.stock_id" :options="stockOptions" optionLabel="label" optionValue="value" filter class="w-full mb-3" placeholder="Selecione a peça" @change="onStockChange(item)" />

                    <div class="formgrid grid">
                        <div class="field col-12 md:col-4">
                            <label class="block font-medium mb-2">Qtd.</label>
                            <InputNumber v-model="item.quantity" showButtons :min="1" class="w-full" />
                        </div>
                        <div class="field col-12 md:col-4">
                            <label class="block font-medium mb-2">Preço</label>
                            <InputNumber v-model="item.unit_price" mode="currency" currency="BRL" locale="pt-BR" class="w-full" />
                        </div>
                        <div class="field col-12 md:col-4">
                            <label class="block font-medium mb-2">Série</label>
                            <InputText v-model="item.serial_number" class="w-full" />
                        </div>
                    </div>
                </div>

                <Button label="Adicionar item" icon="pi pi-plus" class="p-button-outlined w-full mb-3" @click="addItem()" />
                <Button :loading="loading" label="Registrar venda" icon="pi pi-check" class="w-full" @click="submit()" />
            </div>
        </div>

        <div class="col-12 xl:col-7">
            <div class="card">
                <h2 class="m-0 mb-4">Vendas registradas</h2>
                <DataTable :value="sales" responsiveLayout="scroll" paginator :rows="10">
                    <Column field="id" header="#" />
                    <Column field="customer_name" header="Cliente" />
                    <Column field="total_amount" header="Total" />
                    <Column field="sold_at" header="Data" />
                    <Column header="Itens">
                        <template #body="{ data }">{{ data.items?.length || 0 }}</template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
