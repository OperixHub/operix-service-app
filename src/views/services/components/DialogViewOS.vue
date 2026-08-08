<script setup>
import { computed, ref } from 'vue';
import BarcodeScannerDialog from '@/components/BarcodeScannerDialog.vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    position: { type: String, default: 'top' },
    rowData: { type: Object, default: () => ({}) },
    dataGetOS: { type: Object, required: true },
    dataViewEstimateOS: { type: Array, required: true },
    dataPutOrderOfServiceComplete: { type: Object, required: true },
    warrantyDays: { type: Number, default: 0 },
    warrantyLoading: { type: Boolean, default: false },
    onSaveWarranty: { type: Function, required: true },
    serviceParts: { type: Array, default: () => [] },
    stockOptions: { type: Array, default: () => [] },
    dataServicePart: { type: Object, required: true },
    servicePartLoading: { type: Boolean, default: false },
    onServicePartStockChange: { type: Function, required: true },
    messageComplete: { type: Array, required: true },
    sendWhatsAppMessage: { type: Function, required: true },
    pdfGenerator: { type: Object, required: true }
});

const scannerVisible = ref(false);
const scanMessage = ref('');

const emit = defineEmits([
    'update:modelValue',
    'update:dataPutOrderOfServiceComplete',
    'update:warrantyDays',
    'update:dataServicePart',
    'save',
    'delete',
    'delete-part',
    'add-service-part'
]);

const completeAmount = computed({
    get: () => props.dataPutOrderOfServiceComplete.amount,
    set: (value) => emit('update:dataPutOrderOfServiceComplete', { ...props.dataPutOrderOfServiceComplete, amount: value })
});

const completeDescription = computed({
    get: () => props.dataPutOrderOfServiceComplete.description,
    set: (value) => emit('update:dataPutOrderOfServiceComplete', { ...props.dataPutOrderOfServiceComplete, description: value })
});

const completePrice = computed({
    get: () => props.dataPutOrderOfServiceComplete.price,
    set: (value) => emit('update:dataPutOrderOfServiceComplete', { ...props.dataPutOrderOfServiceComplete, price: value })
});

const serviceStockId = computed({
    get: () => props.dataServicePart.stock_id,
    set: (value) => emit('update:dataServicePart', { ...props.dataServicePart, stock_id: value })
});

const warrantyDaysModel = computed({
    get: () => props.warrantyDays,
    set: (value) => emit('update:warrantyDays', Number(value || 0))
});

const servicePartQuantity = computed({
    get: () => props.dataServicePart.quantity,
    set: (value) => emit('update:dataServicePart', { ...props.dataServicePart, quantity: value })
});

const servicePartPrice = computed({
    get: () => props.dataServicePart.unit_price,
    set: (value) => emit('update:dataServicePart', { ...props.dataServicePart, unit_price: value })
});

const rows = computed(() => [
    ...(props.dataViewEstimateOS || []).map((item) => ({ ...item, source: 'Avulso', rowType: 'estimate' })),
    ...(props.serviceParts || []).map((item) => ({
        ...item,
        amount: item.quantity,
        description: item.item_name,
        price: item.unit_price,
        total: item.total_price,
        source: 'Estoque',
        rowType: 'part'
    }))
]);

const estimateTotal = computed(() => rows.value.reduce((total, item) => total + Number(item.total ?? (Number(item.price || 0) * Number(item.amount || 1))), 0));

const shareEstimate = computed(() => ({
    ...props.dataGetOS,
    value: estimateTotal.value.toFixed(2),
    estimate: JSON.stringify(rows.value.map((item) => ({
        amount: item.amount || 1,
        description: item.description,
        price: item.price
    })))
}));

const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const resolveScannedStock = ({ rawValue, data }) => {
    const candidates = [rawValue, data?.id, data?.stock_id, data?.code, data?.barcode, data?.serial_number].filter((value) => value !== undefined && value !== null).map(String);
    const selected = props.stockOptions.find((option) => candidates.includes(String(option.value)) || candidates.includes(String(option.code)) || candidates.includes(String(option.name)));
    if (!selected) {
        scanMessage.value = 'Nenhuma peça do estoque corresponde ao código lido.';
        return;
    }
    scanMessage.value = '';
    serviceStockId.value = selected.value;
    props.onServicePartStockChange();
};
</script>

