<script setup>
import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(false);
const warranties = ref([]);
const stock = ref([]);
const form = ref({
    service_id: null,
    stock_id: null,
    quantity: 1,
    unit_price: null,
    warranty_months: 3,
    serial_number: '',
    notes: ''
});

const stockOptions = computed(() =>
    stock.value.map((item) => ({
        label: `${item.name} (${item.code}) - saldo ${item.quantity}`,
        value: item.id
    }))
);

const loadData = async () => {
    const [warrantiesResponse, stockResponse] = await Promise.all([
        Axios.get(API_CONFIG.INVENTORY.WARRANTIES),
        Axios.get(API_CONFIG.INVENTORY.STOCK)
    ]);
    warranties.value = warrantiesResponse.data || [];
    stock.value = stockResponse.data || [];
};

const onStockChange = () => {
    const selected = stock.value.find((item) => item.id === form.value.stock_id);
    if (selected && form.value.unit_price === null) {
        form.value.unit_price = Number(selected.salePrice ?? selected.saleprice ?? 0);
    }
};

const submitServicePart = async () => {
    if (!form.value.service_id || !form.value.stock_id || !form.value.quantity) {
        toast.add({ severity: 'warn', summary: 'Dados incompletos', detail: 'Informe serviço, peça e quantidade.', life: 4000 });
        return;
    }

    loading.value = true;
    try {
        await Axios.post(API_CONFIG.INVENTORY.SERVICE_PARTS(form.value.service_id), {
            stock_id: form.value.stock_id,
            quantity: form.value.quantity,
            unit_price: form.value.unit_price,
            warranty_months: form.value.warranty_months,
            serial_number: form.value.serial_number || null,
            notes: form.value.notes || null
        });
        toast.add({ severity: 'success', summary: 'Peça registrada', detail: 'Estoque baixado e garantia gerada quando aplicável.', life: 5000 });
        form.value = { service_id: null, stock_id: null, quantity: 1, unit_price: null, warranty_months: 3, serial_number: '', notes: '' };
        await loadData();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao registrar peça do serviço.', life: 5000 });
    } finally {
        loading.value = false;
    }
};

onMounted(loadData);
</script>

<template>
    <Toast />
    <div class="grid inventory-page">
        <div class="col-12 xl:col-4">
            <div class="card">
                <h2 class="m-0 mb-2">Peça usada em serviço</h2>
                <p class="text-600 mt-0 mb-4">Registre peças aplicadas em serviços para baixar estoque e gerar garantia vinculada.</p>

                <label class="block font-medium mb-2">Código do serviço</label>
                <InputNumber v-model="form.service_id" :min="1" class="w-full mb-3" placeholder="ID do serviço" />

                <label class="block font-medium mb-2">Peça do estoque</label>
                <Dropdown v-model="form.stock_id" :options="stockOptions" optionLabel="label" optionValue="value" filter class="w-full mb-3" placeholder="Selecione a peça" @change="onStockChange()" />

                <div class="formgrid grid">
                    <div class="field col-6">
                        <label class="block font-medium mb-2">Qtd.</label>
                        <InputNumber v-model="form.quantity" showButtons :min="1" class="w-full" />
                    </div>
                    <div class="field col-6">
                        <label class="block font-medium mb-2">Preço</label>
                        <InputNumber v-model="form.unit_price" mode="currency" currency="BRL" locale="pt-BR" class="w-full" />
                    </div>
                    <div class="field col-6">
                        <label class="block font-medium mb-2">Garantia</label>
                        <InputNumber v-model="form.warranty_months" suffix=" meses" :min="0" class="w-full" />
                    </div>
                    <div class="field col-6">
                        <label class="block font-medium mb-2">Série</label>
                        <InputText v-model="form.serial_number" class="w-full" />
                    </div>
                </div>

                <label class="block font-medium mb-2">Observações</label>
                <Textarea v-model="form.notes" rows="3" autoResize class="w-full mb-4" />

                <Button :loading="loading" label="Registrar peça" icon="pi pi-check" class="w-full" @click="submitServicePart()" />
            </div>
        </div>

        <div class="col-12 xl:col-8">
            <div class="card">
                <h2 class="m-0 mb-4">Garantias</h2>
                <DataTable :value="warranties" responsiveLayout="scroll" paginator :rows="10">
                    <Column field="id" header="#" />
                    <Column field="source_type" header="Origem">
                        <template #body="{ data }">{{ data.source_type === 'sale' ? 'Venda' : 'Serviço' }}</template>
                    </Column>
                    <Column field="customer_name" header="Cliente" />
                    <Column field="item_name" header="Peça" />
                    <Column field="serial_number" header="Série" />
                    <Column field="warranty_end_at" header="Fim da garantia" />
                    <Column field="status" header="Status" />
                </DataTable>
            </div>
        </div>
    </div>
</template>
