<script setup>
import { ref, onMounted } from 'vue';
import Axios from '@/services/axios';
import { formatData } from '@views/utils/computeds.js';

import { API_CONFIG } from '@/services/api';

const URI_STATUS_SERVICE = API_CONFIG.STATUS_SERVICE;
const URI_NOTIFICATIONS = API_CONFIG.NOTIFICATIONS;

const statusServiceOptions = ref([]);
const statusServiceMapping = ref([]);
const getStatusService = async () => {
    try {
        const response = await Axios.get(URI_STATUS_SERVICE);
        statusServiceOptions.value = response.data.map((item) => item.cod.toString());
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
    try {
        const response = await Axios.get(URI_NOTIFICATIONS);
        notifications.value = response.data;
    } catch (error) {
        notifications.value = [];
    }
};

onMounted(() => {
    getStatusService();
    getNotifications();
});
</script>
<template>
    <i v-if="notifications.length != 0" v-badge="notifications.length" class="pi pi-bell p-overlay-badge" style="cursor: pointer; font-size: 25px" label="Toggle" @click="toggle" aria-haspopup="true" />

    <i v-else class="pi pi-bell p-overlay-badge" style="cursor: pointer; font-size: 20px" label="Toggle" @click="toggle" aria-haspopup="true" />

    <OverlayPanel ref="overlayNotification" appendTo="body" style="width: auto; max-width: 30%">
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
                    <Tag
                        :value="getStyleStatusService(slotProps.data.status)?.description || String(slotProps.data.status || '-')"
                        :style="getStyleStatusService(slotProps.data.status)?.color?.hex ? { background: getStyleStatusService(slotProps.data.status).color.hex } : {}"
                    />
                </template>
            </Column>
        </DataTable>
    </OverlayPanel>
</template>
