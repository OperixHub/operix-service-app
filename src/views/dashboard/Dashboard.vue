<script setup>
import { onMounted, ref } from 'vue';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { useServices } from '@views/services/composables/useServices';
import Agenda from './components/Agenda.vue';
import { hasPermission } from '@/services/authSession';

const { dataGetService, tableLoading, getServices } = useServices();
const sales = ref([]);
const salesLoading = ref(false);
const loadDashboard = async () => { salesLoading.value = true; try { const requests = []; if (hasPermission('servicos.acesso')) requests.push(getServices()); if (hasPermission('vendas.acesso')) requests.push(Axios.get(API_CONFIG.SALES)); const results = await Promise.all(requests); if (hasPermission('vendas.acesso')) sales.value = results.find((result) => result?.data && Array.isArray(result.data))?.data || []; } finally { salesLoading.value = false; } };
const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-';
onMounted(loadDashboard);
</script>

<template>
    <Toast /><div class="grid dashboard-page">
        <div v-if="hasPermission('servicos.acesso')" class="col-12 xl:col-6"><div class="card"><div class="page-title-row"><h5 class="page-title">Últimos Serviços</h5><i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Acompanhe os serviços mais recentes cadastrados no sistema.'" /></div><DataTable :value="dataGetService || []" :loading="tableLoading" :paginator="true" :rows="5" :rowsPerPageOptions="[5, 10, 20]" responsiveLayout="scroll"><template #empty>Nenhum serviço cadastrado.</template><Column field="order_of_service" header="OS" /><Column field="client" header="Cliente" /><Column field="product" header="Produto" /><Column field="responsible_user_name" header="Responsável"><template #body="{ data }">{{ data.responsible_user_name || '-' }}</template></Column></DataTable></div></div>
        <div v-if="hasPermission('vendas.acesso')" class="col-12 xl:col-6"><div class="card"><div class="page-title-row"><h5 class="page-title">Últimas Vendas</h5><i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Veja um resumo das vendas mais recentes realizadas.'" /></div><DataTable :value="sales || []" :loading="salesLoading" :paginator="true" :rows="5" :rowsPerPageOptions="[5, 10, 20]" responsiveLayout="scroll"><template #empty>Nenhuma venda registrada.</template><Column field="id" header="#" /><Column field="customer_name" header="Cliente" /><Column field="attendant_user_name" header="Atendente"><template #body="{ data }">{{ data.attendant_user_name || '-' }}</template></Column><Column field="total_amount" header="Total"><template #body="{ data }">{{ formatCurrency(data.total_amount) }}</template></Column><Column field="sold_at" header="Data"><template #body="{ data }">{{ formatDate(data.sold_at) }}</template></Column></DataTable></div></div>
        <div class="col-12"><Agenda /></div>
    </div>
</template>
