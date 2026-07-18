<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { formatData } from '@/views/utils/computeds';

const toast = useToast();
const loading = ref(false);
const notifications = ref([]);

async function loadSystemInfo() {
    loading.value = true;
    try {
        const response = await Axios.get(API_CONFIG.NOTIFICATIONS);
        notifications.value = response.data || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar notificações do sistema.', life: 5000 });
    } finally {
        loading.value = false;
    }
}

onMounted(loadSystemInfo);
</script>

<template>
    <Toast />

    <div class="card">
        <div class="flex align-items-center justify-content-between mb-4">
            <div>
                <h5 class="mb-1">INFORMAÇÕES DO SISTEMA</h5>
                <span class="text-600">Serviços antigos que precisam de atenção operacional.</span>
            </div>
            <Button label="Atualizar" icon="pi pi-refresh" outlined :loading="loading" @click="loadSystemInfo()" />
        </div>

        <DataTable :value="notifications" :loading="loading" responsiveLayout="scroll" showGridlines>
            <template #empty>Nenhum alerta disponível.</template>

            <Column field="order_of_service" header="OS" />
            <Column field="client" header="Cliente" />
            <Column field="product" header="Produto" />
            <Column field="telephone" header="Telefone" />

            <Column header="Entrada">
                <template #body="{ data }">
                    {{ formatData(data.created_at) }}
                </template>
            </Column>

            <Column header="Dias em aberto">
                <template #body="{ data }">
                    {{ data.days ?? '-' }}
                </template>
            </Column>

            <Column field="status" header="Status" />
        </DataTable>
    </div>
</template>
