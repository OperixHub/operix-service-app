<script setup>
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const message = ref('');
const success = ref(false);
const loading = ref(false);
const token = computed(() => route.query.token || '');
const passwordsMatch = computed(() => {
    if (!password.value || !confirmPassword.value) {
        return null;
    }
    return password.value === confirmPassword.value;
});

const submit = async () => {
    message.value = '';
    if (!token.value) {
        message.value = 'Token de recuperação ausente.';
        return;
    }
    if (!password.value || !confirmPassword.value) {
        message.value = 'Preencha e confirme a nova senha.';
        return;
    }
    if (password.value !== confirmPassword.value) {
        message.value = 'As senhas informadas não conferem.';
        return;
    }

    loading.value = true;
    try {
        await Axios.post(API_CONFIG.AUTH.RESET_PASSWORD, {
            token: token.value,
            password: password.value,
            confirm_password: confirmPassword.value
        });
        success.value = true;
        message.value = 'Senha redefinida com sucesso. Faça login novamente.';
    } catch (error) {
        message.value = error.response?.data?.msg || 'Erro ao redefinir senha.';
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
                    <i class="pi pi-key text-5xl text-primary mb-4" />
                    <div class="text-900 text-3xl font-medium mb-3">Redefinir senha</div>
                    <span class="text-600 font-medium">Crie uma nova senha para sua conta.</span>
                </div>

                <Message v-if="message" :severity="success ? 'success' : 'error'">{{ message }}</Message>

                <label for="password" class="block text-900 font-medium text-left mb-2 mt-4"> NOVA SENHA </label>
                <Password id="password" v-model="password" toggleMask placeholder="Nova senha" class="w-full mb-4" :feedback="true" :inputStyle="{ padding: '1rem', width: '100%' }" />

                <label for="confirmPassword" class="block text-900 font-medium text-left mb-2"> CONFIRME A NOVA SENHA </label>
                <Password id="confirmPassword" v-model="confirmPassword" toggleMask placeholder="Digite novamente" class="w-full mb-2" :feedback="false" :inputStyle="{ padding: '1rem', width: '100%' }" />

                <div class="password-compatibility mb-5" :class="{ ok: passwordsMatch === true, error: passwordsMatch === false }">
                    <i :class="passwordsMatch === true ? 'pi pi-check-circle' : passwordsMatch === false ? 'pi pi-times-circle' : 'pi pi-info-circle'" />
                    <span>{{ passwordsMatch === true ? 'As senhas conferem.' : passwordsMatch === false ? 'As senhas não conferem.' : 'Repita a senha para validar a compatibilidade.' }}</span>
                </div>

                <Button :loading="loading" label="Redefinir senha" icon="pi pi-check" class="w-full p-3 text-xl mb-4" @click="submit()" />
                <div class="text-center">
                    <a class="font-medium no-underline text-blue-500 cursor-pointer" @click="router.push('/login')">Voltar ao login</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.password-compatibility {
    align-items: center;
    color: var(--text-color-secondary);
    display: flex;
    font-size: 0.9rem;
    gap: 0.5rem;
}

.password-compatibility.ok {
    color: var(--green-600);
}

.password-compatibility.error {
    color: var(--red-600);
}
</style>
