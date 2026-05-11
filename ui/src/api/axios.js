import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
});

// 请求拦截器
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 未授权：登录接口直接抛错，其他接口清除 token 跳转登录页
        if (error.response?.status === 401) {
            if (error.config.url === '/auth/login') {
                return Promise.reject(error);
            }
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;
