<script setup>
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const message = ref('');
const resetUrl = ref('');
const loading = ref(false);

const openResetUrl = () => {
    if (resetUrl.value) {
        window.location.href = resetUrl.value;
    }
};

const submit = async () => {
    message.value = '';
    resetUrl.value = '';
    if (!email.value) {
        message.value = 'Informe seu e-mail.';
        return;
    }

    loading.value = true;
    try {
        const response = await Axios.post(API_CONFIG.AUTH.FORGOT_PASSWORD, { email: email.value });
        resetUrl.value = response.data?.reset_url || '';
        message.value = 'Se o e-mail existir, enviaremos instruções para redefinir a senha.';
    } catch (error) {
        message.value = error.response?.data?.msg || 'Erro ao solicitar recuperação de senha.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="auth-page surface-ground flex align-items-center justify-content-center">
        <div class="auth-shell">
            <div class="auth-card surface-card py-7 px-5 sm:px-8">
                <div class="text-center mb-5">
                    <i class="pi pi-lock text-5xl text-primary mb-4" />
                    <div class="text-900 text-3xl font-medium mb-3">Recuperar senha</div>
                    <span class="text-600 font-medium">Informe o e-mail cadastrado para receber o link de redefinição.</span>
                </div>

                <Message v-if="message" :severity="resetUrl || message.includes('enviaremos') ? 'success' : 'error'">{{ message }}</Message>

                <span class="p-float-label mt-5 mb-4"><InputText id="email" v-model="email" type="email" class="w-full" style="padding: 1rem" /><label for="email"><span class="text-red-500">*</span> E-mail</label></span>

                <Button :loading="loading" label="Enviar link" icon="pi pi-send" class="w-full p-3 text-xl mb-4" @click="submit()" />
                <Button v-if="resetUrl" label="Abrir link de redefinição" icon="pi pi-external-link" class="w-full p-3 mb-4 p-button-outlined" @click="openResetUrl()" />
                <div class="text-center">
                    <a class="font-medium no-underline text-blue-500 cursor-pointer" @click="router.push('/login')">Voltar ao login</a>
                </div>
            </div>
        </div>
    </div>
</template>
