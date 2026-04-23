<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PageHeader from '@/components/PageHeader.vue';
import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { getApiData, getApiErrorMessage, getApiMessage } from '@/service/api-utils';
import { getStoredUser } from '@/core/auth/session';
import { hasPermission, loadCurrentPermissions, loadPermissionsCatalog, permissionsStore } from '@/core/permissions/permissions.store';

const toast = useToast();
const confirm = useConfirm();
const router = useRouter();

const currentUser = computed(() => getStoredUser() || {});
const canManageUsers = computed(() => Boolean(currentUser.value?.admin));
const users = ref([]);
const loading = ref(false);
const createDialogVisible = ref(false);
const permissionsDialogVisible = ref(false);
const savingCreate = ref(false);
const savingPermissions = ref(false);

const createForm = reactive({
    name: '',
    username: '',
    email: '',
    password: '',
    admin: false,
    modules: []
});

const permissionDecisionOptions = [
    { label: 'Padrão do módulo', value: null },
    { label: 'Permitir', value: 'allow' },
    { label: 'Bloquear', value: 'deny' }
];

const selectedUser = ref(null);
const selectedUserProfile = ref(null);
const permissionSelections = reactive({});

const moduleOptions = computed(() => permissionsStore.catalog.modules || []);
const permissionModules = computed(() => selectedUserProfile.value?.permissions?.reduce((groups, permission) => {
    const existingGroup = groups.find((group) => group.key === permission.module_key);

    if (existingGroup) {
        existingGroup.permissions.push(permission);
        return groups;
    }

    groups.push({
        key: permission.module_key,
        label: permission.module_label,
        description: permission.module_description,
        permissions: [permission]
    });

    return groups;
}, []) || []);

const stats = computed(() => ({
    total: users.value.length,
    admins: users.value.filter((user) => user.admin).length,
    operational: users.value.filter((user) => user.root || user.admin).length
}));

const resetCreateForm = () => {
    createForm.name = '';
    createForm.username = '';
    createForm.email = '';
    createForm.password = '';
    createForm.admin = false;
    createForm.modules = [];
};

const loadUsers = async () => {
    loading.value = true;

    try {
        const response = await Axios.get(API_CONFIG.IDENTITY.USERS);
        users.value = getApiData(response, []);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao carregar usuários.'), life: 5000 });
    } finally {
        loading.value = false;
    }
};

const openCreateDialog = async () => {
    try {
        await loadPermissionsCatalog();
        resetCreateForm();
        createDialogVisible.value = true;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Não foi possível carregar os módulos disponíveis.'), life: 5000 });
    }
};

const createUser = async () => {
    if (!createForm.name || !createForm.username || !createForm.email || !createForm.password) {
        toast.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Preencha nome, usuário, e-mail e senha.', life: 4000 });
        return;
    }

    savingCreate.value = true;

    try {
        const response = await Axios.post(API_CONFIG.IDENTITY.USERS, {
            name: createForm.name,
            username: createForm.username,
            email: createForm.email,
            password: createForm.password,
            admin: createForm.admin,
            modules: createForm.modules
        });

        toast.add({ severity: 'success', summary: 'Usuário criado', detail: getApiMessage(response, 'Usuário criado com sucesso.'), life: 4000 });
        createDialogVisible.value = false;
        await loadUsers();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao criar usuário.'), life: 5000 });
    } finally {
        savingCreate.value = false;
    }
};

