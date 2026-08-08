<script setup>
const props = defineProps({
    modelValue: { type: Boolean, default: false },
    client: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    title: { type: String, default: 'Cadastrar cliente' }
});

const emit = defineEmits(['update:modelValue', 'update:client', 'save', 'cancel']);
const update = (key, value) => emit('update:client', { ...props.client, [key]: value });
</script>

<template>
    <Dialog :header="title" :visible="modelValue" @update:visible="emit('update:modelValue', $event)" :breakpoints="{ '960px': '80vw', '640px': '100vw' }" :style="{ width: 'clamp(22rem, 50vw, 42rem)' }" :modal="true">
        <div class="grid p-fluid mt-3">
            <div class="field col-12">
                <span class="p-float-label">
                    <InputText id="clientFullName" :model-value="client.full_name" @update:model-value="update('full_name', $event)" />
                    <label for="clientFullName"><span class="text-red-500">*</span> Nome completo</label>
                </span>
            </div>
            <div class="field col-12 md:col-6">
                <span class="p-float-label">
                    <InputText id="clientDocument" :model-value="client.document" @update:model-value="update('document', $event)" />
                    <label for="clientDocument">CPF ou CNPJ</label>
                </span>
            </div>
            <div class="field col-12 md:col-6">
                <span class="p-float-label">
                    <InputText id="clientPhone" :model-value="client.phone" @update:model-value="update('phone', $event)" />
                    <label for="clientPhone"><span class="text-red-500">*</span> Telefone</label>
                </span>
            </div>
            <div class="field col-12">
                <span class="p-float-label">
                    <InputText id="clientAddress" :model-value="client.address" @update:model-value="update('address', $event)" />
                    <label for="clientAddress">Endereço</label>
                </span>
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
            <Button label="Salvar" icon="pi pi-check" :loading="loading" @click="emit('save')" />
        </template>
    </Dialog>
</template>
