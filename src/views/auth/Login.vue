<script setup>
import { useLogin } from './composables/useLogin';

const { username, password, remember, logoUrl, messageLogin, validate } = useLogin();

const goToRegister = () => {
    window.location.hash = '/register';
};
</script>

<template>
    <Toast />

    <div class="auth-shell">
        <section class="auth-panel auth-panel--brand">
            <div class="auth-brand">
                <img :src="logoUrl" alt="Operix" class="auth-brand__logo" />
                <span class="auth-brand__eyebrow">Operix Service</span>
                <h1>Controle operacional com uma interface mais clara e segura.</h1>
                <p>Faça login para acessar serviços, estoque, usuários e definições do tenant a partir de um painel unificado.</p>
            </div>
        </section>

        <section class="auth-panel auth-panel--form">
            <div class="auth-card">
                <div class="auth-card__header">
                    <h2>Entrar</h2>
                    <p>Use seu usuário e senha para continuar.</p>
                </div>

                <transition-group tag="div">
                    <Message v-for="msg of messageLogin" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
                </transition-group>

                <div class="auth-form">
                    <label for="username">Usuário</label>
                    <InputText id="username" v-model="username" placeholder="Login ou e-mail" />

                    <label for="password">Senha</label>
                    <Password id="password" v-model="password" toggleMask :feedback="false" placeholder="Sua senha" />

                    <div class="auth-meta">
                        <div class="auth-meta__remember">
                            <Checkbox v-model="remember" id="remember" binary />
                            <label for="remember">Lembrar acesso</label>
                        </div>
                        <span class="auth-meta__link">Segurança ativa por token</span>
                    </div>

                    <Button label="Entrar no sistema" icon="pi pi-sign-in" class="w-full" @click="validate()" />
                </div>

                <div class="auth-card__footer">
                    <span>Primeiro acesso?</span>
                    <a class="auth-link" @click="goToRegister()">Cadastre sua empresa</a>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.auth-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    background:
        radial-gradient(circle at top left, rgba(30, 64, 175, 0.22), transparent 32%),
        linear-gradient(135deg, #e0f2fe 0%, #f8fafc 42%, #dbeafe 100%);
}

.auth-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.auth-panel--brand {
    background: linear-gradient(160deg, rgba(15, 23, 42, 0.96), rgba(30, 64, 175, 0.88));
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
    font-size: clamp(2rem, 4vw, 3.2rem);
    line-height: 1.05;
}

.auth-brand p {
    margin-top: 1rem;
    font-size: 1rem;
    color: rgba(226, 232, 240, 0.86);
    line-height: 1.7;
}

.auth-card {
    width: min(30rem, 100%);
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

.auth-meta,
.auth-meta__remember,
.auth-card__footer {
    display: flex;
    align-items: center;
}

.auth-meta,
.auth-card__footer {
    justify-content: space-between;
    gap: 1rem;
}

.auth-meta__remember {
    gap: 0.5rem;
}

.auth-meta__link,
.auth-link {
    color: #1d4ed8;
    font-weight: 600;
}

.auth-link {
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
