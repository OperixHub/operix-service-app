<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import TopbarNotification from './components/TopbarNotification.vue';
import { useRouter } from 'vue-router';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { clearSession, sessionState } from '@/services/authSession';
import { disconnectSocket } from '@/views/utils/computeds';
const router = useRouter();

const logout = async () => {
    try {
        await Axios.post(API_CONFIG.AUTH.LOGOUT, {});
    } catch {
        // A limpeza local precisa acontecer mesmo se a sessão no servidor já expirou.
    }
    clearSession();
    disconnectSocket();
    router.replace('/login');
};

const { changeThemeSettings, layoutConfig, onMenuToggle } = useLayout();
const currentUserName = computed(() => sessionState.currentUser.value?.name || sessionState.currentUser.value?.username || 'Usuário');
const currentUserInitial = computed(() => currentUserName.value.charAt(0).toUpperCase());

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

const onChangeTheme = (theme, mode) => {
    const elementId = 'theme-css';
    const linkElement = document.getElementById(elementId);
    const cloneLinkElement = linkElement.cloneNode(true);
    const newThemeUrl = linkElement.getAttribute('href').replace(layoutConfig.theme.value, theme);
    cloneLinkElement.setAttribute('id', elementId + '-clone');
    cloneLinkElement.setAttribute('href', newThemeUrl);
    cloneLinkElement.addEventListener('load', () => {
        linkElement.remove();
        cloneLinkElement.setAttribute('id', elementId);
        changeThemeSettings(theme, mode === 'dark');
    });
    linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);
};
</script>

<template>
    <div class="layout-topbar">
        <button class="p-link layout-menu-button layout-topbar-button" v-tooltip.bottom="'Abrir menu'" aria-label="Abrir menu" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <div class="topbar-user">
                <Avatar :label="currentUserInitial" shape="circle" />
                <span>{{ currentUserName }}</span>
            </div>
            <TopbarNotification />
            <button
                class="p-link layout-topbar-button"
                :aria-label="layoutConfig.darkTheme.value ? 'Ativar modo claro' : 'Ativar modo escuro'"
                v-tooltip.bottom="layoutConfig.darkTheme.value ? 'Modo claro' : 'Modo escuro'"
                @click="layoutConfig.darkTheme.value ? onChangeTheme('lara-light-blue', 'light') : onChangeTheme('lara-dark-blue', 'dark')"
            >
                <i :class="layoutConfig.darkTheme.value ? 'pi pi-sun' : 'pi pi-moon'" />
            </button>
            <button class="p-link layout-topbar-button logout-button" aria-label="Sair" v-tooltip.bottom="'Sair'" @click="logout()">
                <i class="pi pi-sign-out" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.topbar-user {
    display: flex;
    align-items: center;
    gap: .65rem;
    max-width: 16rem;
    margin-right: .5rem;
    color: var(--text-color);
    font-weight: 600;
}

.topbar-user span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.logout-button {
    color: var(--red-500) !important;
}

@media (max-width: 640px) {
    .topbar-user span {
        display: none;
    }
}
</style>
