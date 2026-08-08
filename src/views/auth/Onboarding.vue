<script setup>
import Axios, { loadCurrentSession } from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { getFirstAllowedMenuPath } from '@/layout/composables/menu';
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
                    <span class="p-float-label mb-4"><InputText id="companyName" v-model="companyName" class="w-full" style="padding: 1rem" /><label for="companyName">Nome da empresa</label></span>

                    <span class="p-float-label mb-4"><InputText id="name" v-model="name" class="w-full" style="padding: 1rem" /><label for="name">Seu nome completo</label></span>

                    <span class="p-float-label mb-4"><InputText id="username" v-model="username" class="w-full" style="padding: 1rem" /><label for="username">Nome de usuário</label></span>

                    <span class="p-float-label mb-4"><InputText id="cnpj" v-model="cnpj" class="w-full" style="padding: 1rem" /><label for="cnpj">CNPJ <span class="text-500">(opcional)</span></label></span>

                    <span class="p-float-label mb-5"><Textarea id="description" v-model="description" rows="3" autoResize class="w-full" /><label for="description">Descrição <span class="text-500">(opcional)</span></label></span>

                    <Button label="Concluir" icon="pi pi-check" class="w-full p-3 text-xl" @click="submit()" />
                    <Button label="Pular por agora" icon="pi pi-arrow-right" class="w-full p-3 mt-3 p-button-text p-button-secondary" @click="submit()" />
                </div>
            </div>
        </div>
    </div>
</template>
