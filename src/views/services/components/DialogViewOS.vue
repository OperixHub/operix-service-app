<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    position: { type: String, default: 'top' },
    rowData: { type: Object, default: () => ({}) },
    dataGetOS: { type: Object, required: true },
    dataViewEstimateOS: { type: Array, required: true },
    typeOS: { type: Object, required: true },
    typeOsOptions: { type: Array, required: true },
    dataPutOrderOfServiceSimple: { type: Object, required: true },
    dataPutOrderOfServiceComplete: { type: Object, required: true },
    displayButtonRemoveOS: { type: Boolean, default: false },
    messageSimple: { type: Array, required: true },
    messageComplete: { type: Array, required: true },
    sendWhatsAppMessage: { type: Function, required: true },
    pdfGenerator: { type: Object, required: true }
});

const emit = defineEmits([
    'update:modelValue',
    'update:typeOS',
    'update:dataPutOrderOfServiceSimple',
    'update:dataPutOrderOfServiceComplete',
    'save',
    'delete'
]);

const getSimpleEstimate = () => ({ ...props.dataPutOrderOfServiceSimple });

const updateSimpleEstimate = (patch) => {
    const next = getSimpleEstimate();
    next[0] = {
        ...(next[0] || {}),
        ...patch
    };
    emit('update:dataPutOrderOfServiceSimple', next);
};

const simpleDescription = computed({
    get: () => props.dataPutOrderOfServiceSimple?.[0]?.description,
    set: (value) => updateSimpleEstimate({ description: value })
});

const simplePrice = computed({
    get: () => props.dataPutOrderOfServiceSimple?.[0]?.price,
    set: (value) => updateSimpleEstimate({ price: value })
});

const completeAmount = computed({
    get: () => props.dataPutOrderOfServiceComplete.amount,
    set: (value) => emit('update:dataPutOrderOfServiceComplete', {
        ...props.dataPutOrderOfServiceComplete,
        amount: value
    })
});

const completeDescription = computed({
    get: () => props.dataPutOrderOfServiceComplete.description,
    set: (value) => emit('update:dataPutOrderOfServiceComplete', {
        ...props.dataPutOrderOfServiceComplete,
        description: value
    })
});

const completePrice = computed({
    get: () => props.dataPutOrderOfServiceComplete.price,
    set: (value) => emit('update:dataPutOrderOfServiceComplete', {
        ...props.dataPutOrderOfServiceComplete,
        price: value
    })
});
</script>

