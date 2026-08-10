<script setup>
import { ref, onBeforeMount } from 'vue';
import { useUsers } from './composables/useUsers';
import DialogAddUser from './components/DialogAddUser.vue';
import Axios from '@/services/axios';

const dialogAddUser = ref(null);

const { dataGetUsers, tableLoading, getUsers, confirmDeleteUser } = useUsers();
const createExternalLink = async (user) => { try { const response = await Axios.post(`/usuarios/${user.id}/acesso-externo`); await navigator.clipboard?.writeText(response.data.url); window.alert(`Link criado para ${user.name}. Ele foi copiado para a área de transferência.`); } catch (error) { window.alert(error.response?.data?.msg || 'Não foi possível criar o link externo.'); } };

onBeforeMount(() => {
    getUsers();
});
</script>

<template>
    <ConfirmPopup />
    <Toast />
    <div class="card">
        <div class="page-title-row">
            <h5 class="page-title">Usuários</h5>
            <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Gerencie os usuários da empresa e defina os módulos aos quais cada um terá acesso.'" aria-label="Informações sobre a tela de usuários" />
        </div>
        <Toolbar class="mb-4">
            <template v-slot:start>
                <div class="my-2">
                    <DialogAddUser ref="dialogAddUser" :get-users="getUsers" />
                    <Button label="Adicionar" icon="pi pi-plus" class="p-button-primary mr-2" @click="dialogAddUser.open()" />
                </div>
            </template>
        </Toolbar>
        <DataTable :value="dataGetUsers" :loading="tableLoading" :rowHover="true" showGridlines responsiveLayout="scroll" tableStyle="min-width: 42rem">
            <Column bodyClass="text-center" field="username" header="Nome de Usuário"></Column>
            <Column bodyClass="text-center" field="email" header="Email">
                <template #body="{ data }">{{ data.email || '-' }}</template>
            </Column>
            <Column bodyClass="text-center" field="role_title" header="Cargo"><template #body="{ data }">{{ data.role_title || '-' }}</template></Column>
            <Column bodyClass="text-center" field="admin" header="Administrador">
                <template #body="{ data }">
                    <Badge v-if="data.admin" severity="success"><i class="pi pi-check mt-1" /></Badge>
                    <Badge v-else severity="warning"><i class="pi pi-times mt-1" /></Badge>
                </template>
            </Column>
            <Column bodyClass="text-center">
                <template #body="{ data }">
                    <Button v-if="!data.root" icon="pi pi-link" class="p-button-rounded p-button-text mr-1" v-tooltip.top="'Criar ou rotacionar link do painel externo'" @click="createExternalLink(data)" />
                    <Button ref="popup" @click="confirmDeleteUser($event, data.id)" icon="pi pi-trash" class="p-button-rounded p-button-danger" v-tooltip.top="'Excluir'" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
