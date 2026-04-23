<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import TopbarNotification from './components/TopbarNotification.vue';
import { useRouter } from 'vue-router';
import { clearSession, getStoredUser } from '@/core/auth/session';
const router = useRouter();

const logout = async () => {
    clearSession();
    router.push('/login');
};

const { changeThemeSettings, layoutConfig, onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.png`;
});

const currentUser = computed(() => getStoredUser() || {});
const userInitials = computed(() => {
    const baseName = currentUser.value?.name || currentUser.value?.username || 'OP';
    return baseName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
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

    if (!sidebarEl || !topbarEl) {
        return true;
    }

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
const modeSelected = ref(layoutConfig.darkTheme.value === 'dark' ? 'dark' : 'light');
watch(
    () => layoutConfig.darkTheme.value,
    (value) => {
        modeSelected.value = value === 'dark' ? 'dark' : 'light';
    }
);
const onChangeTheme = (theme, mode) => {
    modeSelected.value = mode;
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
        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <div class="layout-topbar-brand">
            <img :src="logoUrl" alt="Operix" class="layout-topbar-brand__logo" />
            <div class="layout-topbar-brand__content">
                <strong>Operix Service</strong>
                <span>Painel operacional do tenant</span>
            </div>
        </div>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <TopbarNotification />

            <button class="p-link layout-topbar-button" @click="onChangeTheme(modeSelected == 'dark' ? 'lara-light-blue' : 'lara-dark-blue', modeSelected == 'dark' ? 'light' : 'dark')">
                <i v-if="modeSelected == 'dark'" class="pi pi-sun"></i>
                <i v-else class="pi pi-moon"></i>
            </button>

            <div class="layout-topbar-user">
                <div class="layout-topbar-user__avatar">{{ userInitials }}</div>
                <div class="layout-topbar-user__meta">
                    <strong>{{ currentUser?.name || currentUser?.username || 'Operix' }}</strong>
                    <span>{{ currentUser?.admin ? 'Administrador' : 'Acesso autenticado' }}</span>
                </div>
            </div>

            <button class="p-link layout-topbar-button layout-topbar-button--danger" v-tooltip.top="'Sair'" @click="logout()">
                <i class="pi pi-sign-out"></i>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layout-topbar-brand {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-left: 1rem;
}

.layout-topbar-brand__logo {
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 0.9rem;
    object-fit: contain;
    background: rgba(15, 23, 42, 0.06);
    padding: 0.4rem;
}

.layout-topbar-brand__content {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
}

.layout-topbar-brand__content span {
    color: var(--text-color-secondary);
    font-size: 0.82rem;
}

.layout-topbar-user {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.35rem 0.4rem 0.35rem 0.8rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.04);
}

.layout-topbar-user__avatar {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #0f172a, #1d4ed8);
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
}

.layout-topbar-user__meta {
    display: flex;
    flex-direction: column;
}

.layout-topbar-user__meta span {
    color: var(--text-color-secondary);
    font-size: 0.78rem;
}

.layout-topbar-button--danger {
    color: #dc2626;
}
</style>
