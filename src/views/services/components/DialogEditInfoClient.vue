<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    position: { type: String, default: 'top' },
    dataEditInfoClient: { type: Object, required: true },
    messages: { type: Array, required: true },
    save: { type: Function, required: true }
});

const emit = defineEmits(['update:modelValue', 'update:dataEditInfoClient', 'cancel', 'reset']);
const editing = ref(false);
const saving = ref(false);

const updateInfoClient = (patch) => {
    emit('update:dataEditInfoClient', {
        ...props.dataEditInfoClient,
        ...patch
    });
};

const client = computed({
    get: () => props.dataEditInfoClient.client,
    set: (value) => updateInfoClient({ client: value })
});

const telephone = computed({
    get: () => props.dataEditInfoClient.telephone,
    set: (value) => updateInfoClient({ telephone: value })
});

const adress = computed({
    get: () => props.dataEditInfoClient.adress,
    set: (value) => updateInfoClient({ adress: value })
});

const observation = computed({
    get: () => props.dataEditInfoClient.observation,
    set: (value) => updateInfoClient({ observation: value })
});

const whatsappUrl = computed(() => `https://wa.me/${String(props.dataEditInfoClient.telephone || '').replace(/\D/g, '')}`);
const mapsUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.dataEditInfoClient.adress || '')}`);

const handleSave = async () => {
    saving.value = true;
    try {
        if (await props.save()) editing.value = false;
    } finally {
        saving.value = false;
    }
};

watch(() => props.modelValue, (visible) => {
    if (!visible) editing.value = false;
});
</script>

<template>
    <Dialog
        header="Informações do cliente"
        :visible="modelValue"
        @update:visible="emit('update:modelValue', $event)"
        :position="position"
        :breakpoints="{ '960px': '82vw', '640px': '100vw' }"
        :style="{ width: 'clamp(22rem, 50vw, 44rem)' }"
        :modal="true"
    >
        <transition-group tag="div">
            <Message v-for="msg of messages" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
        </transition-group>
        <div class="flex align-items-center justify-content-between gap-2 mt-3 mb-2">
            <div class="flex align-items-center gap-3">
                <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="text-green-500" v-tooltip.top="'Abrir conversa no WhatsApp'" aria-label="Abrir conversa no WhatsApp">
                    <i class="pi pi-whatsapp text-xl"></i>
                </a>
                <a v-if="dataEditInfoClient.adress" :href="mapsUrl" target="_blank" rel="noopener noreferrer" class="text-blue-500" v-tooltip.top="'Visualizar endereço no Google Maps'" aria-label="Visualizar endereço no Google Maps">
                    <i class="pi pi-map-marker text-xl"></i>
                </a>
            </div>
            <div class="flex align-items-center gap-2">
                <InputSwitch inputId="editClientSwitch" v-model="editing" class="client-edit-switch" @change="!editing && emit('reset')" />
                <label for="editClientSwitch" class="font-medium">Editar</label>
            </div>
        </div>
        <div class="grid p-fluid mt-3">
            <div class="field col-12">
                <span class="p-float-label">
                    <InputText type="text" id="editClient" v-model="client" :disabled="!editing" />
                    <label for="editClient"><span style="color: red">*</span> Cliente</label>
                </span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <InputText type="text" id="editTelephone" v-model="telephone" :maxlength="11" :disabled="!editing" />
                    <label for="editTelephone"><span style="color: red">*</span> Telefone</label>
                </span>
            </div>
            <div class="field col-12 md:col-8">
                <span class="p-float-label">
                    <InputText type="text" id="editAdress" v-model="adress" :disabled="!editing" />
                    <label for="editAdress">Endereço</label>
                </span>
            </div>
            <div class="field col-12 md:col-12">
                <span class="p-float-label">
                    <Textarea inputId="editObservation" rows="1" cols="10" v-model="observation" :disabled="!editing" />
                    <label for="editObservation">Observação</label>
                </span>
            </div>
        </div>
        <template #footer>
            <Button label="Fechar" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
            <Button v-if="editing" label="Salvar" icon="pi pi-check" :loading="saving" @click="handleSave" />
        </template>
    </Dialog>
</template>

<style scoped>
:deep(.client-edit-switch.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
    background: var(--orange-500);
}

.client-edit-switch {
    height: 1.25rem;
    width: 2.25rem;
}

:deep(.client-edit-switch .p-inputswitch-slider::before) {
    height: .9rem;
    margin-top: -.45rem;
    width: .9rem;
}

:deep(.client-edit-switch.p-inputswitch-checked .p-inputswitch-slider::before) {
    transform: translateX(1rem);
}
</style>
