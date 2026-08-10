<script setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { getCurrentUser, hasPermission } from '@/services/authSession';
import Users from '@/views/users/Users.vue';

const toast = useToast();
const loading = ref(false);
const profile = ref({});
const company = ref({});
const system = ref({});
const externalLink = ref(null);

const isAccountAdmin = computed(() => Boolean(
    profile.value.admin ||
    profile.value.root ||
    getCurrentUser()?.admin ||
    getCurrentUser()?.root
));

const readImageAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const selectImage = async (event, target, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.add({ severity: 'warn', summary: 'Arquivo inválido', detail: 'Selecione um arquivo de imagem.', life: 4000 });
        event.target.value = '';
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        toast.add({ severity: 'warn', summary: 'Arquivo muito grande', detail: 'Selecione uma imagem de até 2 MB.', life: 4000 });
        event.target.value = '';
        return;
    }

    try {
        target.value[field] = await readImageAsDataUrl(file);
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a imagem.', life: 4000 });
        event.target.value = '';
    }
};

const enabledModuleItems = computed(() => {
    const enabled = system.value.access?.enabled_modules || [];
    const catalog = system.value.catalog?.modules || [];
    return enabled.filter((key) => key !== 'organizacao').map((key) => catalog.find((module) => module.key === key) || (key === 'painel' ? { key, label: 'Painel' } : { key, label: key }));
});

const copyAccessCode = async () => {
    if (!company.value.access_code) return;
    await navigator.clipboard.writeText(company.value.access_code);
    toast.add({ severity: 'success', summary: 'Copiado', detail: 'Código da empresa copiado.', life: 2500 });
};

const loadExternalLink = async () => {
    if (!hasPermission('servicos.acesso')) return;
    try { const response = await Axios.get(API_CONFIG.EXTERNAL_ACCESS_PROFILE); externalLink.value = response.data || null; } catch { externalLink.value = null; }
};

const copyExternalLink = async () => {
    if (!externalLink.value?.url) return;
    await navigator.clipboard.writeText(externalLink.value.url);
    toast.add({ severity: 'success', summary: 'Copiado', detail: 'Link do painel externo copiado.', life: 2500 });
};

