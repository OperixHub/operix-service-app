import axios from 'axios';
import { clearSession, getAccessToken, setSession } from './AuthSession';
import { connectSocket, disconnectSocket } from '@/views/utils/computeds';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const baseURL = import.meta.env.VITE_BASE_URL_API;

const loadCurrentSession = async () => {
    const token = getAccessToken();
    if (!token) {
        throw new Error('Token de acesso ausente');
    }

    const response = await axios.get(`${baseURL}/autenticacao/eu`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        withCredentials: true
    });
    const snapshot = response.data?.data || response.data;

    setSession({
        token,
        user: snapshot.user,
        permissions: snapshot.permissions || [],
        access: snapshot.access || null
    });

    return snapshot;
};

const refreshAccessToken = async () => {
    try {
        const response = await axios.post(
            `${baseURL}/autenticacao/renovar`,
            {},
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            }
        );

        const session = response.data?.data || response.data;
        const newAccessToken = session?.token;

        if (!newAccessToken) {
            throw new Error('Token renovado ausente');
        }

        setSession(session);
        await loadCurrentSession();
        connectSocket();
        return newAccessToken;
    } catch (error) {
        clearSession();
        disconnectSocket();
        window.location.hash = '/login';
        throw error;
    }
};

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
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
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const isTokenExpired =
            error.response?.status === 401 &&
            error.response?.data?.message?.toLowerCase().includes('expirado');

        if (!isTokenExpired || originalRequest?._retry) {
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

export { loadCurrentSession, refreshAccessToken };
export default axiosInstance;
