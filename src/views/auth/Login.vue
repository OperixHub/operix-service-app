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

const {
    TYPE_FORM_INITIAL,
    TYPE_FORM_REGISTER,
    TYPE_FORM_LOGIN,
    typeForm,
    email,
    password,
    messageLogin,
    confirmPassword,
    messageRegister,
    validate,
    goToLogin,
    loginWithGoogle,
    goToForgotPassword
} = useLogin();
</script>

<template>
    <Toast />
    <div class="auth-quick-actions">
        <Button
            label="Acesso interno"
            icon="pi pi-users"
            class="p-button-outlined"
            @click="internalAccessDialog.open()"
        />
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
                        <img src="/layout/images/opeflow-icon.png" alt="" />
                        <span>Opeflow</span>
                    </div>
                    <p class="text-600 mt-3 mb-0">Acesse a gestão da sua operação</p>
                </div>

                <transition-group tag="div">
                    <Message v-for="msg of messageLogin" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                    <Message v-for="msg of messageRegister" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                </transition-group>

                <div class="mt-4">
                    <Button label="Continuar com Google" icon="pi pi-google" class="w-full p-3 text-lg p-button-outlined" @click="loginWithGoogle()" />

                    <div class="divider">
                        <span>ou</span>
                    </div>

                    <InputText id="email" type="email" v-model="email" :disabled="typeForm !== TYPE_FORM_INITIAL" placeholder="E-mail" class="w-full mb-2" style="padding: 1rem" />
                    <div v-if="typeForm !== TYPE_FORM_INITIAL" class="flex align-items-center justify-content-end mb-2 gap-5">
                        <a class="font-medium no-underline text-blue-500 text-right cursor-pointer" @click.prevent="goToLogin(true)">Alterar e-mail</a>
                    </div>

                    <Password
                        v-if="typeForm !== TYPE_FORM_INITIAL"
                        id="password"
                        v-model="password"
                        placeholder="Senha"
                        class="w-full mb-2"
                        :feedback="typeForm === TYPE_FORM_REGISTER"
                        :inputStyle="{ padding: '1rem', width: '100%' }"
                    />
                    <div v-if="typeForm === TYPE_FORM_LOGIN" class="flex align-items-center justify-content-end mb-4 gap-5">
                        <a class="font-medium no-underline text-blue-500 text-right cursor-pointer" @click="goToForgotPassword()">Esqueci a senha</a>
                    </div>

                    <Password
                        v-if="typeForm === TYPE_FORM_REGISTER"
                        id="confirmPassword"
                        v-model="confirmPassword"
                        toggleMask
                        placeholder="Confirme a senha"
                        class="w-full mb-2"
                        :feedback="false"
                        :inputStyle="{ padding: '1rem', width: '100%' }"
                    />

                    <Button v-if="typeForm === TYPE_FORM_INITIAL" label="Continuar com e-mail" class="w-full p-3 text-lg" @click="validate(typeForm)" />
                    <Button v-if="typeForm !== TYPE_FORM_INITIAL" label="Entrar" icon="pi pi-sign-in" class="w-full p-3 text-lg mt-4" @click="validate(typeForm)" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--text-color-secondary);
    margin: 24px 0;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--surface-border);
}

.divider span {
    padding: 0 12px;
    font-size: 14px;
    background: var(--surface-card);
}

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
