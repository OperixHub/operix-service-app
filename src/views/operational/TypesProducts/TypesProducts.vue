<script setup>
import { onMounted } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import { useTypesProducts } from './composables/useTypesProducts';

const { dataGetTypesProduct, dataPostTypesProduct, getTypesProduct, confirmDeleteTypesProduct, onSubmit } = useTypesProducts();

onMounted(() => {
    getTypesProduct();
});
</script>

<template>
    <ConfirmPopup />
    <Toast />

    <div class="page-shell">
        <PageHeader
            title="Tipos de Produto"
            subtitle="Padronize os tipos de produto usados pelos serviços para manter o cadastro mais consistente."
            badge="Operacional"
        />

        <section class="content-card">
            <div class="section-heading">
                <div>
                    <h2>Catálogo de tipos</h2>
                    <p>Adicione novos tipos e remova os que não fazem mais sentido para a operação.</p>
                </div>
                <form class="form-inline" @submit.prevent="onSubmit">
                    <InputText v-model="dataPostTypesProduct.name" placeholder="Novo tipo de produto" />
                    <Button type="submit" icon="pi pi-plus" label="Adicionar" />
                </form>
            </div>

            <DataTable :value="dataGetTypesProduct" :rowHover="true" :rows="10" showGridlines>
                <template #empty> Nenhum tipo de produto cadastrado. </template>

                <Column field="name" header="Tipo">
                    <template #body="{ data }">
                        <Chip :label="data.name" />
                    </template>
                </Column>
                <Column header="Ações" style="width: 7rem">
                    <template #body="{ data }">
                        <Button
                            @click="confirmDeleteTypesProduct($event, data.id)"
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-text p-button-danger"
                            v-tooltip.top="'Excluir'"
                        />
                    </template>
                </Column>
            </DataTable>
        </section>
    </div>
</template>

<style scoped>
.page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.content-card {
    padding: 1.4rem;
    border-radius: 1.3rem;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.section-heading {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.section-heading h2 {
    margin: 0;
}

.section-heading p {
    margin: 0.35rem 0 0;
    color: var(--text-color-secondary);
}

.form-inline {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

@media (max-width: 768px) {
    .section-heading,
    .form-inline {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
