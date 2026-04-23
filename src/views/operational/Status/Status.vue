<script setup>
import PageHeader from '@/components/PageHeader.vue';
import TableStatusPayment from './components/TableStatusPayment.vue';
import TableStatusServices from './components/TableStatusServices.vue';
</script>

<template>
    <ConfirmPopup />
    <Toast />

    <div class="page-shell">
        <PageHeader
            title="Situações"
            subtitle="Mantenha os status operacionais e financeiros usados no fluxo diário do atendimento."
            badge="Operacional"
        />

        <div class="status-grid">
            <section class="content-card">
                <div class="section-heading">
                    <div>
                        <h2>Status de serviço</h2>
                        <p>Etapas utilizadas para acompanhar o avanço dos atendimentos.</p>
                    </div>
                </div>
                <TableStatusServices />
            </section>

            <section class="content-card">
                <div class="section-heading">
                    <div>
                        <h2>Status de pagamento</h2>
                        <p>Indicadores financeiros relacionados ao fechamento dos serviços.</p>
                    </div>
                </div>
                <TableStatusPayment />
            </section>
        </div>
    </div>
</template>

<style scoped>
.page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.content-card {
    padding: 1.4rem;
    border-radius: 1.3rem;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.section-heading h2 {
    margin: 0;
}

.section-heading p {
    margin: 0.35rem 0 1rem;
    color: var(--text-color-secondary);
}

@media (max-width: 960px) {
    .status-grid {
        grid-template-columns: 1fr;
    }
}
</style>
