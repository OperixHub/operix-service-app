<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Axios, { loadCurrentSession } from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { setSession } from '@/services/authSession';
import { connectSocket, loadingClose, loadingOpen } from '@/views/utils/computeds';
import { getFirstAllowedMenuPath } from '@/layout/composables/menu';

const router = useRouter();
const toast = useToast();
const visible = ref(false);
const companyCode = ref('');
const username = ref('');
const password = ref('');

const open = () => {
    companyCode.value = '';
    username.value = '';
    password.value = '';
    visible.value = true;
};

const login = async () => {
    if (!companyCode.value.trim() || !username.value.trim() || !password.value) {
        toast.add({
            severity: 'warn',
            summary: 'Dados obrigatórios',
            detail: 'Informe o código da empresa, o usuário e a senha.',
            life: 4000
        });
        return;
    }

    loadingOpen();
    try {
        const response = await Axios.post(API_CONFIG.AUTH.INTERNAL_LOGIN, {
            company_code: companyCode.value.trim().toUpperCase(),
            username: username.value.trim(),
            password: password.value
        });
        const session = response.data;
        setSession(session);
        const snapshot = await loadCurrentSession();
        connectSocket();
        visible.value = false;
        router.replace(
            snapshot.user?.onboarding_required
                ? '/onboarding'
                : getFirstAllowedMenuPath(snapshot.user, snapshot.permissions)
        );
    } catch (error) {
        const apiMessage = error.response?.data?.msg;
        toast.add({
            severity: 'error',
            summary: apiMessage ? 'Acesso não autorizado' : 'Serviço indisponível',
            detail: apiMessage || 'Não foi possível conectar ao serviço de autenticação.',
            life: 5000
        });
    } finally {
        loadingClose();
    }
};

defineExpose({ open });
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        header="Acesso de usuário interno"
        :style="{ width: 'min(92vw, 28rem)' }"
        :draggable="false"
        @keydown.enter="login"
    >
        <div class="p-fluid pt-2">
            <div class="field">
                <span class="p-float-label"><InputText id="internalCompanyCode" v-model="companyCode" autocomplete="organization" class="w-full" /><label for="internalCompanyCode"><span class="text-red-500">*</span> Código da empresa</label></span>
            </div>
            <div class="field">
                <span class="p-float-label"><InputText id="internalUsername" v-model="username" autocomplete="username" class="w-full" /><label for="internalUsername"><span class="text-red-500">*</span> Usuário</label></span>
            </div>
            <div class="field mb-0">
                <span class="p-float-label"><Password id="internalPassword" v-model="password" autocomplete="current-password" toggleMask :feedback="false" :inputStyle="{ width: '100%' }" class="w-full" /><label for="internalPassword"><span class="text-red-500">*</span> Senha</label></span>
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="visible = false" />
            <Button label="Entrar" icon="pi pi-sign-in" @click="login" />
        </template>
    </Dialog>
</template>
