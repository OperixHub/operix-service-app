<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    position: { type: String, default: 'top' },
    data: { type: Object, required: true },
    typesProductOptions: { type: Array, required: true }
});

const emit = defineEmits(['update:modelValue', 'update:data', 'save', 'cancel']);

const product = computed({
    get: () => props.data.product,
    set: (value) => emit('update:data', { ...props.data, product: value })
});
</script>

<template>
    <Dialog
        header="Editar produto"
        :visible="modelValue"
        @update:visible="emit('update:modelValue', $event)"
        :position="position"
        :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
        :style="{ width: 'clamp(20rem, 32vw, 28rem)' }"
        :modal="true"
    >
        <div class="grid p-fluid mt-3">
            <div class="field col-12">
                <span class="p-float-label">
                    <Dropdown inputId="editServiceProduct" v-model="product" :options="typesProductOptions" filter class="w-full" />
                    <label for="editServiceProduct"><span class="text-red-500">*</span> Produto</label>
                </span>
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
            <Button label="Salvar" icon="pi pi-check" @click="emit('save')" />
        </template>
    </Dialog>
</template>
