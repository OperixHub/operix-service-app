<script setup>
import { useRegister } from './composables/useRegister';

const { name, username, email, password, tenant, logoUrl, messageRegister, validate, goToLogin } = useRegister();
</script>

<template>
    <Toast />

    <div class="auth-shell">
        <section class="auth-panel auth-panel--brand">
            <div class="auth-brand">
                <img :src="logoUrl" alt="Operix" class="auth-brand__logo" />
                <span class="auth-brand__eyebrow">Onboarding</span>
                <h1>Comece o tenant com uma base pronta para operação.</h1>
                <p>Cadastre a empresa e o usuário inicial para gerar a estrutura básica de autenticação e organização no Operix.</p>
            </div>
        </section>

        <section class="auth-panel auth-panel--form">
            <div class="auth-card">
                <div class="auth-card__header">
                    <h2>Criar conta</h2>
                    <p>Preencha os dados iniciais para provisionar a empresa.</p>
                </div>

                <transition-group tag="div">
                    <Message v-for="msg of messageRegister" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                </transition-group>

                <div class="auth-form">
                    <label for="tenant">Empresa</label>
                    <InputText id="tenant" v-model="tenant" placeholder="Ex: Operix Assistência Técnica" />

                    <label for="name">Nome completo</label>
                    <InputText id="name" v-model="name" placeholder="Como você quer ser identificado" />

                    <label for="username">Usuário</label>
                    <InputText id="username" v-model="username" placeholder="usuario.inicial" />

                    <label for="email">E-mail</label>
                    <InputText id="email" v-model="email" placeholder="voce@empresa.com.br" />

                    <label for="password">Senha</label>
                    <Password id="password" v-model="password" toggleMask placeholder="Defina uma senha segura" />

                    <Button label="Finalizar cadastro" icon="pi pi-user-plus" class="w-full" @click="validate()" />
                </div>

                <div class="auth-card__footer">
                    <span>Já existe uma conta?</span>
                    <a class="auth-link" @click.prevent="goToLogin()">Voltar para o login</a>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.auth-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.08fr 1fr;
    background:
        radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 34%),
        linear-gradient(145deg, #eef2ff 0%, #f8fafc 44%, #dbeafe 100%);
}

.auth-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.auth-panel--brand {
    background: linear-gradient(165deg, rgba(15, 23, 42, 0.97), rgba(8, 47, 73, 0.92));
    color: #f8fafc;
}

.auth-brand {
    max-width: 30rem;
}

.auth-brand__logo {
    width: 5rem;
    height: 5rem;
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.08);
    padding: 0.8rem;
    margin-bottom: 1.5rem;
}

.auth-brand__eyebrow {
    display: inline-block;
    margin-bottom: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 0.78rem;
    color: rgba(191, 219, 254, 0.86);
}

.auth-brand h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3.15rem);
    line-height: 1.05;
}

.auth-brand p {
    margin-top: 1rem;
    font-size: 1rem;
    color: rgba(226, 232, 240, 0.86);
    line-height: 1.7;
}

.auth-card {
    width: min(31rem, 100%);
    padding: 2rem;
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
}

.auth-card__header h2 {
    margin: 0;
    font-size: 2rem;
}

.auth-card__header p,
.auth-card__footer span {
    color: var(--text-color-secondary);
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    margin-top: 1.4rem;
}

.auth-card__footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-top: 1.25rem;
}

.auth-link {
    color: #1d4ed8;
    font-weight: 600;
    cursor: pointer;
}

@media (max-width: 960px) {
    .auth-shell {
        grid-template-columns: 1fr;
    }

    .auth-panel--brand {
        min-height: 18rem;
    }
}
</style>
