import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

const parseStoredJson = (value) => {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch (_error) {
        return null;
    }
};

const decodeToken = (token) => {
    if (!token) {
        return null;
    }

    try {
        return jwtDecode(token);
    } catch (_error) {
        return null;
    }
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getStoredUser = () => parseStoredJson(localStorage.getItem(USER_KEY));

export const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const setStoredUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const setSession = ({ token, refresh_token, user }) => {
    const decoded = decodeToken(token);
    const normalizedUser = {
        ...(user || {}),
        exp: decoded?.exp || null,
    };

    localStorage.setItem(ACCESS_TOKEN_KEY, token);

    if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    }

    setStoredUser(normalizedUser);
    return normalizedUser;
};

export const isSessionValid = () => {
    const token = getAccessToken();
    const decoded = decodeToken(token);

    if (!token || !decoded?.exp) {
        return false;
    }

    return Date.now() < decoded.exp * 1000;
};

export const syncSessionTokens = ({ access_token, refresh_token }) => {
    const currentUser = getStoredUser() || {};
    return setSession({
        token: access_token,
        refresh_token: refresh_token || getRefreshToken(),
        user: currentUser,
    });
};
