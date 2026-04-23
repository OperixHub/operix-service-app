<script setup>
import { ref, onMounted, computed } from 'vue';
import Axios from '../../service/Axios';
import { formatData } from '../../views/utils/computeds.js';
import { API_CONFIG } from '../../config/api.config';
import { getApiData } from '@/service/api-utils';
import { hasPermission } from '@/core/permissions/permissions.store';

const URI_STATUS_SERVICE = API_CONFIG.OPERATIONAL.STATUS_SERVICE;
const URI_NOTIFICATIONS = API_CONFIG.NOTIFICATIONS.SYSTEM_INFO;

const canReadSystemInfo = computed(() => hasPermission('notifications.system-info.access'));

const statusServiceOptions = ref([]);
const statusServiceMapping = ref([]);
const getStatusService = async () => {
    if (!canReadSystemInfo.value) {
        return;
    }

    try {
        const response = await Axios.get(URI_STATUS_SERVICE);
        statusServiceOptions.value = getApiData(response, []).map((item) => item.cod.toString());
        statusServiceMapping.value = getApiData(response, []);
        statusServiceMapping.value.forEach((value) => {
            if (value.color) {
                value.color = JSON.parse(value.color);
            }
        });
    } catch (error) {
        console.error(error);
    }
};

const getStyleStatusService = (cod) => {
    const statusService = statusServiceMapping.value.find((item) => item.cod === cod);
    return statusService || null;
};

const notifications = ref([]);

const overlayNotification = ref();

const toggle = (event) => {
    overlayNotification.value.toggle(event);
};

const getNotifications = async () => {
    if (!canReadSystemInfo.value) {
        notifications.value = [];
        return;
    }

    try {
        const response = await Axios.get(URI_NOTIFICATIONS);
        notifications.value = getApiData(response, []);
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    getStatusService();
    getNotifications();
});
</script>
<template>
    <button v-if="canReadSystemInfo" class="p-link topbar-notification" @click="toggle" aria-haspopup="true">
        <i v-if="notifications.length != 0" v-badge="notifications.length" class="pi pi-bell p-overlay-badge" />
        <i v-else class="pi pi-bell p-overlay-badge" />
    </button>

    <OverlayPanel ref="overlayNotification" appendTo="body" style="width: min(32rem, 90vw)">
        <DataTable scrollable scrollHeight="800px" :value="notifications" selectionMode="single" :paginator="false">
            <template #empty> Você não tem notificações. </template>

            <Column header="Lembrete">
                <template #body="slotProps">
                    O serviço para <strong class="text-600">{{ slotProps.data.client }}</strong> em <strong class="text-600">{{ slotProps.data.product }}</strong> está no sistema a
                    <strong class="text-600"> {{ slotProps.data.days }} dias </strong>.
                </template>
            </Column>

            <Column header="Entrada" style="text-align: center">
                <template #body="slotProps">
                    {{ formatData(slotProps.data.created_at) }}
                </template>
            </Column>

            <Column header="Status" style="text-align: center">
                <template #body="slotProps">
                    <Tag :value="getStyleStatusService(slotProps.data.status).description" :style="{ background: getStyleStatusService(slotProps.data.status).color.hex }" />
                </template>
            </Column>
        </DataTable>
    </OverlayPanel>
</template>

<style scoped>
.topbar-notification {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 999px;
    color: var(--text-color);
    background: rgba(15, 23, 42, 0.04);
}

.topbar-notification .pi {
    font-size: 1.15rem;
}
</style>
