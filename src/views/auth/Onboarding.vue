<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { getCurrentUser, updateCurrentUser } from '@/service/AuthSession';
import { loadAuthorizationSnapshot } from '@/service/Authorization';

const router = useRouter();
const toast = useToast();
const { layoutConfig } = useLayout();
const companyName = ref('');
const cnpj = ref('');
const description = ref('');
const loading = ref(false);
const message = ref('');
const user = computed(() => getCurrentUser());

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.png`;
});

const complete = async () => {
    message.value = '';

    if (!companyName.value.trim()) {
        message.value = 'Informe o nome da empresa.';
        return;
    }

    loading.value = true;
    try {
        const response = await Axios.post(API_CONFIG.AUTH.ONBOARDING, {
            company_name: companyName.value,
            cnpj: cnpj.value || null,
            description: description.value || null
        });
        const payload = response.data;
        updateCurrentUser({ ...payload, onboarding_required: false });
        await loadAuthorizationSnapshot();
        toast.add({ severity: 'success', summary: 'Onboarding concluído', detail: 'Empresa configurada com sucesso.', life: 4000 });
        router.push('/dashboard');
    } catch (error) {
        message.value = error.response?.data?.msg || 'Não foi possível concluir o onboarding.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Toast />
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img :src="logoUrl" alt="Operix Logo" height="100" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Configure sua empresa</div>
                        <span class="text-600 font-medium">{{ user?.name || user?.email }}</span>
                    </div>

                    <Message v-if="message" severity="error">{{ message }}</Message>

                    <div class="mt-4">
                        <label for="companyName" class="block text-900 text-left font-medium mb-2"> Empresa </label>
                        <InputText id="companyName" type="text" v-model="companyName" placeholder="Ex: Operix Ltda" class="w-full md:w-30rem mb-4" style="padding: 1rem" />

                        <label for="cnpj" class="block text-900 text-left font-medium mb-2"> CNPJ </label>
                        <InputText id="cnpj" type="text" v-model="cnpj" placeholder="Opcional" class="w-full md:w-30rem mb-4" style="padding: 1rem" />

                        <label for="description" class="block text-900 font-medium text-left mb-2"> Descrição </label>
                        <Textarea id="description" v-model="description" rows="4" placeholder="Opcional" class="w-full md:w-30rem mb-5" style="padding: 1rem" />

                        <Button label="Concluir Configuração" icon="pi pi-check" class="w-full p-3 text-xl mb-4" :loading="loading" @click="complete()" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
