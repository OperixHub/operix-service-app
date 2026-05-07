import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const PERMISSIONS_KEY = 'permissions';
const ACCESS_CONTEXT_KEY = 'access_context';
const PKCE_VERIFIER_KEY = 'operix_pkce_verifier';
const PKCE_STATE_KEY = 'operix_pkce_state';

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser() {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;

    try {
        return JSON.parse(user);
    } catch (_error) {
        clearSession();
        return null;
    }
}

export function decodeAccessToken(token = getAccessToken()) {
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch (_error) {
        return null;
    }
}

export function isSessionValid() {
    const decoded = decodeAccessToken();
    if (!decoded?.exp) return false;

    return Date.now() < decoded.exp * 1000;
}

export function hasCompletedOnboarding() {
    const user = getCurrentUser();
    return Boolean(user?.tenant_id && !user?.onboarding_required);
}

export function getPermissions() {
    try {
        return JSON.parse(localStorage.getItem(PERMISSIONS_KEY) || '[]');
    } catch (_error) {
        return [];
    }
}

export function hasPermission(permissionKey) {
    return getPermissions().includes(permissionKey);
}

export function getAccessContext() {
    try {
        return JSON.parse(localStorage.getItem(ACCESS_CONTEXT_KEY) || 'null');
    } catch (_error) {
        return null;
    }
}

export function persistSession(payload) {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.token);
    if (payload.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user || null));
    if (payload.permissions) {
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(payload.permissions));
    }
    if (payload.access) {
        localStorage.setItem(ACCESS_CONTEXT_KEY, JSON.stringify(payload.access));
    }
}

export function updateCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user || null));
}

export function updateAuthorization({ permissions = null, access = null }) {
    if (permissions) {
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    }
    if (access) {
        localStorage.setItem(ACCESS_CONTEXT_KEY, JSON.stringify(access));
    }
}

export function clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
    localStorage.removeItem(ACCESS_CONTEXT_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);
}

export function savePkceState({ verifier, state }) {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(PKCE_STATE_KEY, state);
}

export function consumePkceState() {
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    const state = sessionStorage.getItem(PKCE_STATE_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);
    return { verifier, state };
}
