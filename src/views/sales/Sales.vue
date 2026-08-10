<script setup>
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import DialogClientForm from '@/views/clients/components/DialogClientForm.vue';
import BarcodeScannerDialog from '@/components/BarcodeScannerDialog.vue';
import ReminderDialog from '@/components/ReminderDialog.vue';

const toast = useToast();
const loading = ref(false);
const tableLoading = ref(false);
const sales = ref([]);
const salesFilters = ref({ global: { value: null, matchMode: 'contains' } });
const stock = ref([]);
const clients = ref([]);
const users = ref([]);
const clientDialogVisible = ref(false);
const clientLoading = ref(false);
const scannerVisible = ref(false);
const reminderVisible = ref(false);
const reminderSaleId = ref(null);
const openSaleReminder = (sale) => { reminderSaleId.value = sale.id; reminderVisible.value = true; };
const scanMessage = ref('');
const newClient = ref({ full_name: '', document: '', phone: '', address: '' });
const form = ref({
    attendant_user_id: null,
    client_id: null,
    customer_name: '',
    customer_document: '',
    customer_phone: '',
    notes: '',
    items: []
});
const itemForm = ref({ stock_id: null, quantity: 1, unit_price: null, warranty_days: 0 });

const stockOptions = computed(() =>
    stock.value.map((item) => ({
        label: `${item.name} - ${item.code}`,
        value: item.id,
        code: item.code,
        name: item.name,
        quantity: item.quantity,
        warranty_days: item.warranty_days
    }))
);

const resolveScannedStock = ({ rawValue, data }) => {
    const candidates = [rawValue, data?.id, data?.stock_id, data?.code, data?.barcode, data?.serial_number].filter((value) => value !== undefined && value !== null).map(String);
    const selected = stockOptions.value.find((option) => candidates.includes(String(option.value)) || candidates.includes(String(option.code)) || candidates.includes(String(option.name)));
    if (!selected) { scanMessage.value = 'Nenhuma peça do estoque corresponde ao código lido.'; return; }
    scanMessage.value = '';
    itemForm.value.stock_id = selected.value;
    onStockChange();
};

const loadData = async () => {
    tableLoading.value = true;
    try {
        const [salesResponse, stockResponse, clientsResponse, usersResponse] = await Promise.all([
            Axios.get(API_CONFIG.SALES),
            Axios.get(API_CONFIG.STOCK),
            Axios.get(API_CONFIG.CLIENTS),
            Axios.get(API_CONFIG.USERS)
        ]);
        sales.value = salesResponse.data || [];
        stock.value = stockResponse.data || [];
        clients.value = clientsResponse.data || [];
        users.value = usersResponse.data || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar dados da tela de vendas.', life: 5000 });
    } finally {
        tableLoading.value = false;
    }
};

const selectClient = (client) => {
    if (!client) return;
    form.value.customer_name = client.full_name;
    form.value.customer_document = client.document || '';
    form.value.customer_phone = client.phone || '';
};

const openClientDialog = () => { newClient.value = { full_name: '', document: '', phone: '', address: '' }; clientDialogVisible.value = true; };
const saveClient = async () => {
    if (!newClient.value.full_name || !newClient.value.phone) { toast.add({ severity: 'warn', summary: 'Validação', detail: 'Nome completo e telefone são obrigatórios.', life: 4000 }); return; }
    clientLoading.value = true;
    try {
        const response = await Axios.post(API_CONFIG.CLIENTS, newClient.value);
        const client = response.data;
        clients.value = [...clients.value, client].sort((a, b) => a.full_name.localeCompare(b.full_name));
        form.value.client_id = client.id;
        selectClient(client);
        clientDialogVisible.value = false;
    } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao cadastrar cliente.', life: 5000 }); }
    finally { clientLoading.value = false; }
};

const onStockChange = () => {
    const selected = stock.value.find((stockItem) => stockItem.id === itemForm.value.stock_id);
    if (selected && itemForm.value.unit_price === null) {
        itemForm.value.unit_price = Number(selected.salePrice ?? selected.saleprice ?? 0);
    }
    if (selected) itemForm.value.warranty_days = Number(selected.warranty_days || 0);
};

