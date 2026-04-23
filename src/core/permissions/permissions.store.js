import { reactive } from 'vue';
import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { clearSession, getStoredUser, setStoredUser } from '@/core/auth/session';
import { getApiData } from '@/service/api-utils';

const state = reactive({
    effectivePermissions: [],
    permissions: [],
    catalog: {
        modules: [],
        permissions: []
    },
    initialized: false,
    catalogLoaded: false,
    loading: false,
    userId: null
});

const syncUserPermissions = () => {
    const user = getStoredUser();

    if (!user) {
        return;
    }

    setStoredUser({
        ...user,
        permissions: [...state.effectivePermissions]
    });
};

export const resetPermissionsState = () => {
    state.effectivePermissions = [];
    state.permissions = [];
    state.catalog = { modules: [], permissions: [] };
    state.initialized = false;
    state.catalogLoaded = false;
    state.loading = false;
    state.userId = null;
};

export const hasPermission = (permissionKey) => {
    if (!permissionKey) {
        return true;
    }

    return state.effectivePermissions.includes(permissionKey);
};

export const loadCurrentPermissions = async (force = false) => {
    const user = getStoredUser();
    const currentUserId = user?.id ?? null;

    if (!force && state.initialized && state.userId === currentUserId) {
        return state.effectivePermissions;
    }

    state.loading = true;

    try {
        const response = await Axios.get(API_CONFIG.PERMISSIONS.ME);
        const payload = getApiData(response, {});

        state.effectivePermissions = payload.effective_permissions || [];
        state.permissions = payload.permissions || [];
        state.initialized = true;
        state.userId = currentUserId;
        syncUserPermissions();

        return state.effectivePermissions;
    } catch (error) {
        clearSession();
        resetPermissionsState();
        throw error;
    } finally {
        state.loading = false;
    }
};

export const loadPermissionsCatalog = async (force = false) => {
    if (!force && state.catalogLoaded) {
        return state.catalog;
    }

    const response = await Axios.get(API_CONFIG.PERMISSIONS.CATALOG);
    state.catalog = getApiData(response, { modules: [], permissions: [] });
    state.catalogLoaded = true;

    return state.catalog;
};

export const permissionsStore = state;
