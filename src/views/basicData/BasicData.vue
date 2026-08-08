<script setup>
import TableStatusPayment from './components/TableStatusPayment.vue';
import TableStatusServices from './components/TableStatusServices.vue';
import TableTypesProducts from './components/TableTypesProducts.vue';
import { hasPermission } from '@/services/authSession';
</script>

<template>
    <ConfirmPopup />
    <Toast />
    <div class="grid p-fluid">
        <div v-if="hasPermission('tipos-produto.acesso')" class="field col-12 md:col-12">
            <TableTypesProducts />
        </div>
        <div v-if="hasPermission('status-servico.acesso')" class="field col-12 md:col-6">
            <TableStatusServices />
        </div>
        <div v-if="hasPermission('status-pagamento.acesso')" class="field col-12 md:col-6">
            <TableStatusPayment />
        </div>
    </div>
</template>