<template>
    <Dialog
        :header="'Orçamento da OS ' + (rowData.order_of_service || '-')"
        :visible="modelValue"
        @update:visible="emit('update:modelValue', $event)"
        :position="position"
        :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
        :style="{ width: 'clamp(22rem, 78vw, 72rem)' }"
        :modal="true"
        :draggable="false"
        class="service-estimate-dialog"
    >
        <div class="flex justify-content-center mb-4 overflow-x-auto">
            <SelectButton :modelValue="typeOS" @update:modelValue="emit('update:typeOS', $event)" :options="typeOsOptions" optionLabel="label" dataKey="label" />
        </div>

        <!-- Orçamento Simplificado -->
        <DataTable v-if="typeOS.value == 'simples'" :value="dataViewEstimateOS" responsiveLayout="scroll" :rows="6">
            <transition-group tag="div">
                <Message v-for="msg of messageSimple" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
            </transition-group>
            <template #header>
                <div class="grid p-fluid mt-1">
                    <div class="field col-12 md:col-6">
                        <span class="p-float-label">
                            <Textarea id="addDescriptionOS" v-model="simpleDescription" rows="3" />
                            <label for="addDescriptionOS"><span style="color: red">*</span> Descrição</label>
                        </span>
                    </div>
                    <div class="field col-12 md:col-3 responsive-actions">
                        <span class="p-float-label">
                            <InputNumber id="addPriceOS" v-model="simplePrice" :minFractionDigits="2" />
                            <label for="addPriceOS"><span style="color: red">*</span> Preço</label>
                        </span>
                    </div>
                    <div class="field col-12 md:col-3">
                        <Button icon="pi pi-save" class="p-button-outlined p-button-info mr-2" @click="emit('save', rowData)" v-tooltip.top="'Salvar Orçamento'" />
                        <Button icon="pi pi-share-alt" class="p-button-outlined p-button-success mr-2" @click="sendWhatsAppMessage(rowData, dataGetOS)" v-tooltip.top="'Enviar Orçamento'" />
                        <Button icon="pi pi-download" class="p-button-outlined p-button-warning" @click="pdfGenerator.generateReceipt(rowData, dataGetOS)" v-tooltip.top="'Gerar Recibo'" :disabled="dataGetOS.estimate == '[]'" />
                    </div>
                </div>
            </template>
        </DataTable>

        <!-- Orçamento Detalhado -->
        <DataTable v-if="typeOS.value == 'completa'" :value="dataViewEstimateOS" responsiveLayout="scroll" :rows="6">
            <template #header>
                <transition-group tag="div">
                    <Message v-for="msg of messageComplete" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                </transition-group>
                <div class="grid p-fluid mt-1">
                    <div class="field col-12 md:col-3">
                        <span class="p-float-label">
                            <InputNumber id="addQuantOS" v-model="completeAmount" />
                            <label for="addQuantOS"><span style="color: red">*</span> Quantidade</label>
                        </span>
                    </div>
                    <div class="field col-12 md:col-5">
                        <span class="p-float-label">
                            <InputText id="addDescriptionOSC" v-model="completeDescription" />
                            <label for="addDescriptionOSC"><span style="color: red">*</span> Descrição</label>
                        </span>
                    </div>
                    <div class="field col-12 md:col-2">
                        <span class="p-float-label">
                            <InputNumber id="addPriceOSC" v-model="completePrice" :minFractionDigits="2" />
                            <label for="addPriceOSC"><span style="color: red">*</span> Preço</label>
                        </span>
                    </div>
                    <div class="field col-12 md:col-2 responsive-actions">
                        <Button icon="pi pi-plus" class="p-button-outlined p-button-info" @click="emit('save', rowData)" v-tooltip.top="'Adicionar Registro'" />
                    </div>
                </div>
            </template>
            <Column field="amount" header="Quantidade">
                <template #body="{ data }">{{ data.amount }}</template>
            </Column>
            <Column field="description" header="Descrição">
                <template #body="{ data }">{{ data.description }}</template>
            </Column>
            <Column field="price" header="Preço">
                <template #body="{ data }">{{ data.price }}</template>
            </Column>
            <Column headerStyle="width:4rem" v-if="displayButtonRemoveOS">
                <template #body="{ data }">
                    <Button icon="pi pi-trash" class="p-button-outlined p-button-danger" @click="emit('delete', dataGetOS.cod_order, data)" v-tooltip.top="'Excluir Registro'" />
                </template>
            </Column>
            <template #footer>
                <div class="grid p-fluid mt-1">
                    <div class="col-12 md:col-8">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon"> VALOR </span>
                            <span class="p-inputgroup-addon"> R$ {{ dataGetOS.value }}.00 </span>
                            <span class="p-inputgroup-addon">
                                <Button icon="pi pi-share-alt" class="p-button-outlined p-button-success mr-2" @click="sendWhatsAppMessage(rowData, dataGetOS)" v-tooltip.top="'Enviar Orçamento'" />
                                <Button icon="pi pi-download" class="p-button-outlined p-button-warning mr-2" @click="pdfGenerator.generateReceipt(rowData, dataGetOS)" v-tooltip.top="'Gerar Recibo'" :disabled="dataGetOS.estimate == '[]'" />
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </DataTable>
    </Dialog>
</template>

<style scoped>
.estimate-shell {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.estimate-hero {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 1.25rem 1rem;
    border-radius: 8px;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.estimate-hero__chips {
    align-content: flex-start;
}

.estimate-card {
    height: 100%;
}

.estimate-meta,
.estimate-metrics {
    display: grid;
    gap: 0.85rem;
}

.estimate-meta > div,
.estimate-metrics > div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-bottom: 0.85rem;
    border-bottom: 1px solid var(--surface-border);
}

.estimate-meta > div:last-child,
.estimate-metrics > div:last-child {
    padding-bottom: 0;
    border-bottom: 0;
}

.estimate-meta span,
.estimate-metrics span {
    color: var(--text-color-secondary);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.estimate-meta strong,
.estimate-metrics strong {
    color: var(--text-color);
    font-weight: 600;
}

.estimate-meta__note {
    line-height: 1.5;
}

.estimate-form-card {
    padding: 1rem;
    border-radius: 8px;
    background: var(--surface-section);
    border: 1px solid var(--surface-border);
}

.estimate-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem 0 0;
    border-top: 1px solid var(--surface-border);
}

@media (max-width: 960px) {
    .estimate-hero,
    .estimate-footer {
        flex-direction: column;
        align-items: flex-start;
    }

    .estimate-hero__chips {
        justify-content: flex-start;
    }
}
</style>
