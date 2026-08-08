<script setup>
import { computed, ref } from 'vue';
import BarcodeScannerDialog from '@/components/BarcodeScannerDialog.vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    position: { type: String, default: 'top' },
    service: { type: Object, default: () => ({}) },
    stockOptions: { type: Array, default: () => [] },
    form: { type: Object, required: true },
    loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'update:form', 'save', 'stock-change', 'cancel']);
const scannerVisible = ref(false);

const localForm = computed({
    get: () => props.form,
    set: (value) => emit('update:form', value)
});

const patchForm = (patch) => {
    emit('update:form', {
        ...props.form,
        ...patch
    });
};

const resolveScannedStock = ({ rawValue, data }) => {
    const candidates = [rawValue, data?.id, data?.stock_id, data?.code, data?.barcode].filter((value) => value !== undefined && value !== null).map(String);
    const selected = props.stockOptions.find((option) => candidates.includes(String(option.value)) || candidates.includes(String(option.code)));
    if (!selected) return;
    patchForm({ stock_id: selected.value });
    emit('stock-change');
};
</script>

<template>
    <BarcodeScannerDialog v-model="scannerVisible" title="Ler código da peça" @detected="resolveScannedStock" />
    <Dialog
        :header="`Peças utilizadas - OS ${service.order_of_service || service.id || ''}`"
        :visible="modelValue"
        @update:visible="emit('update:modelValue', $event)"
        :position="position"
        :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
        :style="{ width: 'clamp(22rem, 64vw, 56rem)' }"
        :modal="true"
    >
        <div class="surface-100 border-round p-3 mb-4">
            <div class="font-medium text-900">{{ service.client }}</div>
            <div class="text-600 text-sm">{{ service.product }} · {{ service.telephone }}</div>
        </div>

        <div class="grid p-fluid">
            <div class="field col-12">
                <div class="flex align-items-end gap-1">
                    <span class="p-float-label flex-1 stock-part-field">
                        <Dropdown inputId="servicePartStock" v-model="localForm.stock_id" :options="stockOptions" optionLabel="label" optionValue="value" filter class="w-full stock-part-select" @change="emit('stock-change')">
                            <template #value="slotProps">
                                <span v-if="slotProps.value">{{ stockOptions.find((option) => option.value === slotProps.value)?.label || slotProps.value }}</span>
                                <span v-else>{{ slotProps.placeholder }}</span>
                            </template>
                            <template #option="slotProps">
                                <span>{{ slotProps.option.label }} ({{ slotProps.option.quantity }} em estoque)</span>
                            </template>
                        </Dropdown>
                        <label for="servicePartStock"><span class="text-red-500">*</span> Peça do estoque</label>
                    </span>
                    <Button icon="pi pi-qrcode" class="p-button-outlined" aria-label="Ler código da peça" @click="scannerVisible = true" />
                </div>
            </div>

            <div class="field col-12 md:col-4">
                <span class="p-float-label"><InputNumber inputId="servicePartQuantity" :modelValue="localForm.quantity" @update:modelValue="patchForm({ quantity: $event })" showButtons :min="1" class="w-full" /><label for="servicePartQuantity"><span class="text-red-500">*</span> Quantidade</label></span>
            </div>

            <div class="field col-12 md:col-4">
                <span class="p-float-label"><InputNumber inputId="servicePartPrice" :modelValue="localForm.unit_price" @update:modelValue="patchForm({ unit_price: $event })" mode="currency" currency="BRL" locale="pt-BR" class="w-full" /><label for="servicePartPrice"><span class="text-red-500">*</span> Preço unitário</label></span>
            </div>

            <div class="field col-12 md:col-4">
                <span class="p-float-label"><InputText id="servicePartSerial" :modelValue="localForm.serial_number" @update:modelValue="patchForm({ serial_number: $event })" class="w-full" /><label for="servicePartSerial">Nº de série</label></span>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
            <Button :loading="loading" label="Registrar peça" icon="pi pi-check" @click="emit('save')" />
        </template>
    </Dialog>
</template>
