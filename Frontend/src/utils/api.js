import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    refresh: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Code Execution API
export const codeAPI = {
    submit: async (codeData) => {
        const response = await api.post('/execute/submit', codeData);
        return response.data;
    },

    getSubmissions: async () => {
        const response = await api.get('/execute/submissions');
        return response.data;
    },
};

// Axios interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh if:
        // 1. The request itself was to /auth/refresh (prevent infinite loop)
        // 2. The request was to /auth/login or /auth/register
        // 3. We've already retried this request
        const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');

        // If error is 401 and we haven't retried yet and it's not a refresh/auth endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                await authAPI.refresh();
                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login only if we're not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
