<script setup>
import Axios, { refreshAccessToken } from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { getFirstAllowedMenuPath } from '@/config/menu.config';
import { getCurrentPermissions, getCurrentUser } from '@/service/AuthSession';
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
    if (!companyName.value || !name.value || !username.value) {
        message.value = 'Preencha nome da empresa, seu nome e nome de usuário.';
        return;
    }

    loadingOpen();
    try {
        await Axios.post(API_CONFIG.AUTH.ONBOARDING, {
            company_name: companyName.value,
            name: name.value,
            username: username.value,
            cnpj: cnpj.value || null,
            description: description.value || null
        });
        await refreshAccessToken();
        toast.add({ severity: 'success', summary: 'Onboarding concluído', detail: 'Conta configurada com sucesso.', life: 5000 });
        router.replace(getFirstAllowedMenuPath(getCurrentUser(), getCurrentPermissions()));
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
                    <div class="text-900 text-3xl font-medium mb-3">Complete seu onboarding</div>
                    <span class="text-600 font-medium">Agora informe os dados da empresa e seu perfil de administrador.</span>
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

                    <Button label="Concluir Onboarding" icon="pi pi-check" class="w-full p-3 text-xl" @click="submit()" />
                </div>
            </div>
        </div>
    </div>
</template>
