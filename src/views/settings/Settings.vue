<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { getCurrentUser } from '@/services/authSession';

const toast = useToast();
const loading = ref(false);
const profile = ref({});
const company = ref({});
const system = ref({});

const moduleLabels = {
    painel: 'Painel',
    operational: 'Operacional',
    inventory: 'Inventário',
    configurations: 'Configurações',
    notifications: 'Notificações'
};

const loadSettings = async () => {
    loading.value = true;
    try {
        const [profileResponse, companyResponse, systemResponse] = await Promise.all([
            Axios.get(API_CONFIG.PROFILE_ME),
            Axios.get(API_CONFIG.PROFILE_COMPANY),
            Axios.get(API_CONFIG.PROFILE_SYSTEM)
        ]);
        profile.value = profileResponse.data || profileResponse || getCurrentUser() || {};
        company.value = companyResponse.data || companyResponse || {};
        system.value = systemResponse.data || systemResponse || {};
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar configurações.', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const saveProfile = async () => {
    loading.value = true;
    try {
        const response = await Axios.patch(API_CONFIG.PROFILE_ME, {
            name: profile.value.name,
            avatar_url: profile.value.avatar_url || null,
            role_title: profile.value.role_title || null,
            preferences: profile.value.preferences || {}
        });
        const payload = response.data || response;
        toast.add({ severity: 'success', summary: 'Salvo', detail: 'Perfil atualizado.', life: 4000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao salvar perfil.', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const saveCompany = async () => {
    loading.value = true;
    try {
        const response = await Axios.patch(API_CONFIG.PROFILE_COMPANY, {
            name: company.value.name,
            cnpj: company.value.cnpj || null,
            description: company.value.description || null,
            logo_url: company.value.logo_url || null,
            enabled_modules: company.value.enabled_modules || []
        });
        company.value = response.data || response;
        toast.add({ severity: 'success', summary: 'Salvo', detail: 'Empresa atualizada.', life: 4000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao salvar empresa.', life: 5000 });
    } finally {
        loading.value = false;
    }
};

onMounted(loadSettings);
</script>

<template>
    <Toast />
    <div class="card">
        <div class="flex align-items-center justify-content-between mb-4">
            <div>
                <h5 class="mb-1">CONFIGURAÇÕES</h5>
                <span class="text-600">Perfil, empresa, plano, módulos e permissões.</span>
            </div>
            <ProgressSpinner v-if="loading" style="width: 32px; height: 32px" strokeWidth="4" />
        </div>

        <TabView>
            <TabPanel header="Perfil">
                <div class="grid p-fluid mt-2">
                    <div class="field col-12 md:col-6">
                        <label for="profileName" class="block text-900 font-medium mb-2">Nome</label>
                        <InputText id="profileName" v-model="profile.name" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="profileEmail" class="block text-900 font-medium mb-2">Email</label>
                        <InputText id="profileEmail" v-model="profile.email" disabled />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="profileRole" class="block text-900 font-medium mb-2">Cargo/Papel</label>
                        <InputText id="profileRole" v-model="profile.role_title" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="profileAvatar" class="block text-900 font-medium mb-2">Avatar URL</label>
                        <InputText id="profileAvatar" v-model="profile.avatar_url" />
                    </div>
                </div>
                <Button label="Salvar Perfil" icon="pi pi-save" :loading="loading" @click="saveProfile()" />
            </TabPanel>

            <TabPanel header="Empresa">
                <div class="grid p-fluid mt-2">
                    <div class="field col-12 md:col-6">
                        <label for="companyName" class="block text-900 font-medium mb-2">Nome</label>
                        <InputText id="companyName" v-model="company.name" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="companyCnpj" class="block text-900 font-medium mb-2">CNPJ</label>
                        <InputText id="companyCnpj" v-model="company.cnpj" />
                    </div>
                    <div class="field col-12">
                        <label for="companyLogo" class="block text-900 font-medium mb-2">Logo URL</label>
                        <InputText id="companyLogo" v-model="company.logo_url" />
                    </div>
                    <div class="field col-12">
                        <label for="companyDescription" class="block text-900 font-medium mb-2">Descrição</label>
                        <Textarea id="companyDescription" v-model="company.description" rows="4" />
                    </div>
                </div>
                <Button label="Salvar Empresa" icon="pi pi-save" :loading="loading" @click="saveCompany()" />
            </TabPanel>

            <TabPanel header="Sistema">
                <div class="grid mt-2">
                    <div class="col-12 md:col-4">
                        <div class="surface-border border-1 border-round p-3 h-full">
                            <div class="text-600 mb-2">Plano atual</div>
                            <div class="text-900 text-xl font-medium">{{ system.access?.plan?.label || company.plan_key || '-' }}</div>
                            <Tag v-if="system.access?.trial?.active" severity="info" class="mt-3" :value="`Trial: ${system.access.trial.days_remaining} dias`" />
                        </div>
                    </div>
                    <div class="col-12 md:col-4">
                        <div class="surface-border border-1 border-round p-3 h-full">
                            <div class="text-600 mb-2">Modo</div>
                            <div class="text-900 text-xl font-medium">{{ system.access?.full_access ? 'Acesso completo' : 'Controlado por plano' }}</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-4">
                        <div class="surface-border border-1 border-round p-3 h-full">
                            <div class="text-600 mb-2">Permissões efetivas</div>
                            <div class="text-900 text-xl font-medium">{{ system.effective_permissions?.length || 0 }}</div>
                        </div>
                    </div>
                    <div class="col-12">
                        <h6>Módulos habilitados</h6>
                        <div class="flex flex-wrap gap-2">
                            <Tag v-for="moduleKey in system.access?.enabled_modules || []" :key="moduleKey" severity="success" :value="moduleLabels[moduleKey] || moduleKey" />
                        </div>
                    </div>
                    <div class="col-12">
                        <h6>Feature flags</h6>
                        <div class="flex flex-wrap gap-2">
                            <Tag v-for="flag in system.access?.feature_flags || []" :key="flag" severity="info" :value="flag" />
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>
