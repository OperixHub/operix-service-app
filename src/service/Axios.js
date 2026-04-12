import axios from 'axios';

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
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
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

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                user.access_token = newAccessToken;
                if (newRefreshToken) user.refresh_token = newRefreshToken;
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) { }
        }

        return newAccessToken;
    } catch (error) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('user');
        window.location.href = '/login';
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