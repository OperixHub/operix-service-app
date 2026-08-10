<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { getAccessToken, setSession } from '@/services/authSession';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const toast = useToast();
const loading = ref(true);
const externalToken = ref('');
const activeAction = ref('point');
const activeTabIndex = computed({ get: () => activeAction.value === 'point' ? 0 : 1, set: (value) => { activeAction.value = value === 0 ? 'point' : 'service'; } });
const service = ref(null);
const services = ref([]);
const statuses = ref([]);
const technicians = ref([]);
const code = ref('');
const selectedServiceId = ref(null);
const selectedStatusId = ref(null);
const selectedTechnicianId = ref(null);
const currentPoint = ref(null);
const history = ref([]);
const item = ref({ description: '', amount: 1, price: null });
const request = ref({ started_at: '', ended_at: '', reason: '', time_entry_id: null });
const adjustmentVisible = ref(false);
const externalSessionStorageKey = 'opeflow_external_service_session';
const items = computed(() => Array.isArray(service.value?.estimate) ? service.value.estimate : []);
const total = computed(() => items.value.reduce((sum, row) => sum + Number(row.price || 0) * Number(row.amount || 1), 0));
const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (value) => value ? new Date(value).toLocaleString('pt-BR') : '-';
const fail = (error, fallback) => toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || fallback, life: 5000 });
const protectedRequest = (config) => { const token = externalToken.value || getAccessToken(); return Axios({ ...config, headers: { ...(config.headers || {}), Authorization: `Bearer ${token}` } }); };

const exchange = async () => {
    const linkToken = route.query.token;
    if (linkToken) {
        const response = await Axios.post(API_CONFIG.EXTERNAL_ACCESS_EXCHANGE, { token: linkToken });
        const session = response.data?.token ? response.data : response.data?.data;
        if (!session?.token) throw new Error('Sessão externa não retornada.');
        if (String(session.token).split('.').length !== 3) throw new Error('Sessão externa inválida.');
        externalToken.value = session.token;
        sessionStorage.setItem(externalSessionStorageKey, session.token);
        setSession(session);
    } else {
        const storedToken = sessionStorage.getItem(externalSessionStorageKey);
        if (!storedToken) throw new Error('Link externo não informado.');
        externalToken.value = storedToken;
        setSession({ token: storedToken, user: {}, permissions: [], access: null });
    }
    window.history.replaceState({}, document.title, `${window.location.pathname}#/painel-externo`);
};
const loadPoint = async () => {
    const [current, records] = await Promise.all([protectedRequest({ method: 'get', url: API_CONFIG.TIME_CLOCK.CURRENT }), protectedRequest({ method: 'get', url: API_CONFIG.TIME_CLOCK.HISTORY })]);
    currentPoint.value = current.data;
    history.value = records.data || [];
};
const loadService = async () => {
    if (!code.value) return;
    try { const response = await protectedRequest({ method: 'get', url: API_CONFIG.EXTERNAL_SERVICE(code.value), params: selectedTechnicianId.value ? { responsible_user_id: selectedTechnicianId.value } : {} }); service.value = response.data; } catch (error) { fail(error, 'OS não encontrada.'); }
};
const loadServiceOptions = async () => {
    try {
        const params = {};
        if (selectedStatusId.value) params.status_id = selectedStatusId.value;
        if (selectedTechnicianId.value) params.responsible_user_id = selectedTechnicianId.value;
        const response = await protectedRequest({ method: 'get', url: API_CONFIG.EXTERNAL_SERVICES, params });
        services.value = response.data?.services || [];
        technicians.value = response.data?.technicians || [];
        statuses.value = response.data?.statuses || [];
    } catch (error) { fail(error, 'Não foi possível carregar as OS do técnico.'); }
};
const selectService = async () => { const selected = services.value.find((row) => row.id === selectedServiceId.value); if (selected) { code.value = String(selected.order_of_service); await loadService(); } };
const filterServices = async () => { selectedServiceId.value = null; await loadServiceOptions(); };
const filterByTechnician = async () => { selectedServiceId.value = null; await loadServiceOptions(); };
const start = async () => { try { await protectedRequest({ method: 'post', url: API_CONFIG.TIME_CLOCK.START, data: {} }); await loadPoint(); } catch (error) { fail(error, 'Não foi possível iniciar o ponto.'); } };
const stop = async () => { try { await protectedRequest({ method: 'post', url: API_CONFIG.TIME_CLOCK.STOP, data: {} }); await loadPoint(); } catch (error) { fail(error, 'Não foi possível encerrar o ponto.'); } };
const addItem = async () => { if (!service.value || !item.value.description || !item.value.price) return; try { await protectedRequest({ method: 'put', url: `${API_CONFIG.ORDERS_OF_SERVICE}/${service.value.cod_order}/orcamento`, data: { type: 'completa', ...item.value } }); await loadService(); item.value = { description: '', amount: 1, price: null }; } catch (error) { fail(error, 'Não foi possível adicionar o item.'); } };
const removeItem = async (row) => { try { await protectedRequest({ method: 'delete', url: `${API_CONFIG.ORDERS_OF_SERVICE}/${service.value.cod_order}/orcamento/${row.id}` }); await loadService(); } catch (error) { fail(error, 'Não foi possível remover o item.'); } };
const saveAdjustment = async () => { try { await protectedRequest({ method: 'post', url: API_CONFIG.TIME_CLOCK.REQUEST(request.value.time_entry_id), data: { started_at: new Date(request.value.started_at).toISOString(), ended_at: request.value.ended_at ? new Date(request.value.ended_at).toISOString() : null, reason: request.value.reason } }); adjustmentVisible.value = false; toast.add({ severity: 'success', summary: 'Ponto', detail: 'Solicitação enviada.', life: 4000 }); } catch (error) { fail(error, 'Não foi possível solicitar alteração.'); } };
const openAdjustment = (record) => { request.value = { time_entry_id: record.id, started_at: record.started_at?.slice(0, 16), ended_at: record.ended_at?.slice(0, 16) || '', reason: '' }; adjustmentVisible.value = true; };
onMounted(async () => { try { await exchange(); await loadPoint(); await loadServiceOptions(); } catch (error) { sessionStorage.removeItem(externalSessionStorageKey); externalToken.value = ''; fail(error, 'Link externo inválido ou expirado.'); } finally { loading.value = false; } });
</script>

