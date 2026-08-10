<script setup>
import { ref, onMounted } from 'vue';
import Axios from '@/services/axios';
import { formatData } from '@views/utils/computeds.js';

import { API_CONFIG } from '@/services/api';
import { hasPermission } from '@/services/authSession';

const URI_STATUS_SERVICE = API_CONFIG.STATUS_SERVICE;
const URI_NOTIFICATIONS = API_CONFIG.NOTIFICATIONS;

const statusServiceOptions = ref([]);
const statusServiceMapping = ref([]);
const getStatusService = async () => {
    try {
        const response = await Axios.get(URI_STATUS_SERVICE);
        statusServiceOptions.value = response.data.map((item) => item.id.toString());
        statusServiceMapping.value = response.data;
        statusServiceMapping.value.forEach((value) => {
            if (value.color) {
                value.color = JSON.parse(value.color);
            }
        });
    } catch (error) {
        statusServiceOptions.value = [];
        statusServiceMapping.value = [];
    }
};

const getStyleStatusService = (id) => {
    const statusService = statusServiceMapping.value.find((item) => item.id === id);
    return statusService || null;
};
const formatReminderDate = (value) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const notifications = ref([]);

const overlayNotification = ref();

const toggle = (event) => {
    overlayNotification.value.toggle(event);
};

const getNotifications = async () => {
    try {
        const response = await Axios.get(URI_NOTIFICATIONS);
        notifications.value = response.data;
    } catch (error) {
        notifications.value = [];
    }
};

onMounted(() => {
    if (hasPermission('status-servico.acesso')) getStatusService();
    if (hasPermission('notificacoes.acesso')) getNotifications();
});
</script>
<template>
    <button
        class="p-link layout-topbar-button"
        aria-label="Notificações"
        aria-haspopup="true"
        v-tooltip.bottom="'Notificações'"
        @click="toggle"
    >
        <i v-if="notifications.length" v-badge="notifications.length" class="pi pi-bell p-overlay-badge" />
        <i v-else class="pi pi-bell" />
    </button>

    <OverlayPanel ref="overlayNotification" appendTo="body" class="notification-panel">
        <DataTable scrollable scrollHeight="800px" :value="notifications" selectionMode="single" :paginator="false">
            <template #empty> Você não tem notificações. </template>

            <Column header="Lembrete">
                <template #body="slotProps">
                    <span v-if="slotProps.data.kind === 'agenda'">{{ slotProps.data.title }} <small class="block text-600">{{ slotProps.data.description || 'Lembrete da agenda' }}</small></span>
                    <span v-else>O serviço para <strong class="text-600">{{ slotProps.data.client }}</strong> em <strong class="text-600">{{ slotProps.data.product }}</strong> está no sistema a <strong class="text-600"> {{ slotProps.data.days }} dias </strong>.</span>
                </template>
            </Column>

            <Column v-if="notifications.some((item) => item.kind === 'agenda')" header="Data" style="text-align: center"><template #body="slotProps">{{ slotProps.data.kind === 'agenda' ? formatReminderDate(slotProps.data.starts_at) : formatData(slotProps.data.created_at) }}</template></Column>

            <Column v-if="notifications.some((item) => item.kind !== 'agenda')" header="Entrada" style="text-align: center">
                <template #body="slotProps">
                    {{ formatData(slotProps.data.created_at) }}
                </template>
            </Column>

            <Column v-if="notifications.some((item) => item.kind !== 'agenda')" header="Status" style="text-align: center">
                <template #body="slotProps">
                    <Tag
                        :value="getStyleStatusService(slotProps.data.status_id)?.description || String(slotProps.data.status_id || '-')"
                        :style="getStyleStatusService(slotProps.data.status_id)?.color?.hex ? { background: getStyleStatusService(slotProps.data.status_id).color.hex } : {}"
                    />
                </template>
            </Column>
        </DataTable>
    </OverlayPanel>
</template>
