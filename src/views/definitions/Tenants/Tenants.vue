<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PageHeader from '@/components/PageHeader.vue';
import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { getApiData, getApiErrorMessage, getApiMessage } from '@/service/api-utils';

const toast = useToast();
const confirm = useConfirm();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const tenants = ref([]);
const form = reactive({
    name: ''
});

const loadTenants = async () => {
    loading.value = true;

    try {
        const response = await Axios.get(API_CONFIG.IDENTITY.TENANTS);
        tenants.value = getApiData(response, []);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao carregar unidades.'), life: 5000 });
    } finally {
        loading.value = false;
    }
};

const openDialog = () => {
    form.name = '';
    dialogVisible.value = true;
};

const createTenant = async () => {
    if (!form.name) {
        toast.add({ severity: 'warn', summary: 'Campo obrigatório', detail: 'Informe o nome da unidade.', life: 4000 });
        return;
    }

    saving.value = true;

    try {
        const response = await Axios.post(API_CONFIG.IDENTITY.TENANTS, { name: form.name });
        toast.add({ severity: 'success', summary: 'Unidade criada', detail: getApiMessage(response, 'Unidade criada com sucesso.'), life: 4000 });
        dialogVisible.value = false;
        await loadTenants();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao criar unidade.'), life: 5000 });
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (event, tenant) => {
    confirm.require({
        target: event.currentTarget,
        message: `Deseja remover a unidade ${tenant.name}?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Remover',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                const response = await Axios.delete(`${API_CONFIG.IDENTITY.TENANTS}/${tenant.id}`);
                toast.add({ severity: 'success', summary: 'Unidade removida', detail: getApiMessage(response, 'Unidade removida com sucesso.'), life: 4000 });
                await loadTenants();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao remover unidade.'), life: 5000 });
            }
        }
    });
};

onMounted(loadTenants);
</script>

<template>
    <ConfirmPopup />
    <Toast />

    <div class="page-shell">
        <PageHeader
            title="Unidades"
            subtitle="Cadastre e mantenha as unidades organizacionais utilizadas pelo tenant."
            badge="Organização"
        >
            <template #actions>
                <div class="page-actions">
                    <Button label="Atualizar" icon="pi pi-refresh" class="p-button-outlined" @click="loadTenants" />
                    <Button label="Nova unidade" icon="pi pi-plus" @click="openDialog" />
                </div>
            </template>
        </PageHeader>

        <section class="content-card">
            <DataTable :value="tenants" :loading="loading" dataKey="id" responsiveLayout="scroll" showGridlines>
                <template #empty> Nenhuma unidade encontrada. </template>

                <Column field="name" header="Nome da unidade" />
                <Column field="keycloak_group_id" header="Grupo IAM" />
                <Column header="Ações" style="width: 8rem">
                    <template #body="{ data }">
                        <Button
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-text p-button-danger"
                            v-tooltip.top="'Remover'"
                            @click="confirmDelete($event, data)"
                        />
                    </template>
                </Column>
            </DataTable>
        </section>
    </div>

    <Dialog v-model:visible="dialogVisible" modal header="Nova unidade" :style="{ width: 'min(30rem, 92vw)' }">
        <div class="field">
            <label for="tenant-name">Nome da unidade</label>
            <InputText id="tenant-name" v-model="form.name" />
        </div>

        <template #footer>
            <Button label="Cancelar" class="p-button-text" @click="dialogVisible = false" />
            <Button label="Criar unidade" icon="pi pi-check" :loading="saving" @click="createTenant" />
        </template>
    </Dialog>
</template>

<style scoped>
.page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.content-card {
    padding: 1.4rem;
    border-radius: 1.3rem;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}
</style>
