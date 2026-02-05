import axios from 'axios';

// API base URL from Vite env (.env / .env.local)
const BASE_URL = import.meta.env.VITE_API_URL;

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const clearAuthTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Dev-only: log base URL once so we can validate the env wiring.
if (import.meta.env.DEV) {
    console.info('[API] baseURL =', BASE_URL);
}

// Attach the Bearer token (if any) to every request.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // Ensure we don't send a stale Authorization header.
        delete config.headers.Authorization;
    }

    if (import.meta.env.DEV) {
        const method = config.method?.toUpperCase?.() ?? 'GET';
        const url = config.url ?? '';
        console.debug(`[API] ${method} ${url}`, {
            baseURL: config.baseURL,
            hasToken: !!token,
        });
    }

    return config;
});

// Debug helper: log API errors in development so they're visible even if a
// component handles them silently.
api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            const method = response.config?.method?.toUpperCase?.() ?? 'GET';
            const url = response.config?.url ?? '';
            console.debug(`[API] ${method} ${url} -> ${response.status}`);
        }
        return response;
    },
    (error) => {
        if (import.meta.env.DEV) {
            const method = error?.config?.method?.toUpperCase?.() ?? 'UNKNOWN';
            const url = error?.config?.url ?? 'UNKNOWN_URL';
            const status = error?.response?.status;
            console.error(`[API] ${method} ${url} failed`, { status, error });
        }
        return Promise.reject(error);
    },
);
