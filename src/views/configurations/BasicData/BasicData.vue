<script setup>
import TableStatusPayment from './components/TableStatusPayment.vue';
import TableStatusServices from './components/TableStatusServices.vue';
import TableTypesProducts from './components/TableTypesProducts.vue';
</script>

<template>
    <ConfirmPopup />
    <Toast />
    <div class="grid p-fluid">
        <div class="field col-12 md:col-4">
            <TableTypesProducts />
        </div>
        <div class="field col-12 md:col-4">
            <TableStatusServices />
        </div>
        <div class="field col-12 md:col-4">
            <TableStatusPayment />
        </div>
    </div>
</template>
