import axios from 'axios';
import { clearSession, getRefreshToken, persistSession } from '@/service/AuthSession';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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
            { headers: { 'Content-Type': 'application/json' } }
        );

        const payload = response.data?.data || response.data;
        const newAccessToken = payload.access_token;
        const newRefreshToken = payload.refresh_token;

        persistSession({
            token: newAccessToken,
            refresh_token: newRefreshToken || refreshToken,
            user: JSON.parse(localStorage.getItem('user') || 'null'),
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
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
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

        const isTokenExpired =
            error.response?.status === 401 &&
            error.response?.data?.message?.includes('expirado');
        if (!isTokenExpired || originalRequest._retry) {
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
