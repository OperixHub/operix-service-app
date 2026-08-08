<script setup>
import { onBeforeMount } from 'vue';
import { useServices } from './composables/useServices';
import DialogServiceAdd from './components/DialogServiceAdd.vue';
import DialogViewOS from './components/DialogViewOS.vue';
import DialogEditStatus from './components/DialogEditStatus.vue';
import DialogEditPaymentStatus from './components/DialogEditPaymentStatus.vue';
import DialogEditInfoClient from './components/DialogEditInfoClient.vue';
import DialogEditProduct from './components/DialogEditProduct.vue';

const {
    formatData, sendWhatsAppMessage, sendInfoClientsWhats, pdfGenerator, formatTelephone,
    tableLoading, filters,
    messageAddEstimateOSComplete, messageEditInfoClient,
    messageUpdateStatusService, messageUpdateStatusPayment,
    statusServiceOptions, statusPaymentOptions,
    getStyleStatusService, getStyleStatusPayment,
    dataGetOS, dataGetServiceTable, typesProductOptions,
    displayModalOS, positionModalOS, dataViewEstimateOS,
    dataPutOrderOfServiceComplete,
    serviceParts, serviceContextOS, dataServicePart, stockOptions, servicePartLoading, serviceWarrantyDays, serviceWarrantyLoading,
    displayModalViewObservation, positionModalViewObservation, dataViewObservation,
    displayModalEditPaymentStatus, positionModalEditPaymentStatus, dataEditPaymentStatus,
    displayModalEditStatus, positionModalEditStatus, dataEditStatus,
    displayModalEditInfo, positionModalEditInfo, dataEditInfoClient,
    displayModalEditProduct, positionModalEditProduct, dataEditProduct,
    getStatusService, getStatusPayment, getTypesProduct, getServices,
    clearFilter, openModalAdd, closeModal,
    openModalOS, validateUpdateEstimateOS, deleteEstimateOS, addServicePartToOS, deleteServicePartFromOS,
    openModalViewObservation,
    openModalEditPaymentStatus, validateUpdateStatusPayment,
    openModalEditStatus, validateUpdateStatusService,
    openModalEditInfo, validateEditInfoClient, resetInfoClient,
    openModalEditProduct, validateEditProduct,
    onServicePartStockChange, saveServiceWarranty,
    confirmDeleteService,
    toggle, openOverlay, op
} = useServices();

onBeforeMount(() => {
    getTypesProduct();
    getStatusPayment();
    getStatusService();
    getServices();
});

</script>