const confirmDeleteUser = (event, user) => {
    confirm.require({
        target: event.currentTarget,
        message: `Deseja remover o usuário ${user.name || user.username}?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Remover',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                const response = await Axios.delete(`${API_CONFIG.IDENTITY.USERS}/${user.id}`);
                toast.add({ severity: 'success', summary: 'Usuário removido', detail: getApiMessage(response, 'Usuário removido com sucesso.'), life: 4000 });
                await loadUsers();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao remover usuário.'), life: 5000 });
            }
        }
    });
};

const openPermissionsDialog = async (user) => {
    try {
        await loadPermissionsCatalog();
        const response = await Axios.get(API_CONFIG.PERMISSIONS.USER(user.id));
        const profile = getApiData(response, {});

        selectedUser.value = user;
        selectedUserProfile.value = profile;

        Object.keys(permissionSelections).forEach((key) => {
            delete permissionSelections[key];
        });

        (profile.overrides || []).forEach((override) => {
            permissionSelections[override.permission_key] = override.effect;
        });

        permissionsDialogVisible.value = true;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao carregar permissões do usuário.'), life: 5000 });
    }
};

const getPermissionSelection = (permissionKey) => permissionSelections[permissionKey] ?? null;

const savePermissions = async () => {
    if (!selectedUser.value) {
        return;
    }

    savingPermissions.value = true;

    try {
        const overrides = Object.entries(permissionSelections)
            .filter(([, effect]) => effect)
            .map(([permission_key, effect]) => ({ permission_key, effect }));

        const response = await Axios.put(API_CONFIG.PERMISSIONS.USER(selectedUser.value.id), { overrides });
        const profile = getApiData(response, {});

        selectedUserProfile.value = profile;
        toast.add({ severity: 'success', summary: 'Permissões atualizadas', detail: getApiMessage(response, 'Permissões atualizadas com sucesso.'), life: 4000 });

        if (selectedUser.value.id === currentUser.value?.id) {
            await loadCurrentPermissions(true);

            if (!hasPermission('organization.users.access')) {
                permissionsDialogVisible.value = false;
                router.push('/dashboard');
            }
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: getApiErrorMessage(error, 'Erro ao salvar permissões.'), life: 5000 });
    } finally {
        savingPermissions.value = false;
    }
};

const sourceSeverity = (source, allowed) => {
    if (source === 'override:deny') {
        return 'danger';
    }

    if (!allowed) {
        return 'secondary';
    }

    return source === 'override:allow' ? 'success' : 'info';
};

const sourceLabel = (source, allowed) => {
    if (source === 'override:allow') {
        return 'Permitido manualmente';
    }

    if (source === 'override:deny') {
        return 'Bloqueado manualmente';
    }

    if (source === 'role') {
        return 'Herdado do módulo';
    }

    if (source === 'authenticated') {
        return 'Autenticado';
    }

    return allowed ? 'Permitido' : 'Sem acesso';
};

onMounted(async () => {
    await loadUsers();

    if (canManageUsers.value) {
        await loadPermissionsCatalog();
    }
});
</script>

<template>
    <ConfirmPopup />
    <Toast />

    <div class="page-shell">
        <PageHeader
            title="Usuários"
            subtitle="Gerencie as pessoas do tenant, defina módulos de acesso e ajuste permissões específicas quando necessário."
            badge="Organização"
        >
            <template #actions>
                <div class="page-actions">
                    <Button label="Atualizar" icon="pi pi-refresh" class="p-button-outlined" @click="loadUsers" />
                    <Button
                        v-if="canManageUsers"
                        label="Novo usuário"
                        icon="pi pi-plus"
                        @click="openCreateDialog"
                    />
                </div>
            </template>
        </PageHeader>

        <section class="stats-grid">
            <article class="stat-card">
                <span class="stat-card__label">Usuários ativos</span>
                <strong class="stat-card__value">{{ stats.total }}</strong>
                <span class="stat-card__hint">Pessoas cadastradas no tenant atual</span>
            </article>
            <article class="stat-card">
                <span class="stat-card__label">Administradores</span>
                <strong class="stat-card__value">{{ stats.admins }}</strong>
                <span class="stat-card__hint">Com capacidade de gestão avançada</span>
            </article>
            <article class="stat-card">
                <span class="stat-card__label">Acesso ampliado</span>
                <strong class="stat-card__value">{{ stats.operational }}</strong>
                <span class="stat-card__hint">Perfis com amplitude operacional maior</span>
            </article>
        </section>

        <section class="content-card">
            <div class="section-heading">
                <div>
                    <h2>Equipe do tenant</h2>
                    <p>Lista atualizada dos usuários provisionados na API.</p>
                </div>
            </div>

            <DataTable :value="users" :loading="loading" dataKey="id" responsiveLayout="scroll" showGridlines>
                <template #empty> Nenhum usuário encontrado. </template>

                <Column field="name" header="Nome" />
                <Column field="username" header="Usuário" />
                <Column field="email" header="E-mail" />
                <Column header="Perfil" style="width: 12rem">
                    <template #body="{ data }">
                        <Tag :value="data.admin ? 'Administrador' : 'Colaborador'" :severity="data.admin ? 'success' : 'info'" />
                    </template>
                </Column>
                <Column header="Ações" style="width: 15rem">
                    <template #body="{ data }">
                        <div class="table-actions">
                            <Button
                                v-if="canManageUsers"
                                icon="pi pi-shield"
                                class="p-button-rounded p-button-text"
                                v-tooltip.top="'Permissões'"
                                @click="openPermissionsDialog(data)"
                            />
                            <Button
                                v-if="canManageUsers"
                                icon="pi pi-trash"
                                class="p-button-rounded p-button-text p-button-danger"
                                v-tooltip.top="'Remover'"
                                @click="confirmDeleteUser($event, data)"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </section>
    </div>

    <Dialog v-model:visible="createDialogVisible" modal header="Novo usuário" :style="{ width: 'min(42rem, 95vw)' }">
        <div class="dialog-grid">
            <div class="field">
                <label for="user-name">Nome completo</label>
                <InputText id="user-name" v-model="createForm.name" />
            </div>
            <div class="field">
                <label for="user-username">Usuário</label>
                <InputText id="user-username" v-model="createForm.username" />
            </div>
            <div class="field">
                <label for="user-email">E-mail</label>
                <InputText id="user-email" v-model="createForm.email" />
            </div>
            <div class="field">
                <label for="user-password">Senha inicial</label>
                <Password id="user-password" v-model="createForm.password" :feedback="false" toggleMask />
            </div>
            <div class="field field--full">
                <label for="user-modules">Módulos base</label>
                <MultiSelect
                    id="user-modules"
                    v-model="createForm.modules"
                    :options="moduleOptions"
                    optionLabel="label"
                    optionValue="key"
                    placeholder="Selecione os módulos iniciais"
                    display="chip"
                />
                <small>Esses módulos alimentam as permissões herdadas pelo usuário.</small>
            </div>
            <div class="field field-inline field--full">
                <Checkbox id="user-admin" v-model="createForm.admin" :binary="true" />
                <label for="user-admin">Conceder perfil administrativo local</label>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" class="p-button-text" @click="createDialogVisible = false" />
            <Button label="Criar usuário" icon="pi pi-check" :loading="savingCreate" @click="createUser" />
        </template>
    </Dialog>

    <Dialog v-model:visible="permissionsDialogVisible" modal header="Permissões do usuário" :style="{ width: 'min(58rem, 95vw)' }">
        <div v-if="selectedUserProfile" class="permissions-shell">
            <div class="permissions-summary">
                <div>
                    <strong>{{ selectedUserProfile.user?.name || selectedUserProfile.user?.username }}</strong>
                    <p>{{ selectedUserProfile.user?.email }}</p>
                </div>
                <div class="permissions-summary__chips">
                    <Tag
                        v-for="role in selectedUserProfile.module_roles || []"
                        :key="role"
                        :value="role"
                        severity="info"
                    />
                </div>
            </div>

            <div v-for="module in permissionModules" :key="module.key" class="permission-module">
                <div class="permission-module__header">
                    <div>
                        <h3>{{ module.label }}</h3>
                        <p>{{ module.description }}</p>
                    </div>
                </div>

                <div class="permission-list">
                    <article v-for="permission in module.permissions" :key="permission.key" class="permission-card">
                        <div class="permission-card__content">
                            <strong>{{ permission.label }}</strong>
                            <p>{{ permission.description }}</p>
                            <Tag
                                :value="sourceLabel(permission.source, permission.allowed)"
                                :severity="sourceSeverity(permission.source, permission.allowed)"
                            />
                        </div>

                        <Dropdown
                            :modelValue="getPermissionSelection(permission.key)"
                            :options="permissionDecisionOptions"
                            optionLabel="label"
                            optionValue="value"
                            class="permission-card__control"
                            @update:modelValue="permissionSelections[permission.key] = $event"
                        />
                    </article>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Fechar" class="p-button-text" @click="permissionsDialogVisible = false" />
            <Button label="Salvar permissões" icon="pi pi-save" :loading="savingPermissions" @click="savePermissions" />
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

.stats-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

.stat-card {
    padding: 1.25rem;
    border-radius: 1.1rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.stat-card__label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
}

.stat-card__value {
    display: block;
    margin: 0.35rem 0;
    font-size: 1.8rem;
}

.stat-card__hint {
    color: var(--text-color-secondary);
    font-size: 0.82rem;
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
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.section-heading h2,
.permission-module__header h3 {
    margin: 0;
}

.section-heading p,
.permission-module__header p,
.permissions-summary p,
.permission-card__content p {
    margin: 0.25rem 0 0;
    color: var(--text-color-secondary);
}

.table-actions {
    display: flex;
    gap: 0.25rem;
}

.dialog-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.field--full {
    grid-column: 1 / -1;
}

.field-inline {
    flex-direction: row;
    align-items: center;
}

.permissions-shell {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.permissions-summary {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: rgba(15, 23, 42, 0.04);
}

.permissions-summary__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.permission-module {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
}

.permission-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.permission-card {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: #fff;
}

.permission-card__content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.permission-card__control {
    width: 15rem;
}

@media (max-width: 768px) {
    .dialog-grid {
        grid-template-columns: 1fr;
    }

    .permission-card,
    .permissions-summary {
        flex-direction: column;
    }

    .permission-card__control {
        width: 100%;
    }
}
</style>
