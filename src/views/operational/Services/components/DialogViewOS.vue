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

const emit = defineEmits(['update:modelValue', 'update:typeOS', 'save', 'delete']);

const estimateItems = computed(() => (Array.isArray(props.dataViewEstimateOS) ? props.dataViewEstimateOS : []));
const isSimpleMode = computed(() => props.typeOS?.value === 'simples');
const modeLabel = computed(() => (isSimpleMode.value ? 'Simplificado' : 'Detalhado'));
const estimateCount = computed(() => estimateItems.value.length);
const estimateTotal = computed(() => Number(props.dataGetOS?.value ?? estimateItems.value.reduce((sum, item) => sum + Number(item.price || 0), 0)));

const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(date);
};
</script>

<template>
    <Dialog
        :header="'Orçamento da OS ' + (rowData.order_of_service || '-')"
        :visible="modelValue"
        @update:visible="emit('update:modelValue', $event)"
        :position="position"
        :breakpoints="{ '960px': '96vw' }"
        :style="{ width: '78vw' }"
        :modal="true"
        :draggable="false"
        class="service-estimate-dialog"
    >
        <div class="estimate-shell">
            <div class="estimate-hero">
                <div>
                    <div class="text-500 text-sm uppercase tracking-2 mb-2">Orçamento operacional</div>
                    <h2 class="m-0 text-900">{{ rowData.client || 'Cliente não informado' }}</h2>
                    <p class="mt-2 mb-0 text-600 line-height-3">
                        {{ rowData.product || 'Produto não informado' }}
                        <span v-if="rowData.telephone"> · {{ rowData.telephone }}</span>
                    </p>
                </div>
                <div class="flex flex-wrap gap-2 justify-content-end estimate-hero__chips">
                    <Tag :value="modeLabel" severity="info" />
                    <Tag :value="estimateCount + ' item(s)'" severity="success" />
                    <Tag :value="formatCurrency(estimateTotal)" severity="warning" />
                </div>
            </div>

            <div class="grid mt-4">
                <div class="col-12 lg:col-4">
                    <Card class="estimate-card estimate-card--summary">
                        <template #title>
                            <div class="flex align-items-center justify-content-between gap-2">
                                <span>Resumo da OS</span>
                                <Chip :label="String(rowData.order_of_service || '-')" />
                            </div>
                        </template>
                        <template #content>
                            <div class="estimate-meta">
                                <div>
                                    <span>Cliente</span>
                                    <strong>{{ rowData.client || '-' }}</strong>
                                </div>
                                <div>
                                    <span>Produto</span>
                                    <strong>{{ rowData.product || '-' }}</strong>
                                </div>
                                <div>
                                    <span>Telefone</span>
                                    <strong>{{ rowData.telephone || '-' }}</strong>
                                </div>
                                <div>
                                    <span>Endereço</span>
                                    <strong>{{ rowData.adress || '-' }}</strong>
                                </div>
                                <div>
                                    <span>Criada em</span>
                                    <strong>{{ formatDate(rowData.created_at) }}</strong>
                                </div>
                                <div>
                                    <span>Observação</span>
                                    <strong class="estimate-meta__note">{{ rowData.observation || 'Sem observações' }}</strong>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <Card class="estimate-card mt-3">
                        <template #title>Resumo financeiro</template>
                        <template #content>
                            <div class="estimate-metrics">
                                <div>
                                    <span>Total</span>
                                    <strong>{{ formatCurrency(estimateTotal) }}</strong>
                                </div>
                                <div>
                                    <span>Registros</span>
                                    <strong>{{ estimateCount }}</strong>
                                </div>
                                <div>
                                    <span>Modo</span>
                                    <strong>{{ modeLabel }}</strong>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="col-12 lg:col-8">
                    <Card class="estimate-card estimate-card--editor">
                        <template #title>
                            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
                                <div>
                                    <div class="text-500 text-sm uppercase tracking-2 mb-2">Editor do orçamento</div>
                                    <h3 class="m-0 text-900">{{ isSimpleMode ? 'Criação simplificada' : 'Criação detalhada' }}</h3>
                                </div>
                                <SelectButton
                                    :modelValue="typeOS"
                                    @update:modelValue="emit('update:typeOS', $event)"
                                    :options="typeOsOptions"
                                    optionLabel="label"
                                    dataKey="label"
                                    class="estimate-mode-switch"
                                />
                            </div>
                        </template>
                        <template #content>
                            <TransitionGroup tag="div">
                                <Message v-for="msg of (isSimpleMode ? messageSimple : messageComplete)" :severity="msg.severity" :key="msg.content">
                                    {{ msg.content }}
                                </Message>
                            </TransitionGroup>

                            <div v-if="isSimpleMode" class="estimate-form-card">
                                <div class="grid p-fluid align-items-end">
                                    <div class="field col-12 md:col-7">
                                        <span class="p-float-label">
                                            <Textarea id="addDescriptionOS" v-model="dataPutOrderOfServiceSimple[0].description" rows="5" autoResize />
                                            <label for="addDescriptionOS"><span class="text-red-500">*</span> Descrição do orçamento</label>
                                        </span>
                                    </div>
                                    <div class="field col-12 md:col-3">
                                        <span class="p-float-label">
                                            <InputNumber id="addPriceOS" v-model="dataPutOrderOfServiceSimple[0].price" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
                                            <label for="addPriceOS"><span class="text-red-500">*</span> Valor total</label>
                                        </span>
                                    </div>
                                    <div class="field col-12 md:col-2 flex justify-content-end">
                                        <Button icon="pi pi-save" label="Salvar" class="p-button-info w-full" @click="emit('save', rowData)" v-tooltip.top="'Salvar orçamento simplificado'" />
                                    </div>
                                </div>
                            </div>

                            <div v-else class="estimate-form-card">
                                <div class="grid p-fluid align-items-end">
                                    <div class="field col-12 md:col-2">
                                        <span class="p-float-label">
                                            <InputNumber id="addQuantOS" v-model="dataPutOrderOfServiceComplete.amount" :min="1" />
                                            <label for="addQuantOS"><span class="text-red-500">*</span> Qtd.</label>
                                        </span>
                                    </div>
                                    <div class="field col-12 md:col-6">
                                        <span class="p-float-label">
                                            <InputText id="addDescriptionOSC" v-model="dataPutOrderOfServiceComplete.description" />
                                            <label for="addDescriptionOSC"><span class="text-red-500">*</span> Descrição</label>
                                        </span>
                                    </div>
                                    <div class="field col-12 md:col-2">
                                        <span class="p-float-label">
                                            <InputNumber id="addPriceOSC" v-model="dataPutOrderOfServiceComplete.price" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
                                            <label for="addPriceOSC"><span class="text-red-500">*</span> Valor</label>
                                        </span>
                                    </div>
                                    <div class="field col-12 md:col-2 flex justify-content-end">
                                        <Button icon="pi pi-plus" label="Adicionar" class="p-button-info w-full" @click="emit('save', rowData)" v-tooltip.top="'Adicionar item ao orçamento'" />
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <DataTable :value="estimateItems" responsiveLayout="scroll" showGridlines class="estimate-table">
                                <template #empty>
                                    <div class="py-4 text-center text-500">Nenhum item lançado neste orçamento.</div>
                                </template>

                                <Column v-if="!isSimpleMode" field="amount" header="Qtd." style="width: 8rem" />
                                <Column field="description" header="Descrição" />
                                <Column field="price" header="Valor" style="width: 12rem">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.price) }}
                                    </template>
                                </Column>
                                <Column v-if="!isSimpleMode && displayButtonRemoveOS" headerStyle="width: 5rem" bodyClass="text-center">
                                    <template #body="{ data }">
                                        <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-outlined" @click="emit('delete', dataGetOS.cod_order, data)" v-tooltip.top="'Excluir item'" />
                                    </template>
                                </Column>
                            </DataTable>

                            <div class="estimate-footer">
                                <div>
                                    <span class="text-500 text-sm">Total do orçamento</span>
                                    <strong class="text-900 text-2xl">{{ formatCurrency(estimateTotal) }}</strong>
                                </div>
                                <div class="flex flex-wrap gap-2 justify-content-end">
                                    <Button
                                        icon="pi pi-share-alt"
                                        label="WhatsApp"
                                        class="p-button-success"
                                        @click="sendWhatsAppMessage(rowData, dataGetOS)"
                                        v-tooltip.top="'Enviar orçamento pelo WhatsApp'"
                                    />
                                    <Button
                                        icon="pi pi-download"
                                        label="PDF"
                                        class="p-button-warning"
                                        @click="pdfGenerator.generateReceipt(rowData, dataGetOS)"
                                        v-tooltip.top="'Gerar recibo'"
                                        :disabled="dataGetOS.estimate == '[]'"
                                    />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
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
    border-radius: 1.25rem;
    background:
        linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.08)),
        var(--surface-card);
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
    border-radius: 1rem;
    background: var(--surface-50);
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
