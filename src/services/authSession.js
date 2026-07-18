import { readonly, ref } from 'vue';

const accessToken = ref(null);
const currentUser = ref(null);
const currentPermissions = ref([]);
const currentAccess = ref(null);

export function setSession(session) {
    accessToken.value = session?.token || null;
    currentUser.value = session?.user || null;
    currentPermissions.value = Array.isArray(session?.permissions) ? session.permissions : [];
    currentAccess.value = session?.access || null;
}

export function clearSession() {
    accessToken.value = null;
    currentUser.value = null;
    currentPermissions.value = [];
    currentAccess.value = null;
}

export function getAccessToken() {
    return accessToken.value;
}

export function getCurrentUser() {
    return currentUser.value;
}

export function getCurrentPermissions() {
    return currentPermissions.value;
}

export function getCurrentAccess() {
    return currentAccess.value;
}

export function hasPermission(permission) {
    if (!permission) {
        return true;
    }

    const user = currentUser.value;
    if (user?.admin || user?.root) {
        return true;
    }

    return currentPermissions.value.includes(permission);
}

export function hasSession() {
    return Boolean(accessToken.value && currentUser.value);
}

export const sessionState = {
    accessToken: readonly(accessToken),
    currentUser: readonly(currentUser),
    currentPermissions: readonly(currentPermissions),
    currentAccess: readonly(currentAccess)
};