const rotateExternalLink = async () => {
    try { const response = await Axios.post(API_CONFIG.EXTERNAL_ACCESS_ROTATE); externalLink.value = response.data; await copyExternalLink(); toast.add({ severity: 'success', summary: 'Link atualizado', detail: 'O link anterior foi invalidado.', life: 3500 }); } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Não foi possível gerar o link.', life: 5000 }); }
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
        await loadExternalLink();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar configurações.', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const saveProfile = async () => {
    loading.value = true;
    try {
        await Axios.patch(API_CONFIG.PROFILE_ME, {
            name: profile.value.name,
            avatar_url: profile.value.avatar_url || null,
            preferences: profile.value.preferences || {}
        });
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
                <div class="page-title-row">
                    <h5 class="page-title">Gestão da Conta</h5>
                    <i class="pi pi-info-circle page-title-info" tabindex="0" v-tooltip.top="'Gerencie seu perfil, os dados da empresa, os usuários, o plano, os módulos e as permissões da conta.'" aria-label="Informações sobre a gestão da conta" />
                </div>
            </div>
            <ProgressSpinner v-if="loading" style="width: 32px; height: 32px" strokeWidth="4" />
        </div>

        <TabView>
            <TabPanel header="Perfil">
                <div class="grid p-fluid mt-2">
                    <div class="field col-12 md:col-6">
                        <span class="p-float-label"><InputText id="profileName" v-model="profile.name" /><label for="profileName"><span class="text-red-500">*</span> Nome</label></span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <span class="p-float-label"><InputText id="profileEmail" v-model="profile.email" disabled /><label for="profileEmail">Email</label></span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <span class="p-float-label"><InputText id="profileRole" :modelValue="profile.role_name || profile.role_title || (profile.root ? 'Proprietário' : '')" readonly /><label for="profileRole">Cargo</label></span>
                    </div>
                    <div v-if="hasPermission('servicos.acesso')" class="field col-12">
                        <label for="externalAccessLink" class="block text-900 font-medium mb-2">Link individual do painel externo</label>
                        <div class="flex flex-column md:flex-row gap-2">
                            <InputText id="externalAccessLink" :modelValue="externalLink?.url || 'Nenhum link criado'" readonly class="w-full" />
                            <div class="flex gap-2">
                                <Button icon="pi pi-copy" label="Copiar" :disabled="!externalLink?.url" @click="copyExternalLink" />
                                <Button icon="pi pi-refresh" label="Rotacionar" severity="secondary" @click="rotateExternalLink" v-tooltip.top="'Invalida o link anterior e cria um novo'" />
                            </div>
                        </div>
                        <small class="text-600">O link é exclusivo deste usuário. Ao rotacionar, o link anterior deixa de funcionar.</small>
                    </div>
                </div>
                <Button label="Salvar" icon="pi pi-check" :loading="loading" @click="saveProfile()" />
            </TabPanel>

            <TabPanel v-if="isAccountAdmin" header="Empresa">
                <div class="grid p-fluid mt-2">
                    <div class="field col-12 md:col-6">
                        <span class="p-float-label"><InputText id="companyName" v-model="company.name" /><label for="companyName"><span class="text-red-500">*</span> Nome</label></span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <span class="p-float-label"><InputText id="companyCnpj" v-model="company.cnpj" /><label for="companyCnpj">CNPJ</label></span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <div class="flex align-items-end gap-1">
                            <span class="p-float-label flex-1">
                                <InputText id="companyAccessCode" :modelValue="company.access_code || ''" readonly class="w-full" />
                                <label for="companyAccessCode">Código para acesso interno</label>
                            </span>
                            <Button icon="pi pi-copy" v-tooltip.top="'Copiar código'" @click="copyAccessCode" />
                        </div>
                    </div>
                    <div class="field col-12">
                        <label for="companyLogo" class="block text-900 font-medium mb-2">Logo</label>
                        <input id="companyLogo" type="file" accept="image/*" class="p-inputtext p-component w-full" @change="selectImage($event, company, 'logo_url')" />
                    </div>
                    <div class="field col-12">
                        <span class="p-float-label"><Textarea id="companyDescription" v-model="company.description" rows="4" /><label for="companyDescription">Descrição</label></span>
                    </div>
                </div>
                <Button label="Salvar" icon="pi pi-check" :loading="loading" @click="saveCompany()" />
            </TabPanel>

            <TabPanel v-if="isAccountAdmin" header="Sistema">
                <div class="grid mt-2">
                    <div class="col-12 md:col-3">
                        <div class="surface-border border-1 border-round p-3 h-full">
                            <div class="text-600 mb-2">Plano atual</div>
                            <div class="text-900 text-xl font-medium">{{ system.access?.plan?.label || company.plan_key || '-' }}</div>
                            <Tag v-if="system.access?.trial?.active" severity="info" class="mt-3" :value="`Trial: ${system.access.trial.days_remaining} dias`" />
                        </div>
                    </div>
                    <div class="col-12 md:col-5">
                        <div class="surface-border border-1 border-round p-3 h-full">
                            <div class="text-600 mb-2">Módulos habilitados</div>
                            <div class="flex flex-wrap gap-2">
                                <Tag v-for="module in enabledModuleItems" :key="module.key" severity="success" :value="module.label" />
                                <span v-if="!enabledModuleItems.length" class="text-600">Nenhum módulo habilitado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>

            <TabPanel v-if="isAccountAdmin && hasPermission('usuarios.acesso')" header="Usuários">
                <Users />
            </TabPanel>
        </TabView>
    </div>
</template>
