<script setup>
import { useLogin } from './composables/useLogin';
import { ref } from 'vue';
import InternalAccessDialog from './components/InternalAccessDialog.vue';
import { useLayout } from '@/layout/composables/layout';

const internalAccessDialog = ref(null);
const { changeThemeSettings, layoutConfig } = useLayout();

const toggleTheme = () => {
    const darkTheme = !layoutConfig.darkTheme.value;
    const theme = darkTheme ? 'lara-dark-blue' : 'lara-light-blue';
    const linkElement = document.getElementById('theme-css');
    const cloneLinkElement = linkElement.cloneNode(true);
    cloneLinkElement.id = 'theme-css-clone';
    cloneLinkElement.href = linkElement.href.replace(layoutConfig.theme.value, theme);
    cloneLinkElement.addEventListener('load', () => {
        linkElement.remove();
        cloneLinkElement.id = 'theme-css';
        changeThemeSettings(theme, darkTheme);
    });
    linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);
};

const { messageLogin, loginWithGoogle } = useLogin();
</script>

<template>
    <Toast />
    <div class="auth-quick-actions">
        <Button
            :icon="layoutConfig.darkTheme.value ? 'pi pi-sun' : 'pi pi-moon'"
            class="p-button-outlined p-button-icon-only"
            :aria-label="layoutConfig.darkTheme.value ? 'Ativar modo claro' : 'Ativar modo escuro'"
            v-tooltip.bottom="layoutConfig.darkTheme.value ? 'Modo claro' : 'Modo escuro'"
            @click="toggleTheme"
        />
    </div>
    <InternalAccessDialog ref="internalAccessDialog" />
    <div class="auth-page surface-ground flex align-items-center justify-content-center">
        <div class="auth-shell">
            <div class="auth-card surface-card py-6 px-5 sm:px-8">
                <div class="text-center mb-6">
                    <div class="brand-lockup justify-content-center">
                        <img src="/layout/images/opeflow-icon.svg" alt="" />
                        <span>Opeflow</span>
                    </div>
                    <p class="text-600 mt-3 mb-0">Acesse a gestão da sua operação</p>
                </div>

                <transition-group tag="div">
                    <Message v-for="msg of messageLogin" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                    <Message v-for="msg of messageRegister" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                </transition-group>

                <div class="mt-4">
                    <Button label="Entrar com Google" icon="pi pi-google" class="w-full p-3 text-lg" @click="loginWithGoogle()" />
                    <Button label="Acesso para equipe interna" icon="pi pi-users" class="p-button-text w-full mt-4" @click="internalAccessDialog.open()" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-quick-actions {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    display: flex;
    gap: .5rem;
}

@media (max-width: 480px) {
    .auth-quick-actions {
        top: 0.75rem;
        right: 0.75rem;
    }
}
</style>