const addItem = () => {
    const selected = stock.value.find((stockItem) => stockItem.id === itemForm.value.stock_id);
    if (!selected || !itemForm.value.quantity || itemForm.value.unit_price === null) {
        toast.add({ severity: 'warn', summary: 'Dados incompletos', detail: 'Informe peça, quantidade e preço unitário.', life: 4000 });
        return;
    }
    form.value.items.push({ ...itemForm.value });
    itemForm.value = { stock_id: null, quantity: 1, unit_price: null, warranty_days: 0 };
};

const removeItem = (index) => {
    form.value.items.splice(index, 1);
};

const resetForm = () => {
    form.value = {
        client_id: null,
        attendant_user_id: null,
        customer_name: '',
        customer_document: '',
        customer_phone: '',
        notes: '',
        items: []
    };
    itemForm.value = { stock_id: null, quantity: 1, unit_price: null, warranty_days: 0 };
};

const totalItems = computed(() => form.value.items.reduce((total, item) => total + Number(item.quantity || 0) * Number(item.unit_price || 0), 0));

const submit = async () => {
    if (!form.value.client_id || !form.value.attendant_user_id || !form.value.items.length || form.value.items.some((item) => !item.stock_id || !item.quantity)) {
        toast.add({ severity: 'warn', summary: 'Dados incompletos', detail: 'Informe cliente, atendente e itens da venda.', life: 4000 });
        return;
    }

    loading.value = true;
    try {
        await Axios.post(API_CONFIG.SALES, form.value);
        toast.add({ severity: 'success', summary: 'Venda registrada', detail: 'Estoque atualizado com sucesso.', life: 5000 });
        resetForm();
        await loadData();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao registrar venda.', life: 5000 });
    } finally {
        loading.value = false;
    }
};

onMounted(loadData);
</script>

