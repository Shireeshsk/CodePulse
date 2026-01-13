import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    verifyOTP: async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resetPassword: async (resetToken, newPassword) => {
        const response = await api.post('/auth/reset-password', { resetToken, newPassword });
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

    getStats: async () => {
        const response = await api.get('/execute/stats');
        return response.data;
    },
};

// Problem Management API (Admin only)
export const problemAPI = {
    createProblem: async (problemData) => {
        const response = await api.post('/problem/create-problem', problemData);
        return response.data;
    },

    updateProblem: async (id, problemData) => {
        const response = await api.put(`/problem/update-problem/${id}`, problemData);
        return response.data;
    },

    getProblemForEdit: async (id) => {
        const response = await api.get(`/problem/edit/${id}`);
        return response.data;
    },

    createTestCase: async (testCaseData) => {
        const response = await api.post('/problem/create-testcases', testCaseData);
        return response.data;
    },

    updateTestCase: async (id, testCaseData) => {
        const response = await api.put(`/problem/update-testcase/${id}`, testCaseData);
        return response.data;
    },

    deleteTestCase: async (id) => {
        const response = await api.delete(`/problem/delete-testcase/${id}`);
        return response.data;
    },

    createBoilerplate: async (boilerplateData) => {
        const response = await api.post('/problem/create-language', boilerplateData);
        return response.data;
    },

    updateBoilerplate: async (id, boilerplateData) => {
        const response = await api.put(`/problem/update-boilerplate/${id}`, boilerplateData);
        return response.data;
    },

    getProblems: async () => {
        const response = await api.get('/problem/get-problems');
        return response.data;
    },

    getProblem: async (id) => {
        const response = await api.get(`/problem/${id}`);
        return response.data;
    },

    deleteProblem: async (id) => {
        const response = await api.delete(`/problem/delete-problem/${id}`);
        return response.data;
    },
};

// Admin User Management API
export const adminAPI = {
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    updateUserRole: async (userId, role) => {
        const response = await api.put('/admin/users/role', { userId, role });
        return response.data;
    },

    createAdmin: async (adminData) => {
        const response = await api.post('/admin/users/create-admin', adminData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },
};

// Feedback API
export const feedbackAPI = {
    submitFeedback: async (feedbackData) => {
        const response = await api.post('/feedback/submit', feedbackData);
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
