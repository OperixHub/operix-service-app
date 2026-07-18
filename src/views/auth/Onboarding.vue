<script setup>
import Axios, { refreshAccessToken, loadCurrentSession } from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { getFirstAllowedMenuPath } from '@/layout/composables/menu';
import { getCurrentPermissions, getCurrentUser } from '@/services/authSession';
import { loadingClose, loadingOpen } from '@/views/utils/computeds';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const companyName = ref('');
const name = ref('');
const username = ref('');
const cnpj = ref('');
const description = ref('');
const message = ref('');

const submit = async () => {
    message.value = '';

    // Monta o payload apenas com os campos que o usuário preencheu
    const payload = {};
    if (companyName.value.trim()) payload.company_name = companyName.value.trim();
    if (name.value.trim()) payload.name = name.value.trim();
    if (username.value.trim()) payload.username = username.value.trim();
    if (cnpj.value.trim()) payload.cnpj = cnpj.value.trim();
    if (description.value.trim()) payload.description = description.value.trim();

    loadingOpen();
    try {
        await Axios.post(API_CONFIG.AUTH.ONBOARDING, payload);
        // Recarrega a sessão para refletir o nome/username atualizados no token
        const snapshot = await loadCurrentSession();
        toast.add({ severity: 'success', summary: 'Onboarding concluído', detail: 'Conta configurada com sucesso.', life: 5000 });
        router.replace(getFirstAllowedMenuPath(snapshot.user, snapshot.permissions));
    } catch (error) {
        message.value = error.response?.data?.msg || 'Erro ao concluir onboarding.';
    } finally {
        loadingClose();
    }
};
</script>

<template>
    <Toast />
    <div class="auth-page surface-ground flex align-items-center justify-content-center">
        <div class="auth-shell">
            <div class="auth-card surface-card py-7 px-5 sm:px-8">
                <div class="text-center mb-5">
                    <i class="pi pi-building text-5xl text-primary mb-4" />
                    <div class="text-900 text-3xl font-medium mb-3">Configure sua conta</div>
                    <span class="text-600 font-medium">Personalize os dados da empresa e do seu perfil. Todos os campos são opcionais.</span>
                </div>

                <Message v-if="message" severity="error">{{ message }}</Message>

                <div class="mt-4">
                    <label for="companyName" class="block text-900 text-left font-medium mb-2"> NOME DA EMPRESA </label>
                    <InputText id="companyName" v-model="companyName" placeholder="Ex: Operix Ltda" class="w-full mb-4" style="padding: 1rem" />

                    <label for="name" class="block text-900 text-left font-medium mb-2"> SEU NOME COMPLETO </label>
                    <InputText id="name" v-model="name" placeholder="Como quer ser chamado" class="w-full mb-4" style="padding: 1rem" />

                    <label for="username" class="block text-900 text-left font-medium mb-2"> NOME DE USUÁRIO </label>
                    <InputText id="username" v-model="username" placeholder="usuario123" class="w-full mb-4" style="padding: 1rem" />

                    <label for="cnpj" class="block text-900 text-left font-medium mb-2"> CNPJ <span class="text-500">(opcional)</span></label>
                    <InputText id="cnpj" v-model="cnpj" placeholder="00.000.000/0000-00" class="w-full mb-4" style="padding: 1rem" />

                    <label for="description" class="block text-900 text-left font-medium mb-2"> DESCRIÇÃO <span class="text-500">(opcional)</span></label>
                    <Textarea id="description" v-model="description" rows="3" autoResize class="w-full mb-5" />

                    <Button label="Concluir" icon="pi pi-check" class="w-full p-3 text-xl" @click="submit()" />
                    <Button label="Pular por agora" icon="pi pi-arrow-right" class="w-full p-3 mt-3 p-button-text p-button-secondary" @click="submit()" />
                </div>
            </div>
        </div>
    </div>
</template>