<template>
    <Toast />
    <DialogClientForm v-model="clientDialogVisible" v-model:client="newClient" :loading="clientLoading" title="Cadastrar cliente" @save="saveClient" @cancel="clientDialogVisible = false" />
    <BarcodeScannerDialog v-model="scannerVisible" title="Ler código da peça" @detected="resolveScannedStock" />
    <ReminderDialog v-model="reminderVisible" :sale-id="reminderSaleId" />
    <div class="grid sales-page">
        <div class="col-12">
            <div class="card">
                <div class="page-title-row mb-4">
                    <h2 class="page-title">Registrar venda</h2>
                    <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Registre peças vendidas avulsas. O saldo do estoque será atualizado após a confirmação.'" aria-label="Informações sobre o cadastro de venda" />
                </div>

                <div class="flex justify-content-end mb-2">
                    <a href="#" class="text-blue-500 text-sm" @click.prevent="openClientDialog">Cadastrar cliente</a>
                </div>
                <div class="mb-3">
                    <span class="p-float-label">
                        <Dropdown inputId="saleClient" v-model="form.client_id" :options="clients" optionLabel="full_name" optionValue="id" filter class="w-full" @change="selectClient(clients.find((client) => client.id === form.client_id))" />
                        <label for="saleClient"><span class="text-red-500">*</span> Cliente</label>
                    </span>
                </div>
                <div class="mb-3">
                    <span class="p-float-label"><Dropdown inputId="saleAttendant" v-model="form.attendant_user_id" :options="users" optionLabel="name" optionValue="id" filter showClear class="w-full" /><label for="saleAttendant"><span class="text-red-500">*</span> Atendente</label></span>
                </div>

                <div class="surface-section border-1 surface-border border-round p-3 mb-3">
                    <div class="font-medium text-900 mb-3">Adicionar item</div>
                    <Message v-if="scanMessage" severity="warn" class="mb-3">{{ scanMessage }}</Message>
                    <div class="grid p-fluid align-items-end">
                        <div class="field col-12 md:col-5">
                            <div class="flex align-items-end gap-1">
                                <span class="p-float-label flex-1 stock-part-field">
                                    <Dropdown inputId="saleStockItem" v-model="itemForm.stock_id" :options="stockOptions" optionLabel="label" optionValue="value" filter class="w-full stock-part-select" @change="onStockChange">
                                        <template #value="slotProps">
                                            <span v-if="slotProps.value">{{ stockOptions.find((option) => option.value === slotProps.value)?.label || slotProps.value }}</span>
                                            <span v-else>{{ slotProps.placeholder }}</span>
                                        </template>
                                        <template #option="slotProps">
                                            <span>{{ slotProps.option.label }} ({{ slotProps.option.quantity }} em estoque)</span>
                                        </template>
                                    </Dropdown>
                                    <label for="saleStockItem"><span class="text-red-500">*</span> Item do estoque</label>
                                </span>
                                <Button icon="pi pi-qrcode" class="p-button-outlined" aria-label="Ler código da peça" v-tooltip.top="'Ler código da peça'" @click="scannerVisible = true" />
                            </div>
                        </div>
                        <div class="field col-12 md:col-2">
                            <span class="p-float-label">
                                <InputNumber inputId="saleItemQuantity" v-model="itemForm.quantity" showButtons :min="1" class="w-full" />
                                <label for="saleItemQuantity"><span class="text-red-500">*</span> Quantidade</label>
                            </span>
                        </div>
                        <div class="field col-12 md:col-2">
                            <span class="p-float-label">
                                <InputNumber inputId="saleItemPrice" v-model="itemForm.unit_price" mode="currency" currency="BRL" locale="pt-BR" class="w-full" />
                                <label for="saleItemPrice"><span class="text-red-500">*</span> Preço unitário</label>
                            </span>
                        </div>
                        <div class="field col-12 md:col-1 flex justify-content-end">
                            <Button icon="pi pi-check" @click="addItem" v-tooltip.top="'Adicionar item'" aria-label="Adicionar item" />
                        </div>
                    </div>
                </div>

                <DataTable :value="form.items" responsiveLayout="scroll" size="small" class="mb-3" :emptyMessage="'Nenhum item adicionado.'">
                    <Column header="Peça">
                        <template #body="{ data }">{{ stockOptions.find((option) => option.value === data.stock_id)?.label || '-' }}</template>
                    </Column>
                    <Column field="quantity" header="Quantidade" />
                    <Column field="warranty_days" header="Garantia"><template #body="{ data }">{{ data.warranty_days || 0 }} dias</template></Column>
                    <Column field="unit_price" header="Unitário"><template #body="{ data }">{{ Number(data.unit_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</template></Column>
                    <Column header="Total"><template #body="{ data }">{{ (Number(data.quantity || 0) * Number(data.unit_price || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</template></Column>
                    <Column header="Ações" bodyClass="text-center" style="width: 4rem"><template #body="{ index }"><Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="removeItem(index)" v-tooltip.top="'Remover item'" /></template></Column>
                </DataTable>

                <div class="flex justify-content-end mb-3"><strong>Total: {{ totalItems.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</strong></div>
                <div class="field p-fluid">
                    <span class="p-float-label">
                        <Textarea id="saleNotes" v-model="form.notes" rows="2" autoResize />
                        <label for="saleNotes">Observações</label>
                    </span>
                </div>
                    <div class="flex gap-2 mt-2"><Button :loading="loading" label="Registrar" icon="pi pi-check" @click="submit()" /></div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
                    <div class="page-title-row">
                        <h2 class="page-title">Vendas registradas</h2>
                        <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Consulte o histórico de vendas registradas e seus respectivos itens e valores.'" aria-label="Informações sobre as vendas registradas" />
                    </div>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="salesFilters.global.value" placeholder="Filtrar vendas" />
                    </span>
                </div>
                <DataTable v-model:filters="salesFilters" :value="sales" :loading="tableLoading" :globalFilterFields="['customer_name', 'customer_document', 'customer_phone']" responsiveLayout="scroll" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport" currentPageReportTemplate="{first} a {last} de {totalRecords}">
                    <Column field="id" header="#" />
                    <Column field="customer_name" header="Cliente" />
                    <Column field="attendant_user_name" header="Atendente"><template #body="{ data }">{{ data.attendant_user_name || '-' }}</template></Column>
                    <Column field="total_amount" header="Total" />
                    <Column field="sold_at" header="Data" />
                    <Column header="Itens">
                        <template #body="{ data }">{{ data.items?.length || 0 }}</template>
                    </Column>
                    <Column header="Ações" bodyClass="text-center" style="width: 5rem">
                        <template #body="{ data }"><Button icon="pi pi-bell" class="p-button-rounded p-button-outlined" v-tooltip.top="'Adicionar lembrete'" aria-label="Adicionar lembrete" @click="openSaleReminder(data)" /></template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
