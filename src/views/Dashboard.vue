<script setup>
import { computed, onMounted, ref } from 'vue';
import Chart from 'primevue/chart';
import PageHeader from '@/components/PageHeader.vue';
import { useServices } from './operational/Services/composables/useServices';

const { dataGetService, getServices, getStatusService, statusServiceMapping } = useServices();

const stats = computed(() => {
    const total = dataGetService.value.length;
    const inProgress = dataGetService.value.filter((service) => service.status !== 13).length;
    const completed = dataGetService.value.filter((service) => service.status === 13).length;
    const urgent = dataGetService.value.filter((service) => service.status === 10).length;

    return { total, inProgress, completed, urgent };
});

const chartData = ref(null);
const chartOptions = ref({
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#334155'
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#64748b'
            },
            grid: {
                color: 'rgba(148, 163, 184, 0.18)'
            }
        },
        x: {
            ticks: {
                color: '#64748b'
            },
            grid: {
                display: false
            }
        }
    }
});

const setChartData = () => {
    const counts = {};

    dataGetService.value.forEach((service) => {
        const status = statusServiceMapping.value.find((item) => item.cod === service.status);
        const label = status?.description || 'Outros';
        counts[label] = (counts[label] || 0) + 1;
    });

    chartData.value = {
        labels: Object.keys(counts),
        datasets: [
            {
                label: 'Serviços por status',
                data: Object.values(counts),
                backgroundColor: ['#1d4ed8', '#059669', '#f59e0b', '#0f766e', '#7c3aed', '#e11d48'],
                borderRadius: 10
            }
        ]
    };
};

onMounted(async () => {
    await getStatusService();
    await getServices();
    setChartData();
});
</script>

<template>
    <div class="page-shell">
        <PageHeader
            title="Dashboard"
            subtitle="Resumo operacional da oficina, com visão rápida do volume de serviços e pontos que pedem atenção."
            badge="Visão Geral"
        />

        <section class="stats-grid">
            <article class="stat-card stat-card--blue">
                <span class="stat-card__label">Total de serviços</span>
                <strong class="stat-card__value">{{ stats.total }}</strong>
                <span class="stat-card__hint">Todos os registros atualmente no fluxo.</span>
            </article>
            <article class="stat-card stat-card--amber">
                <span class="stat-card__label">Em andamento</span>
                <strong class="stat-card__value">{{ stats.inProgress }}</strong>
                <span class="stat-card__hint">Ordens que ainda dependem de execução.</span>
            </article>
            <article class="stat-card stat-card--green">
                <span class="stat-card__label">Concluídos</span>
                <strong class="stat-card__value">{{ stats.completed }}</strong>
                <span class="stat-card__hint">Serviços encerrados com sucesso.</span>
            </article>
            <article class="stat-card stat-card--rose">
                <span class="stat-card__label">Prioridade alta</span>
                <strong class="stat-card__value">{{ stats.urgent }}</strong>
                <span class="stat-card__hint">Itens que merecem acompanhamento imediato.</span>
            </article>
        </section>

        <section class="dashboard-grid">
            <article class="content-card content-card--chart">
                <div class="section-heading">
                    <div>
                        <h2>Status do funil</h2>
                        <p>Distribuição atual das ordens de serviço por etapa.</p>
                    </div>
                </div>
                <div class="chart-shell">
                    <Chart type="bar" :data="chartData" :options="chartOptions" />
                </div>
            </article>

            <article class="content-card">
                <div class="section-heading">
                    <div>
                        <h2>Últimos serviços</h2>
                        <p>Uma leitura rápida do que entrou recentemente no fluxo.</p>
                    </div>
                </div>
                <DataTable :value="dataGetService.slice(0, 5)" responsiveLayout="scroll">
                    <Column field="order_of_service" header="OS" />
                    <Column field="client" header="Cliente" />
                    <Column field="product" header="Produto" />
                    <Column header="Status">
                        <template #body="{ data }">
                            <Tag :value="data.status" severity="info" />
                        </template>
                    </Column>
                </DataTable>
            </article>
        </section>
    </div>
</template>

<style scoped>
.page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.stats-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

.dashboard-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
}

.stat-card,
.content-card {
    border-radius: 1.3rem;
    border: 1px solid rgba(148, 163, 184, 0.14);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.stat-card {
    padding: 1.25rem;
    color: #fff;
}

.stat-card--blue {
    background: linear-gradient(145deg, #1d4ed8, #1e293b);
}

.stat-card--amber {
    background: linear-gradient(145deg, #f59e0b, #9a3412);
}

.stat-card--green {
    background: linear-gradient(145deg, #059669, #14532d);
}

.stat-card--rose {
    background: linear-gradient(145deg, #e11d48, #4c1d95);
}

.stat-card__label,
.stat-card__hint {
    color: rgba(255, 255, 255, 0.86);
}

.stat-card__value {
    display: block;
    margin: 0.35rem 0;
    font-size: 2rem;
}

.content-card {
    padding: 1.4rem;
    background: rgba(255, 255, 255, 0.95);
}

.content-card--chart {
    min-height: 24rem;
}

.section-heading h2 {
    margin: 0;
}

.section-heading p {
    margin: 0.35rem 0 0;
    color: var(--text-color-secondary);
}

.chart-shell {
    height: 20rem;
    margin-top: 1rem;
}

@media (max-width: 960px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}
</style>
