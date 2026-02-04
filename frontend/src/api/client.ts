import axios from 'axios';

// On récupère l'adresse qu'on a mise dans le .env
const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// On intercepte chaque requête AVANT qu'elle parte
api.interceptors.request.use((config) => {
    // 1. On regarde dans le "localStorage" (la poche du navigateur)
    const token = localStorage.getItem('access_token');

    // 2. Si on trouve un token, on l'ajoute dans l'en-tête "Authorization"
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});