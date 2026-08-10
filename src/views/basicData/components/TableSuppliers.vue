<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';

const toast = useToast();
const confirm = useConfirm();
const suppliers = ref([]);
const loading = ref(false);
const dialog = ref(false);
const editingId = ref(null);
const form = ref({ name: '', cnpj: '', phone: '', address: '' });

const load = async () => { loading.value = true; try { const response = await Axios.get(API_CONFIG.SUPPLIERS); suppliers.value = response.data || []; } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar fornecedores.', life: 5000 }); } finally { loading.value = false; } };
const open = (supplier = null) => { editingId.value = supplier?.id || null; form.value = { name: supplier?.name || '', cnpj: supplier?.cnpj || '', phone: supplier?.phone || '', address: supplier?.address || '' }; dialog.value = true; };
const save = async () => { if (!form.value.name.trim()) return toast.add({ severity: 'warn', summary: 'Validação', detail: 'Informe o nome do fornecedor.', life: 4000 }); loading.value = true; try { if (editingId.value) await Axios.put(`${API_CONFIG.SUPPLIERS}/${editingId.value}`, form.value); else await Axios.post(API_CONFIG.SUPPLIERS, form.value); dialog.value = false; await load(); toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Fornecedor salvo com sucesso.', life: 4000 }); } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao salvar fornecedor.', life: 5000 }); } finally { loading.value = false; } };
const remove = (event, supplier) => confirm.require({ target: event.currentTarget, message: `Deseja remover o fornecedor "${supplier.name}"?`, icon: 'pi pi-exclamation-triangle', acceptLabel: 'Sim', rejectLabel: 'Não', accept: async () => { await Axios.delete(`${API_CONFIG.SUPPLIERS}/${supplier.id}`); await load(); } });
onMounted(load);
</script>
<template>
    <ConfirmPopup /><Toast />
    <div class="card">
        <div class="page-title-row"><h5 class="page-title">Fornecedores</h5><i class="pi pi-info-circle page-title-info" v-tooltip.top="'Cadastre os fornecedores usados no estoque.'" /></div>
        <Toolbar class="mb-4"><template #start><Button label="Adicionar" icon="pi pi-plus" @click="open()" /></template></Toolbar>
        <DataTable :value="suppliers" :loading="loading" showGridlines responsiveLayout="scroll"><template #empty>Nenhum fornecedor cadastrado.</template>
            <Column field="name" header="Nome" /><Column field="cnpj" header="CNPJ"><template #body="{ data }">{{ data.cnpj || '-' }}</template></Column><Column field="phone" header="Telefone"><template #body="{ data }">{{ data.phone || '-' }}</template></Column><Column field="address" header="Endereço"><template #body="{ data }">{{ data.address || '-' }}</template></Column>
            <Column header="Ações" bodyClass="text-center"><template #body="{ data }"><Button icon="pi pi-pencil" rounded severity="warning" class="mr-2" @click="open(data)" /><Button icon="pi pi-trash" rounded severity="danger" @click="remove($event, data)" /></template></Column>
        </DataTable>
    </div>
    <Dialog v-model:visible="dialog" modal :style="{ width: 'clamp(22rem, 45vw, 42rem)' }" :header="editingId ? 'Editar Fornecedor' : 'Adicionar Fornecedor'"><div class="grid p-fluid mt-3">
        <div class="field col-12"><span class="p-float-label"><InputText id="supplierName" v-model="form.name" /><label for="supplierName"><span class="text-red-500">*</span> Nome</label></span></div>
        <div class="field col-12 md:col-6"><span class="p-float-label"><InputText id="supplierCnpj" v-model="form.cnpj" /><label for="supplierCnpj">CNPJ</label></span></div>
        <div class="field col-12 md:col-6"><span class="p-float-label"><InputText id="supplierPhone" v-model="form.phone" /><label for="supplierPhone">Telefone</label></span></div>
        <div class="field col-12"><span class="p-float-label"><InputText id="supplierAddress" v-model="form.address" /><label for="supplierAddress">Endereço</label></span></div>
    </div><template #footer><Button label="Cancelar" text @click="dialog = false" /><Button label="Salvar" icon="pi pi-check" :loading="loading" @click="save" /></template></Dialog>
</template>
