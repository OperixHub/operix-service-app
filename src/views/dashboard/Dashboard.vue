<script setup>
import { onMounted, computed } from 'vue';
import { useServices } from '@views/services/composables/useServices';

const { dataGetService, getServices, getStatusService, statusServiceMapping } = useServices();

const statusCodeByDescription = computed(() => {
    const mapping = {};
    (statusServiceMapping.value || []).forEach((item) => {
        mapping[String(item.description || '').toLowerCase()] = item.cod;
    });
    return mapping;
});

const stats = computed(() => {
    const services = dataGetService.value || [];
    const total = services.length;
    const completedCode = statusCodeByDescription.value.concluido;
    const urgentCodes = Object.entries(statusCodeByDescription.value)
        .filter(([label]) => label.includes('urg') || label.includes('atras'))
        .map(([, cod]) => cod);
    const completed = completedCode ? services.filter((service) => service.status === completedCode).length : 0;
    const urgent = urgentCodes.length > 0 ? services.filter((service) => urgentCodes.includes(service.status)).length : 0;
    const inProgress = total - completed;
    
    return { total, inProgress, completed, urgent };
});

onMounted(async () => {
    await getStatusService();
    await getServices();
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 shadow-2 hover:shadow-4 transition-all transition-duration-300">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total de Serviços</span>
                        <div class="text-900 font-bold text-xl">{{ stats.total }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-ticket text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">Ativos no sistema </span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 shadow-2 hover:shadow-4 transition-all transition-duration-300">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Em Andamento</span>
                        <div class="text-900 font-bold text-xl">{{ stats.inProgress }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-spin pi-spinner text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-orange-500 font-medium">Aguardando conclusão</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 shadow-2 hover:shadow-4 transition-all transition-duration-300">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Concluídos</span>
                        <div class="text-900 font-bold text-xl">{{ stats.completed }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check-circle text-green-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">Sucesso total</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 shadow-2 hover:shadow-4 transition-all transition-duration-300">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Urgentes/Atrasados</span>
                        <div class="text-900 font-bold text-xl">{{ stats.urgent }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium">Requer atenção</span>
            </div>
        </div>

        <div class="col-12 xl:col-6">
            <div class="card shadow-2">
                <h5>Últimos Serviços</h5>
                <DataTable :value="dataGetService.slice(0, 5)" responsiveLayout="scroll" paginator :rows="5"> 
                    <Column field="order_of_service" header="OS" :sortable="true" style="width: 15%"></Column>
                    <Column field="client" header="Cliente" :sortable="true" style="width: 35%"></Column>
                    <Column field="product" header="Produto" :sortable="true" style="width: 35%"></Column>
                    <Column field="status" header="Status" style="width: 15%">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.status" severity="info"></Badge>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5 class="m-0 mb-4">Últimas Vendas</h5>
                <DataTable :value="sales" responsiveLayout="scroll" paginator :rows="10">
                    <Column field="id" header="#" />
                    <Column field="customer_name" header="Cliente" />
                    <Column field="total_amount" header="Total" />
                    <Column field="sold_at" header="Data" />
                    <Column header="Itens">
                        <template #body="{ data }">{{ data.items?.length || 0 }}</template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}
</style>