<template>
    <ConfirmPopup />
    <Toast />

    <DialogServiceAdd />

    <DialogViewOS
        v-model="displayModalOS"
        :position="String(positionModalOS)"
        :dataGetOS="dataGetOS"
        :dataViewEstimateOS="dataViewEstimateOS"
        :row-data="serviceContextOS"
        :data-put-order-of-service-complete="dataPutOrderOfServiceComplete"
        :service-parts="serviceParts"
        :stock-options="stockOptions"
        :data-service-part="dataServicePart"
        :service-part-loading="servicePartLoading"
        :on-service-part-stock-change="onServicePartStockChange"
        :warranty-days="serviceWarrantyDays"
        :warranty-loading="serviceWarrantyLoading"
        :on-save-warranty="saveServiceWarranty"
        :message-complete="messageAddEstimateOSComplete"
        :send-whats-app-message="sendWhatsAppMessage"
        :pdf-generator="pdfGenerator"
        @update:data-put-order-of-service-complete="dataPutOrderOfServiceComplete = $event"
        @update:data-service-part="dataServicePart = $event"
        @update:warranty-days="serviceWarrantyDays = $event"
        @save="validateUpdateEstimateOS"
        @add-service-part="addServicePartToOS"
        @delete="deleteEstimateOS"
        @delete-part="deleteServicePartFromOS"
    />

    <DialogEditStatus
        v-model="displayModalEditStatus"
        :position="String(positionModalEditStatus)"
        :data="dataEditStatus"
        :data-edit-status="dataEditStatus"
        :status-options="statusServiceOptions"
        :messages="messageUpdateStatusService"
        :get-style-status="getStyleStatusService"
        :format-data="formatData"
        @update:data-edit-status="dataEditStatus = $event"
        @save="validateUpdateStatusService"
        @cancel="closeModal"
    />

    <DialogEditPaymentStatus
        v-model="displayModalEditPaymentStatus"
        :position="String(positionModalEditPaymentStatus)"
        :data="dataEditPaymentStatus"
        :data-edit-payment-status="dataEditPaymentStatus"
        :status-options="statusPaymentOptions"
        :messages="messageUpdateStatusPayment"
        :get-style-status="getStyleStatusPayment"
        :format-data="formatData"
        @update:data-edit-payment-status="dataEditPaymentStatus = $event"
        @save="validateUpdateStatusPayment"
        @cancel="closeModal"
    />

    <DialogEditInfoClient
        v-model="displayModalEditInfo"
        :position="String(positionModalEditInfo)"
        :data-edit-info-client="dataEditInfoClient"
        :messages="messageEditInfoClient"
        :save="validateEditInfoClient"
        @update:data-edit-info-client="dataEditInfoClient = $event"
        @cancel="closeModal"
        @reset="resetInfoClient"
    />

    <DialogEditProduct
        v-model="displayModalEditProduct"
        :position="String(positionModalEditProduct)"
        :data="dataEditProduct"
        :types-product-options="typesProductOptions"
        @update:data="dataEditProduct = $event"
        @save="validateEditProduct"
        @cancel="closeModal"
    />

    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="page-title-row">
                    <h5 class="page-title">Serviços</h5>
                    <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Cadastre, acompanhe e atualize ordens de serviço, clientes, situações e pagamentos.'" aria-label="Informações sobre a tela de serviços" />
                </div>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Adicionar" icon="pi pi-plus" class="p-button-primary mr-2" @click="openModalAdd()" />
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="flex justify-content-between flex-column sm:flex-row mt-2">
                            <Button type="button" icon="pi pi-filter-slash" label="Limpar filtros" class="p-button-outlined mb-2 mr-2" @click="clearFilter()" />
                        </div>
                    </template>
                </Toolbar>
                <DataTable
                    :value="dataGetServiceTable"
                    :paginator="true"
                    class="p-datatable-gridlines"
                    :rows="10"
                    dataKey="id"
                    :rowHover="true"
                    v-model:filters="filters"
                    filterDisplay="menu"
                    :loading="tableLoading"
                    :filters="filters"
                    responsiveLayout="scroll"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                    currentPageReportTemplate="{first} a {last} de {totalRecords}"
                    :globalFilterFields="['order_of_service', 'product', 'client', 'telephone', 'created_at', 'adress', 'observation']"
                >
                    <template #empty> Nenhum registro encontrado. </template>
                    <template #loading> Carregando registros. Por favor aguarde. </template>

                    <!-- OS -->
                    <Column bodyClass="text-center" filterField="order_of_service" header="OS" :showFilterMatchModes="false" dataType="numeric" style="width: auto">
                        <template #body="{ data }">
                            <Dialog v-if="data.id == dataViewObservation.id" header="Observação" v-model:visible="displayModalViewObservation" :position="String(positionModalViewObservation)" :breakpoints="{ '960px': '75vw' }" :style="{ width: '25vw' }" :modal="true">
                                <h6 class="line-height-3 m-0">{{ dataViewObservation.observation }}</h6>
                            </Dialog>
                            <div style="position: relative; display: inline-block;">
                                <Chip
                                        :label="String(data.order_of_service)"
                                        @click="openModalOS('top', data)"
                                        v-tooltip.top="'Visualizar/Atualizar Orçamento'"
                                        style="cursor: pointer" />

                                <i v-if="data.observation"
                                    @click="openModalViewObservation('top', data)"
                                    class="pi pi-exclamation-triangle"
                                    v-tooltip.top="'Visualizar Observação'"
                                    style="position: absolute; top: -2px; right: -15px; cursor: pointer; color: #f59e0b; font-size: 12px;">
                                </i>
                            </div>
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Código da OS" />
                        </template>
                    </Column>

                    <!-- Data -->
                    <Column bodyClass="text-center" field="created_at" header="Data" :showFilterMatchModes="false" dataType="date" style="width: 6vw">
                        <template #body="{ data }">
                            {{ formatData(data.created_at) }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="date" v-model="filterModel.value" class="p-column-filter" placeholder="" />
                        </template>
                    </Column>

                    <!-- Produto -->
                    <Column bodyClass="text-center" field="product" header="Produto" :showFilterMatchModes="false">
                        <template #body="{ data }">
                            <div class="flex align-items-center justify-content-center gap-2">
                                <span @click="openModalEditProduct('top', data)" v-tooltip.top="'Editar produto'" style="cursor: pointer">{{ data.product }}</span>
                            </div>
                        </template>
                        <template #filter="{ filterModel }">
                            <Dropdown v-model="filterModel.value" :options="typesProductOptions" placeholder="Todos" class="p-column-filter" :showClear="true" filter>
                                <template #value="slotProps">
                                    <div v-if="slotProps.value">
                                        <Badge :value="slotProps.value" severity="primary" />
                                    </div>
                                    <span v-else>{{ slotProps.placeholder }}</span>
                                </template>
                                <template #option="slotProps">
                                    <span>{{ slotProps.option }}</span>
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <!-- Cliente -->
                    <Column bodyClass="text-center" field="client_filter" header="Cliente" :showFilterMatchModes="false" dataType="text" style="width: auto">
                        <template #body="{ data }">
                            <div class="flex align-items-center justify-content-center gap-2 flex-wrap">
                                <div class="flex flex-column align-items-center">
                                    <span>{{ data.client }}</span>
                                    <span class="text-600 text-sm">{{ formatTelephone(data.telephone) }}</span>
                                </div>
                                <i @click="openModalEditInfo('top', data)" class="text-blue-500 pi pi-info-circle text-xl" v-tooltip.top="'Informações do cliente'" style="cursor: pointer"></i>
                            </div>
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Nome ou telefone" />
                        </template>
                    </Column>

                    <!-- Situação -->
                    <Column bodyClass="text-center" field="status_id" header="Situação" :showFilterMatchModes="false" style="width: 7vw">
                        <template #body="{ data }">
                            <Tag
                                @click="openModalEditStatus('top', data)"
                                :value="getStyleStatusService(data.status_id)?.description"
                                :style="{ background: getStyleStatusService(data.status_id)?.color.hex }"
                                v-tooltip.top="'Atualizar Situação do Serviço'"
                                style="cursor: pointer"
                            />
                        </template>
                        <template #filter="{ filterModel }">
                            <Dropdown v-model="filterModel.value" :options="statusServiceOptions" placeholder="Todos" class="p-column-filter" :showClear="true">
                                <template #value="slotProps">
                                    <div v-if="slotProps.value">
                                        <Tag :value="getStyleStatusService(parseInt(slotProps.value)).description" :style="{ background: getStyleStatusService(parseInt(slotProps.value)).color.hex }" />
                                    </div>
                                    <span v-else>{{ slotProps.placeholder }}</span>
                                </template>
                                <template #option="slotProps">
                                    <Tag :value="getStyleStatusService(parseInt(slotProps.option)).description" :style="{ background: getStyleStatusService(parseInt(slotProps.option)).color.hex }" />
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <!-- Pagamento -->
                    <Column bodyClass="text-center" field="payment_status" header="Pagamento" :showFilterMatchModes="false" style="width: 8vw">
                        <template #body="{ data }">
                            <Tag
                                @click="openModalEditPaymentStatus('top', data)"
                                :value="getStyleStatusPayment(data.payment_status_id)?.description"
                                :style="{ background: getStyleStatusPayment(data.payment_status_id)?.color.hex }"
                                v-tooltip.top="'Atualizar Situação do Pagamento'"
                                style="cursor: pointer"
                            />
                        </template>
                        <template #filter="{ filterModel }">
                            <Dropdown v-model="filterModel.value" :options="statusPaymentOptions" placeholder="Todos" class="p-column-filter" :showClear="true">
                                <template #value="slotProps">
                                    <div v-if="slotProps.value">
                                        <Tag :value="getStyleStatusPayment(parseInt(slotProps.value)).description" :style="{ background: getStyleStatusPayment(parseInt(slotProps.value)).color.hex }" />
                                    </div>
                                    <span v-else>{{ slotProps.placeholder }}</span>
                                </template>
                                <template #option="slotProps">
                                    <Tag :value="getStyleStatusPayment(parseInt(slotProps.option)).description" :style="{ background: getStyleStatusPayment(parseInt(slotProps.option)).color.hex }" />
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <!-- Ações -->
                    <Column bodyClass="text-center" style="width: 4vw">
                        <template #body="{ data }">
                            <Button v-tooltip.top="'Ações'" icon="pi pi-ellipsis-v" @click="toggle($event, data.id)" class="p-button-rounded surface-500 surface-border" />
                            <OverlayPanel v-if="openOverlay(data.id)" ref="op">
                                <Button icon="pi pi-share-alt" @click="sendInfoClientsWhats(data)" class="ml-1 p-button-rounded p-button-success" v-tooltip.top="'Compartilhar informações do serviço'" />
                                <Button @click="confirmDeleteService($event, data)" icon="pi pi-trash" class="ml-1 p-button-rounded p-button-danger" v-tooltip.top="'Excluir'" />
                            </OverlayPanel>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
