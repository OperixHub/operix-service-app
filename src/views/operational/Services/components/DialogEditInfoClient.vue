<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    position: { type: String, default: 'top' },
    dataEditInfoClient: { type: Object, required: true },
    typesProductOptions: { type: Array, required: true },
    messages: { type: Array, required: true },
    isInfoClientChanged: { type: Function, required: true }
});

const emit = defineEmits(['update:modelValue', 'update:dataEditInfoClient', 'save', 'cancel', 'reset']);

const updateInfoClient = (patch) => {
    emit('update:dataEditInfoClient', {
        ...props.dataEditInfoClient,
        ...patch
    });
};

const product = computed({
    get: () => props.dataEditInfoClient.product,
    set: (value) => updateInfoClient({ product: value })
});

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
</script>

<template>
    <Dialog
        header="Informações do Cliente"
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
        <div class="grid p-fluid mt-1">
            <div class="field col-12 md:col-5">
                <span class="p-float-label">
                    <Dropdown id="editProduct" :options="typesProductOptions" v-model="product" />
                    <label for="editProduct"><span style="color: red">*</span> Produto</label>
                </span>
            </div>
            <div class="field col-12 md:col-7">
                <span class="p-float-label">
                    <InputText type="text" id="editClient" v-model="client" />
                    <label for="editClient"><span style="color: red">*</span> Cliente</label>
                </span>
            </div>
            <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <InputText type="text" id="editTelephone" v-model="telephone" :maxlength="11" />
                    <label for="editTelephone"><span style="color: red">*</span> Telefone</label>
                </span>
            </div>
            <div class="field col-12 md:col-8">
                <span class="p-float-label">
                    <InputText type="text" id="editAdress" v-model="adress" />
                    <label for="editAdress">Endereço</label>
                </span>
            </div>
            <div class="field col-12 md:col-12">
                <span class="p-float-label">
                    <Textarea inputId="editObservation" rows="1" cols="10" v-model="observation" />
                    <label for="editObservation">Observação</label>
                </span>
            </div>
        </div>
        <template #footer>
            <Button label="Resetar" icon="pi pi-refresh" class="p-button-primary" v-show="isInfoClientChanged()" @click="emit('reset')" />
            <Button label="Cancelar" icon="pi pi-times" class="p-button-danger" @click="emit('cancel')" />
            <Button label="Editar" icon="pi pi-check" class="p-button-warning" @click="emit('save')" />
        </template>
    </Dialog>
</template>
