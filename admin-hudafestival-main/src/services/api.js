import axios from "axios";
let baseURL = import.meta.env.VITE_API_URL || '';
if (baseURL && baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
  baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL
});

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');

        if (userInfo) {
            const {token} = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && !error.config.url.includes('/login')) {
            // Token expired or invalid
            localStorage.removeItem('userInfo');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
)

export default api;