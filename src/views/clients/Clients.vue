<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import DialogClientForm from './components/DialogClientForm.vue';

const toast = useToast();
const confirm = useConfirm();
const clients = ref([]);
const loading = ref(false);
const tableLoading = ref(false);
const dialogVisible = ref(false);
const editingId = ref(null);
const form = ref({ full_name: '', document: '', phone: '', address: '' });

const reset = () => { editingId.value = null; form.value = { full_name: '', document: '', phone: '', address: '' }; };
const load = async () => {
    tableLoading.value = true;
    try { clients.value = (await Axios.get(API_CONFIG.CLIENTS)).data || []; }
    catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar clientes.', life: 5000 }); }
    finally { tableLoading.value = false; }
};
const openCreate = () => { reset(); dialogVisible.value = true; };
const openEdit = (client) => { editingId.value = client.id; form.value = { full_name: client.full_name || '', document: client.document || '', phone: client.phone || '', address: client.address || '' }; dialogVisible.value = true; };
const save = async () => {
    if (!form.value.full_name || !form.value.phone) { toast.add({ severity: 'warn', summary: 'Validação', detail: 'Nome completo e telefone são obrigatórios.', life: 4000 }); return; }
    loading.value = true;
    try {
        if (editingId.value) await Axios.put(`${API_CONFIG.CLIENTS}/${editingId.value}`, form.value);
        else await Axios.post(API_CONFIG.CLIENTS, form.value);
        toast.add({ severity: 'success', summary: editingId.value ? 'Atualizado' : 'Criado', detail: 'Cliente salvo com sucesso.', life: 4000 });
        dialogVisible.value = false; reset(); await load();
    } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao salvar cliente.', life: 5000 }); }
    finally { loading.value = false; }
};
const remove = (event, client) => confirm.require({ target: event.currentTarget, message: `Deseja remover o cliente "${client.full_name}"?`, icon: 'pi pi-exclamation-triangle', acceptLabel: 'Sim', rejectLabel: 'Não', accept: async () => {
    loading.value = true;
    try { await Axios.delete(`${API_CONFIG.CLIENTS}/${client.id}`); toast.add({ severity: 'success', summary: 'Removido', detail: 'Cliente removido com sucesso.', life: 4000 }); await load(); }
    catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao remover cliente.', life: 5000 }); }
    finally { loading.value = false; }
}});
onMounted(load);
</script>

<template>
    <Toast /><ConfirmPopup />
    <DialogClientForm v-model="dialogVisible" :client="form" :loading="loading" :title="editingId ? 'Editar cliente' : 'Cadastrar cliente'" @update:client="form = $event" @save="save" @cancel="dialogVisible = false" />
    <div class="card">
        <div class="flex align-items-center justify-content-between mb-4">
            <div class="page-title-row"><h5 class="page-title">Clientes</h5><i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Cadastre e gerencie os clientes utilizados nos serviços e vendas.'" aria-label="Informações sobre a tela de clientes" /></div>
            <Button label="Adicionar" icon="pi pi-plus" :loading="loading" @click="openCreate" />
        </div>
    <DataTable :value="clients" :loading="tableLoading" dataKey="id" responsiveLayout="scroll" paginator :rows="10" showGridlines>
            <template #empty>Nenhum cliente encontrado.</template>
            <Column field="full_name" header="Nome completo" />
            <Column field="document" header="CPF/CNPJ"><template #body="{ data }">{{ data.document || '-' }}</template></Column>
            <Column field="phone" header="Telefone" />
            <Column field="address" header="Endereço"><template #body="{ data }">{{ data.address || '-' }}</template></Column>
            <Column header="Ações" bodyClass="text-center" style="width: 7rem"><template #body="{ data }"><Button icon="pi pi-pencil" class="p-button-rounded p-button-warning mr-2" v-tooltip.top="'Editar'" @click="openEdit(data)" /><Button icon="pi pi-trash" class="p-button-rounded p-button-danger" v-tooltip.top="'Excluir'" @click="remove($event, data)" /></template></Column>
        </DataTable>
    </div>
</template>
