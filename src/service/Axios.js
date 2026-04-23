import axios from 'axios';
import { clearSession, getAccessToken, getRefreshToken, syncSessionTokens } from '@/core/auth/session';

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
    }

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL_API}/auth/refresh`,
            { refresh_token: refreshToken },
            {
                headers: { 'Content-Type': 'application/json' },
                transformResponse: [(data) => data],
            }
        );

        const newAccessToken = response.data?.data?.access_token;
        const newRefreshToken = response.data?.data?.refresh_token;

        if (!newAccessToken) {
            throw new Error('Resposta de refresh sem access token.');
        }

        syncSessionTokens({
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        });

        return newAccessToken;
    } catch (error) {
        clearSession();
        window.location.hash = '/login';
        throw error;
    }
};

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';
        const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

        const shouldRefresh = error.response?.status === 401 && !isAuthRequest;

        if (!shouldRefresh || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;
