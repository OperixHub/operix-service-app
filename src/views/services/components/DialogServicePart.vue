<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    position: { type: String, default: 'top' },
    service: { type: Object, default: () => ({}) },
    stockOptions: { type: Array, default: () => [] },
    form: { type: Object, required: true },
    loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'update:form', 'save', 'stock-change', 'cancel']);

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
</script>

<template>
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
                <label class="block font-medium mb-2">Peça do estoque</label>
                <Dropdown
                    v-model="localForm.stock_id"
                    :options="stockOptions"
                    optionLabel="label"
                    optionValue="value"
                    filter
                    class="w-full"
                    placeholder="Selecione a peça usada"
                    @change="emit('stock-change')"
                />
            </div>

            <div class="field col-12 md:col-4">
                <label class="block font-medium mb-2">Quantidade</label>
                <InputNumber :modelValue="localForm.quantity" @update:modelValue="patchForm({ quantity: $event })" showButtons :min="1" class="w-full" />
            </div>

            <div class="field col-12 md:col-4">
                <label class="block font-medium mb-2">Preço unitário</label>
                <InputNumber :modelValue="localForm.unit_price" @update:modelValue="patchForm({ unit_price: $event })" mode="currency" currency="BRL" locale="pt-BR" class="w-full" />
            </div>

            <div class="field col-12 md:col-4">
                <label class="block font-medium mb-2">Nº de série</label>
                <InputText :modelValue="localForm.serial_number" @update:modelValue="patchForm({ serial_number: $event })" class="w-full" />
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
            <Button :loading="loading" label="Registrar peça" icon="pi pi-check" @click="emit('save')" />
        </template>
    </Dialog>
</template>
