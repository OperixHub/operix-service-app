<script setup>
import { useRegister } from './composables/useRegister';

const { name, username, email, password, tenant, logoUrl, messageRegister, validate, goToLogin } = useRegister();
</script>

<template>
    <Toast />
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-7 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img :src="logoUrl" height="100" class="mb-3" />
                         <div class="text-900 text-3xl font-medium mb-3">Bem-vindo ao Operix</div>
                         <span class="text-600 font-medium">Crie sua conta para começar.</span>
                    </div>
                    <transition-group tag="div">
                        <Message v-for="msg of messageRegister" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                    </transition-group>
                    <div class="mt-4">
                        <label for="tenant" class="block text-900 text-left font-medium mb-2"> NOME DA EMPRESA </label>
                        <InputText id="tenant" type="text" v-model="tenant" placeholder="Ex: Operix Ltda" class="w-full md:w-30rem mb-4" style="padding: 1rem" />

                        <label for="name" class="block text-900 text-left font-medium mb-2"> SEU NOME COMPLETO </label>
                        <InputText id="name" type="text" v-model="name" placeholder="Como quer ser chamado" class="w-full md:w-30rem mb-4" style="padding: 1rem" />

                        <label for="username" class="block text-900 text-left font-medium mb-2"> NOME DE USUÁRIO (LOGIN) </label>
                        <InputText id="username" type="text" v-model="username" placeholder="usuario123" class="w-full md:w-30rem mb-4" style="padding: 1rem" />

                        <label for="email" class="block text-900 font-medium text-left mb-2"> E-MAIL </label>
                        <InputText id="email" type="email" v-model="email" placeholder="seu@email.com" class="w-full md:w-30rem mb-4" style="padding: 1rem" />

                        <label for="password" class="block text-900 font-medium text-left mb-2"> SENHA </label>
                        <Password id="password" v-model="password" toggleMask placeholder="Sua senha segura" class="w-full md:w-30rem mb-5" :feedback="true" :inputStyle="{ padding: '1rem', width: '100%' }" />

                        <Button label="Finalizar Cadastro" icon="pi pi-user-plus" class="w-full p-3 text-xl mb-4" @click="validate()" />
                        <div class="text-center">
                            <a href="#" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer" @click.prevent="goToLogin()">Já tem uma conta? Faça Login</a>
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