<template>
    <Toast />
    <main v-if="!loading" class="external-panel surface-ground p-3 sm:p-5">
        <div class="external-header surface-card border-round p-3 mb-3"><div class="brand-lockup"><img src="/layout/images/opeflow-icon.svg" alt="Opeflow" /><span>Opeflow</span></div><small class="text-600">Painel de serviços</small></div>
        <div class="surface-card border-round p-2 sm:p-3">
            <TabView v-model:activeIndex="activeTabIndex">
                <TabPanel header="Lançar Ponto">
                    <section><div class="flex align-items-center justify-content-between gap-2"><div><h2 class="text-xl mt-0 mb-1">Meu ponto</h2><small v-if="currentPoint" class="text-600">Iniciado em {{ date(currentPoint.started_at) }}</small><small v-else class="text-600">Nenhum ponto aberto</small></div><Button v-if="!currentPoint" label="Iniciar ponto" icon="pi pi-play" @click="start" /><Button v-else label="Encerrar ponto" icon="pi pi-stop" severity="danger" @click="stop" /></div><DataTable v-if="history.length" :value="history" class="mt-3" responsiveLayout="scroll" size="small"><Column field="started_at" header="Início"><template #body="{ data }">{{ date(data.started_at) }}</template></Column><Column field="ended_at" header="Fim"><template #body="{ data }">{{ date(data.ended_at) }}</template></Column><Column header="Ação"><template #body="{ data }"><Button icon="pi pi-pencil" text aria-label="Solicitar alteração" @click="openAdjustment(data)" /></template></Column></DataTable></section>
                </TabPanel>
                <TabPanel header="Consultar OS">
                    <section><h2 class="text-xl mt-0">Consultar OS</h2><div class="grid p-fluid"><div class="field col-12 md:col-3"><span class="p-float-label"><Dropdown inputId="externalTechnician" v-model="selectedTechnicianId" :options="technicians" optionLabel="name" optionValue="id" filter showClear class="w-full" @change="filterByTechnician" /><label for="externalTechnician">Técnico</label></span></div><div class="field col-12 md:col-3"><span class="p-float-label"><Dropdown inputId="externalStatus" v-model="selectedStatusId" :options="statuses" optionLabel="description" optionValue="id" showClear class="w-full" @change="filterServices" /><label for="externalStatus">Situação do serviço</label></span></div><div class="field col-12 md:col-3"><span class="p-float-label"><Dropdown inputId="externalService" v-model="selectedServiceId" :options="services" optionLabel="order_of_service" optionValue="id" filter showClear class="w-full" @change="selectService"><template #option="{ option }">OS {{ option.order_of_service }} - {{ option.client }} ({{ option.status_description || 'Sem situação' }})</template></Dropdown><label for="externalService">OS</label></span></div><div class="field col-12 md:col-3 flex align-items-end"><Button icon="pi pi-search" label="Buscar" class="p-button-sm w-full" :disabled="!selectedServiceId" @click="selectService" /></div></div><div v-if="service" class="mt-4"><div class="surface-100 border-round p-3"><strong>OS {{ service.order_of_service }}</strong><div>{{ service.client }}</div><div class="text-600">{{ service.product }}</div><div class="text-600">{{ service.adress || 'Endereço não informado' }}</div></div><div class="mt-3"><h3 class="text-lg">Orçamento</h3><div v-for="row in items" :key="row.id" class="external-item flex align-items-center justify-content-between gap-2 border-bottom-1 surface-border py-2"><div><strong>{{ row.description }}</strong><div class="text-600">{{ row.amount || 1 }} × {{ currency(row.price) }}</div></div><Button icon="pi pi-trash" text severity="danger" aria-label="Remover item" @click="removeItem(row)" /></div><div class="flex justify-content-between font-bold mt-3"><span>Total</span><span>{{ currency(total) }}</span></div></div><div class="surface-100 border-round p-3 mt-3"><h3 class="text-lg mt-0">Adicionar item</h3><div class="grid p-fluid"><div class="field col-12"><InputText v-model="item.description" placeholder="Descrição" /></div><div class="field col-6"><InputNumber v-model="item.amount" :min="1" showButtons /></div><div class="field col-6"><InputNumber v-model="item.price" mode="currency" currency="BRL" locale="pt-BR" /></div><div class="col-12"><Button label="Adicionar ao orçamento" icon="pi pi-plus" class="w-full" @click="addItem" /></div></div></div></div></section>
                </TabPanel>
            </TabView>
        </div>
    </main>
    <Dialog v-model:visible="adjustmentVisible" modal header="Solicitar alteração do ponto" :style="{ width: 'min(94vw, 34rem)' }"><div class="grid p-fluid"><div class="field col-12"><label for="adjustStart">Início</label><InputText id="adjustStart" type="datetime-local" v-model="request.started_at" /></div><div class="field col-12"><label for="adjustEnd">Fim</label><InputText id="adjustEnd" type="datetime-local" v-model="request.ended_at" /></div><div class="field col-12"><label for="adjustReason">Motivo</label><Textarea id="adjustReason" v-model="request.reason" rows="3" /></div></div><template #footer><Button label="Cancelar" text @click="adjustmentVisible = false" /><Button label="Enviar solicitação" @click="saveAdjustment" /></template></Dialog>
</template>
<style scoped>.external-panel{min-height:100vh}.external-header{display:flex;align-items:center;justify-content:space-between}.external-item{min-height:3.5rem}@media(max-width:600px){.external-header{align-items:flex-start;flex-direction:column;gap:.35rem}}</style>
