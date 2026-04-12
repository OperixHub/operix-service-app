<script setup>
import { useLogin } from './composables/useLogin';

const { username, password, remember, logoUrl, messageLogin, validate } = useLogin();

const goToRegister = () => {
    window.location.hash = '/register';
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
                         <div class="text-900 text-3xl font-medium mb-3">Bem-vindo de volta!</div>
                         <span class="text-600 font-medium">Acesse sua conta para continuar</span>
                    </div>
                    <transition-group tag="div">
                        <Message v-for="msg of messageLogin" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                    </transition-group>
                    <div class="mt-4">
                        <label for="username" class="block text-900 text-left font-medium mb-2"> NOME DE USUÁRIO </label>
                        <InputText id="username" type="text" v-model="username" placeholder="Login ou e-mail" class="w-full md:w-30rem mb-5" style="padding: 1rem" />

                        <label for="password" class="block text-900 font-medium text-left mb-2"> SENHA </label>
                        <Password id="password" v-model="password" toggleMask placeholder="Sua senha" class="w-full md:w-30rem mb-5" :feedback="false" :inputStyle="{ padding: '1rem', width: '100%' }" />

                        <div class="flex align-items-center justify-content-between mb-6 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="remember" id="remember" binary class="mr-2" />
                                <label for="remember">Lembre de mim</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Esqueceu a senha?</a>
                        </div>
                        <Button label="Entrar no Sistema" icon="pi pi-sign-in" class="w-full p-3 text-xl mb-4" @click="validate()" />
                        
                        <div class="text-center">
                            <span class="text-600 font-medium">Não tem uma conta?</span>
                            <a class="font-medium no-underline ml-2 text-blue-500 cursor-pointer" @click="goToRegister()">Cadastre sua empresa</a>
                        </div>
                    </div>
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
</style>