<template>
    <Dialog
        :header="`Orçamento - OS ${rowData.order_of_service || dataGetOS.cod_order || '-'}`"
        :visible="modelValue"
        @update:visible="emit('update:modelValue', $event)"
        :position="position"
        :breakpoints="{ '960px': '92vw', '640px': '100vw' }"
        :style="{ width: 'clamp(22rem, 88vw, 78rem)' }"
        :modal="true"
        :draggable="false"
    >
        <div class="surface-100 border-round p-3 mb-4">
            <div class="font-medium text-900">{{ rowData.client || '-' }}</div>
            <div class="text-600 text-sm">{{ rowData.product || 'Produto não informado' }}</div>
            <div v-if="rowData.adress" class="text-600 text-sm">{{ rowData.adress }}</div>
        </div>

        <div class="service-parts-panel surface-section border-1 surface-border border-round p-3 mb-3">
            <div class="font-medium text-900 mb-3">Adicionar peça do estoque</div>
            <Message v-if="scanMessage" severity="warn" class="mb-3">{{ scanMessage }}</Message>
            <div class="grid p-fluid mb-2">
                <div class="field col-12 md:col-5">
                    <div class="flex align-items-end gap-1">
                        <span class="p-float-label flex-1 stock-part-field">
                            <Dropdown id="osStockPart" v-model="serviceStockId" :options="stockOptions" optionLabel="label" optionValue="value" filter class="w-full stock-part-select" @change="onServicePartStockChange">
                                <template #value="slotProps">
                                    <span v-if="slotProps.value">{{ stockOptions.find((option) => option.value === slotProps.value)?.label || slotProps.value }}</span>
                                    <span v-else>{{ slotProps.placeholder }}</span>
                                </template>
                                <template #option="slotProps">
                                    <span>{{ slotProps.option.label }} ({{ slotProps.option.quantity }} em estoque)</span>
                                </template>
                            </Dropdown>
                            <label for="osStockPart"><span class="text-red-500">*</span> Peça</label>
                        </span>
                        <Button icon="pi pi-qrcode" class="p-button-outlined" aria-label="Ler código da peça" v-tooltip.top="'Ler código da peça'" @click="scannerVisible = true" />
                    </div>
                </div>
                <div class="field col-12 md:col-2">
                    <span class="p-float-label"><InputNumber inputId="osPartQuantity" v-model="servicePartQuantity" :min="1" showButtons /><label for="osPartQuantity"><span class="text-red-500">*</span> Quantidade</label></span>
                </div>
                <div class="field col-12 md:col-2">
                    <span class="p-float-label"><InputNumber inputId="osPartPrice" v-model="servicePartPrice" mode="currency" currency="BRL" locale="pt-BR" /><label for="osPartPrice"><span class="text-red-500">*</span> Preço unitário</label></span>
                </div>
                <div class="field col-12 md:col-1 flex align-items-end">
                    <Button icon="pi pi-check" :loading="servicePartLoading" @click="emit('add-service-part')" v-tooltip.top="'Adicionar peça do estoque'" />
                </div>
            </div>
        </div>

        <div class="surface-section border-1 surface-border border-round p-3 mb-3">
            <div class="font-medium text-900 mb-3">Adicionar item avulso</div>
            <transition-group tag="div">
                <Message v-for="msg of messageComplete" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
            </transition-group>
            <div class="grid p-fluid">
                <div class="field col-12 md:col-6">
                    <span class="p-float-label"><InputText id="addDescriptionOSC" v-model="completeDescription" /><label for="addDescriptionOSC"><span class="text-red-500">*</span> Descrição</label></span>
                </div>
                <div class="field col-12 md:col-2">
                    <span class="p-float-label"><InputNumber inputId="addQuantOSC" v-model="completeAmount" :min="1" showButtons /><label for="addQuantOSC"><span class="text-red-500">*</span> Quantidade</label></span>
                </div>
                <div class="field col-12 md:col-2">
                    <span class="p-float-label"><InputNumber inputId="addPriceOSC" v-model="completePrice" mode="currency" currency="BRL" locale="pt-BR" /><label for="addPriceOSC"><span class="text-red-500">*</span> Preço unitário</label></span>
                </div>
                <div class="field col-12 md:col-2 flex align-items-end">
                    <Button icon="pi pi-check" aria-label="Adicionar item avulso" @click="emit('save', rowData)" v-tooltip.top="'Adicionar item avulso'" />
                </div>
            </div>
        </div>

        <DataTable :value="rows" responsiveLayout="scroll" size="small" :emptyMessage="'Nenhum item adicionado.'">
            <Column field="source" header="Origem" />
            <Column field="amount" header="Quantidade" />
            <Column field="description" header="Descrição" />
            <Column field="price" header="Unitário">
                <template #body="{ data }">{{ formatCurrency(data.price) }}</template>
            </Column>
            <Column header="Total">
                <template #body="{ data }">{{ formatCurrency(data.total ?? (Number(data.price || 0) * Number(data.amount || 1))) }}</template>
            </Column>
            <Column header="Ações" headerStyle="width:5rem">
                <template #body="{ data }">
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="data.rowType === 'part' ? emit('delete-part', data) : emit('delete', dataGetOS.cod_order, data)" v-tooltip.top="'Remover item'" />
                </template>
            </Column>
        </DataTable>

        <div class="flex align-items-center gap-2 mt-3 pt-3 border-top-1 surface-border">
            <div class="flex align-items-center gap-2 service-warranty-field ml-2">
                <label for="serviceWarranty" class="white-space-nowrap mb-0">Garantia do serviço (dias)</label>
                <InputNumber inputId="serviceWarranty" v-model="warrantyDaysModel" :min="0" :useGrouping="false" showButtons @blur="onSaveWarranty" />
            </div>
            <ProgressSpinner v-if="warrantyLoading" style="width: 2rem; height: 2rem" strokeWidth="4" />
        </div>

        <template #footer>
            <div class="flex align-items-center justify-content-between w-full gap-2">
                <strong>Valor total: {{ formatCurrency(estimateTotal) }}</strong>
                <div class="flex gap-2">
                    <Button label="Fechar" icon="pi pi-times" class="p-button-text" @click="emit('update:modelValue', false)" />
                    <Button label="Compartilhar" icon="pi pi-share-alt" class="p-button-outlined" @click="sendWhatsAppMessage(rowData, shareEstimate)" :disabled="!rows.length" />
                    <Button label="Gerar recibo" icon="pi pi-download" class="p-button-outlined" @click="pdfGenerator.generateReceipt(rowData, shareEstimate)" :disabled="!rows.length" />
                </div>
            </div>
        </template>
    </Dialog>
    <BarcodeScannerDialog v-model="scannerVisible" title="Ler código da peça" @detected="resolveScannedStock" />
</template>
